import { eq } from 'drizzle-orm';

import { aiTask } from '@/config/db/schema';

import { refundConsumption } from './credit-refund';
import { ledgerTransaction } from './ledger-transaction';

type Task = typeof aiTask.$inferSelect;
type TaskUpdate = Partial<Omit<typeof aiTask.$inferInsert, 'id' | 'createdAt'>>;

export function taskUpdateChanged(task: Task, update: TaskUpdate) {
  return (
    update.status !== task.status ||
    update.taskInfo !== task.taskInfo ||
    update.taskResult !== task.taskResult
  );
}

export function persistAITaskUpdate(
  database: any,
  id: string,
  update: TaskUpdate
): Promise<Task | undefined> {
  return ledgerTransaction(database, async (tx) => {
    let query = tx.select().from(aiTask).where(eq(aiTask.id, id));
    if (typeof query.for === 'function') query = query.for('update');
    const [task] = await query;
    if (!task) return;
    // Ignore a stale in-flight poll that arrives after a terminal transition.
    if (
      (task.status === 'success' || task.status === 'failed') &&
      update.status !== task.status
    )
      return task;
    if (update.status === 'failed' && task.creditId)
      await refundConsumption(tx, task.creditId, task.userId);
    const [result] = await tx
      .update(aiTask)
      .set(update)
      .where(eq(aiTask.id, id))
      .returning();
    return result;
  });
}
