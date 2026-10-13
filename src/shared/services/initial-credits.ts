import { and, count, eq, gt, ne } from 'drizzle-orm';

import { credit, session } from '@/config/db/schema';

import { ledgerTransaction } from './ledger-transaction';

const DISPOSABLE_EMAIL_DOMAINS = [
  'mailinator.com',
  'mask.me',
  'mailto.plus',
  'yopmail.com',
  'tempmailbm.com',
  'smails.dev',
  'wren.test',
  'guerrillamail.com',
  'sharklasers.com',
  '10minutemail.com',
  'temp-mail.org',
  'tempmail.com',
  'trashmail.com',
  'getnada.com',
  'maildrop.cc',
  'dispostable.com',
  'fakeinbox.com',
  'emailnator.com',
  'mohmal.com',
  'duck.com',
];

export function isDisposableEmail(email?: string | null) {
  const domain = email?.split('@').pop()?.toLowerCase().trim();
  if (!domain) return true;
  return DISPOSABLE_EMAIL_DOMAINS.some(
    (blocked) => domain === blocked || domain.endsWith(`.${blocked}`)
  );
}

// Called by both verified OAuth creation and email verification. The primary
// key is stable so retries and concurrent callbacks cannot refill the allowance.
export async function grantInitialCredits(
  database: any,
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    ip?: string;
  },
  configs: Record<string, string>,
  ip?: string | null
) {
  const amount = Number(configs.initial_credits_amount);
  if (
    configs.initial_credits_enabled !== 'true' ||
    !user.emailVerified ||
    isDisposableEmail(user.email) ||
    !Number.isSafeInteger(amount) ||
    amount <= 0
  )
    return;
  const signupIp = user.ip || ip;
  return ledgerTransaction(database, async (tx: any) => {
    // Legacy signup grants had random IDs. Conservatively retain existing gifts,
    // including consumed/expired ones, rather than crediting an old account again.
    const [existing] = await tx
      .select({ id: credit.id })
      .from(credit)
      .where(
        and(
          eq(credit.userId, user.id),
          eq(credit.transactionType, 'grant'),
          eq(credit.transactionScene, 'gift')
        )
      )
      .limit(1);
    if (existing) return;
    if (signupIp) {
      const [recent] = await tx
        .select({ count: count() })
        .from(session)
        .where(
          and(
            eq(session.ipAddress, signupIp),
            ne(session.userId, user.id),
            gt(session.createdAt, new Date(Date.now() - 86400000))
          )
        );
      if (recent?.count > 0) return;
    }
    const days = Number(configs.initial_credits_valid_days) || 0;
    const [result] = await tx
      .insert(credit)
      .values({
        id: `initial:${user.id}`,
        transactionNo: `initial:${user.id}`,
        userId: user.id,
        userEmail: user.email,
        orderNo: '',
        subscriptionNo: '',
        transactionType: 'grant',
        transactionScene: 'gift',
        status: 'active',
        credits: amount,
        remainingCredits: amount,
        description: configs.initial_credits_description || 'initial credits',
        expiresAt: days > 0 ? new Date(Date.now() + days * 86400000) : null,
        metadata: JSON.stringify({ type: 'initial-credits', version: 1 }),
      })
      .onConflictDoNothing()
      .returning();
    return result;
  });
}
