import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createClient } from '@libsql/client';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';

import { aiTask, credit } from '@/config/db/schema';
import { consumeCredits } from '@/shared/models/credit';

import { refundConsumption } from './credit-refund';
import { grantInitialCredits } from './initial-credits';
import { ledgerTransaction } from './ledger-transaction';
import { persistAITaskUpdate, taskUpdateChanged } from './task-update';

async function fixture() {
  const directory = mkdtempSync(join(tmpdir(), 'seedance-ledger-'));
  const client = createClient({ url: `file:${join(directory, 'ledger.db')}` });
  await client.execute('PRAGMA journal_mode = WAL');
  await client.executeMultiple(`
    CREATE TABLE credit (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, user_email TEXT, order_no TEXT,
      subscription_no TEXT, transaction_no TEXT UNIQUE NOT NULL, transaction_type TEXT NOT NULL,
      transaction_scene TEXT, credits INTEGER NOT NULL, remaining_credits INTEGER NOT NULL DEFAULT 0,
      description TEXT, expires_at INTEGER, status TEXT NOT NULL, created_at INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL DEFAULT 0, deleted_at INTEGER, consumed_detail TEXT, metadata TEXT);
    CREATE TABLE ai_task (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, media_type TEXT NOT NULL,
      provider TEXT NOT NULL, model TEXT NOT NULL, prompt TEXT NOT NULL, options TEXT, status TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL DEFAULT 0, deleted_at INTEGER,
      task_id TEXT, task_info TEXT, task_result TEXT, cost_credits INTEGER NOT NULL DEFAULT 0,
      scene TEXT NOT NULL DEFAULT '', credit_id TEXT);
    CREATE TABLE session (id TEXT PRIMARY KEY, user_id TEXT, ip_address TEXT, created_at INTEGER);
  `);
  return {
    client: {
      execute: client.execute.bind(client),
      close() {
        client.close();
        rmSync(directory, { recursive: true, force: true });
      },
    },
    database: drizzle(client),
  };
}
const configs = {
  initial_credits_enabled: 'true',
  initial_credits_amount: '5',
  initial_credits_valid_days: '30',
};
const verified = {
  id: 'user-a',
  email: 'test@example.com',
  emailVerified: true,
  ip: '192.0.2.1',
};

test('consumption crosses grant batches without skipping rows and refunds the exact split', async () => {
  const { client, database } = await fixture();
  try {
    const grants = Array.from({ length: 1001 }, (_, index) => ({
      id: `grant-${String(index).padStart(4, '0')}`,
      transactionNo: `grant-${index}`,
      userId: verified.id,
      transactionType: 'grant',
      credits: 1,
      remainingCredits: 1,
      status: 'active',
      expiresAt: new Date(Date.now() + 86_400_000),
    }));
    // Keep each insert below SQLite's bind-variable limit.
    for (let index = 0; index < grants.length; index += 40) {
      await database.insert(credit).values(grants.slice(index, index + 40));
    }
    await database.insert(credit).values({
      id: 'never-expires',
      transactionNo: 'permanent',
      userId: verified.id,
      transactionType: 'grant',
      credits: 10,
      remainingCredits: 10,
      status: 'active',
    });
    const charge = await ledgerTransaction(database, (tx) =>
      consumeCredits({ userId: verified.id, credits: 1001, tx })
    );
    const details = JSON.parse(charge.consumedDetail!);
    assert.equal(details.length, 1001);
    assert.equal(details.at(-1).batchNo, 2);
    let rows = await database.select().from(credit);
    assert.equal(
      rows.find((row) => row.id === 'never-expires')!.remainingCredits,
      10
    );
    assert.equal(
      rows
        .filter((row) => row.id.startsWith('grant-'))
        .reduce((n, row) => n + row.remainingCredits, 0),
      0
    );
    await ledgerTransaction(database, (tx) =>
      refundConsumption(tx, charge.id!, verified.id)
    );
    rows = await database.select().from(credit);
    assert.equal(
      rows
        .filter((row) => row.id.startsWith('grant-'))
        .reduce((n, row) => n + row.remainingCredits, 0),
      1001
    );
    await assert.rejects(
      ledgerTransaction(database, (tx) =>
        consumeCredits({ userId: verified.id, credits: 1012, tx })
      ),
      /Insufficient credits/
    );
    await assert.rejects(
      consumeCredits({ userId: verified.id, credits: -1, tx: database }),
      /Invalid credit amount/
    );
    assert.equal(
      (await database.select().from(credit)).filter(
        (row) => row.transactionType === 'consume'
      ).length,
      1
    );
  } finally {
    client.close();
  }
});

test('unverified signup then verification grants once; retries cannot refill spent credits', async () => {
  const { client, database } = await fixture();
  try {
    await grantInitialCredits(
      database,
      { ...verified, emailVerified: false },
      configs
    );
    assert.equal((await database.select().from(credit)).length, 0);
    const grant = await grantInitialCredits(database, verified, configs);
    assert.equal(grant.remainingCredits, 5);
    await database
      .update(credit)
      .set({ remainingCredits: 0, status: 'expired' })
      .where(eq(credit.id, grant.id));
    await Promise.all([
      grantInitialCredits(database, verified, configs),
      grantInitialCredits(database, verified, configs),
    ]);
    const rows = await database.select().from(credit);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].remainingCredits, 0);
  } finally {
    client.close();
  }
});

test('verified OAuth and concurrent verification callbacks share one allowance', async () => {
  const { client, database } = await fixture();
  try {
    await Promise.all([
      grantInitialCredits(database, verified, configs),
      grantInitialCredits(database, verified, configs),
    ]);
    const rows = await database.select().from(credit);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].remainingCredits, 5);
  } finally {
    client.close();
  }
});

test('disabled, disposable, invalid amounts, repeat IP and legacy gifts do not get a new allowance', async () => {
  const { client, database } = await fixture();
  try {
    await grantInitialCredits(database, verified, {
      ...configs,
      initial_credits_enabled: 'false',
    });
    await grantInitialCredits(
      database,
      { ...verified, email: 'x@mailinator.com' },
      configs
    );
    await grantInitialCredits(database, verified, {
      ...configs,
      initial_credits_amount: '5oops',
    });
    await client.execute({
      sql: 'INSERT INTO session VALUES (?, ?, ?, ?)',
      args: ['s', 'another-user', verified.ip, Date.now()],
    });
    await grantInitialCredits(database, verified, configs, '192.0.2.9');
    assert.equal((await database.select().from(credit)).length, 0);
    await client.execute('DELETE FROM session');
    await database.insert(credit).values({
      id: 'old-random-grant',
      transactionNo: 'old',
      userId: verified.id,
      transactionType: 'grant',
      transactionScene: 'gift',
      credits: 5,
      remainingCredits: 0,
      status: 'expired',
    });
    await grantInitialCredits(database, verified, configs);
    assert.equal((await database.select().from(credit)).length, 1);
  } finally {
    client.close();
  }
});

test('confirmed failure refunds once even with simultaneous repeated polls', async () => {
  const { client, database } = await fixture();
  try {
    await database.insert(credit).values([
      {
        id: 'grant',
        transactionNo: 'g',
        userId: verified.id,
        transactionType: 'grant',
        credits: 30,
        remainingCredits: 0,
        status: 'active',
      },
      {
        id: 'charge',
        transactionNo: 'c',
        userId: verified.id,
        transactionType: 'consume',
        credits: -30,
        status: 'active',
        consumedDetail: JSON.stringify([
          { creditId: 'grant', creditsConsumed: 30 },
        ]),
      },
    ]);
    const refund = () =>
      ledgerTransaction(database, (tx) =>
        refundConsumption(tx, 'charge', verified.id)
      );
    await Promise.all([refund(), refund(), refund()]);
    const [grant] = await database
      .select()
      .from(credit)
      .where(eq(credit.id, 'grant'));
    assert.equal(grant.remainingCredits, 30);
    assert.equal(await refund(), false);
  } finally {
    client.close();
  }
});

test('a corrupt refund rolls back its claim and never credits another account', async () => {
  const { client, database } = await fixture();
  try {
    await database.insert(credit).values([
      {
        id: 'other-grant',
        transactionNo: 'g',
        userId: 'other',
        transactionType: 'grant',
        credits: 30,
        remainingCredits: 0,
        status: 'active',
      },
      {
        id: 'charge',
        transactionNo: 'c',
        userId: verified.id,
        transactionType: 'consume',
        credits: -30,
        status: 'active',
        consumedDetail: JSON.stringify([
          { creditId: 'other-grant', creditsConsumed: 30 },
        ]),
      },
    ]);
    await assert.rejects(
      database.transaction((tx) =>
        refundConsumption(tx, 'charge', verified.id)
      ),
      /Refund grant missing/
    );
    const rows = await database.select().from(credit);
    assert.equal(rows.find((row) => row.id === 'charge')!.status, 'active');
    assert.equal(
      rows.find((row) => row.id === 'other-grant')!.remainingCredits,
      0
    );
  } finally {
    client.close();
  }
});

test('status-only failure persists and returns split credits; stale processing polls cannot revive it', async () => {
  const { client, database } = await fixture();
  try {
    await database.insert(credit).values([
      {
        id: 'grant-a',
        transactionNo: 'a',
        userId: verified.id,
        transactionType: 'grant',
        credits: 10,
        remainingCredits: 0,
        status: 'active',
      },
      {
        id: 'grant-b',
        transactionNo: 'b',
        userId: verified.id,
        transactionType: 'grant',
        credits: 20,
        remainingCredits: 0,
        status: 'active',
      },
      {
        id: 'charge',
        transactionNo: 'c',
        userId: verified.id,
        transactionType: 'consume',
        credits: -30,
        status: 'active',
        consumedDetail: JSON.stringify([
          { creditId: 'grant-a', creditsConsumed: 10 },
          { creditId: 'grant-b', creditsConsumed: 20 },
        ]),
      },
    ]);
    const [task] = await database
      .insert(aiTask)
      .values({
        id: 'task',
        userId: verified.id,
        mediaType: 'video',
        provider: 'test-provider',
        model: 'seedance-2.5',
        prompt: 'test',
        status: 'processing',
        creditId: 'charge',
        costCredits: 30,
      })
      .returning();
    const failure = { status: 'failed', taskInfo: null, taskResult: null };
    assert.equal(taskUpdateChanged(task, failure), true);
    const failed = await persistAITaskUpdate(database, task.id, failure);
    assert.equal(failed?.status, 'failed');
    await persistAITaskUpdate(database, task.id, failure);
    assert.equal(
      (await persistAITaskUpdate(database, task.id, { status: 'processing' }))
        ?.status,
      'failed'
    );
    const grants = await database.select().from(credit);
    assert.equal(
      grants.find((row) => row.id === 'grant-a')!.remainingCredits,
      10
    );
    assert.equal(
      grants.find((row) => row.id === 'grant-b')!.remainingCredits,
      20
    );
  } finally {
    client.close();
  }
});
