import { and, eq, sql } from 'drizzle-orm';

import { credit } from '@/config/db/schema';

// Must run in the same transaction as the failed task update. Rollback restores
// both the claim and the balance if any ledger entry is invalid or missing.
export async function refundConsumption(
  tx: any,
  creditId: string,
  userId: string
) {
  const [consumed] = await tx
    .update(credit)
    .set({ status: 'deleted' })
    .where(
      and(
        eq(credit.id, creditId),
        eq(credit.userId, userId),
        eq(credit.transactionType, 'consume'),
        eq(credit.status, 'active')
      )
    )
    .returning();
  if (!consumed) return false;
  const items = JSON.parse(consumed.consumedDetail || '[]');
  if (
    !Array.isArray(items) ||
    items.reduce(
      (sum: number, item: any) =>
        sum +
        (Number.isSafeInteger(item?.creditsConsumed) && item.creditsConsumed > 0
          ? item.creditsConsumed
          : 0),
      0
    ) !== -consumed.credits
  ) {
    throw new Error('Invalid consumption ledger');
  }
  for (const item of items) {
    if (
      !item.creditId ||
      !Number.isSafeInteger(item.creditsConsumed) ||
      item.creditsConsumed <= 0
    ) {
      throw new Error('Invalid refund item');
    }
    const restored = await tx
      .update(credit)
      .set({
        remainingCredits: sql`${credit.remainingCredits} + ${item.creditsConsumed}`,
      })
      .where(
        and(
          eq(credit.id, item.creditId),
          eq(credit.userId, userId),
          eq(credit.transactionType, 'grant')
        )
      )
      .returning({ id: credit.id });
    if (restored.length !== 1) throw new Error('Refund grant missing');
  }
  return true;
}
