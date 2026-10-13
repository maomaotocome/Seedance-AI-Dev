import { PaymentType } from '@/extensions/payment/types';
import { getOrders, OrderStatus } from '@/shared/models/order';

// A buyer can move up to a larger credit pack within this window and pay only
// the price difference.
export const PACK_UPGRADE_WINDOW_MS = 24 * 60 * 60 * 1000;

export type PackPricingItem = {
  product_id: string;
  group?: string;
  interval?: string;
  amount: number;
  credits: number;
  currency?: string;
  plan_name?: string;
  title?: string;
};

export type PackUpgradeTier = {
  item: PackPricingItem;
  paidAt: Date;
  expiresAt: Date;
  // false once a subscription has already used this pack as a first-payment credit
  subscriptionCreditAvailable: boolean;
};

export function isCreditPack(item?: { group?: string }) {
  return item?.group === 'packs';
}

// The tier a user has already paid up to: the most expensive pack among their
// paid pack orders inside the upgrade window. Upgrade orders are stored under
// the target pack's product_id, so chained upgrades resolve correctly.
export async function getPackUpgradeTier({
  userId,
  items,
  now = new Date(),
}: {
  userId: string;
  items: PackPricingItem[];
  now?: Date;
}): Promise<PackUpgradeTier | null> {
  const packs = new Map(
    items.filter(isCreditPack).map((item) => [item.product_id, item])
  );
  if (packs.size === 0) return null;

  const orders = await getOrders({
    userId,
    status: OrderStatus.PAID,
    paymentType: PaymentType.ONE_TIME,
    limit: 30,
  });

  let tier: Omit<PackUpgradeTier, 'subscriptionCreditAvailable'> | null = null;
  for (const order of orders) {
    const item = order.productId ? packs.get(order.productId) : undefined;
    const paidAt = order.paidAt || order.createdAt;
    if (!item || !paidAt) continue;

    const expiresAt = new Date(
      new Date(paidAt).getTime() + PACK_UPGRADE_WINDOW_MS
    );
    if (expiresAt <= now) continue;

    if (!tier || item.amount > tier.item.amount) {
      tier = { item, paidAt: new Date(paidAt), expiresAt };
    }
  }

  if (!tier) return null;

  const subscriptions = await getOrders({
    userId,
    status: OrderStatus.PAID,
    paymentType: PaymentType.SUBSCRIPTION,
    limit: 5,
  });
  const usedForSubscription = subscriptions.some((order) => {
    const paidAt = order.paidAt || order.createdAt;
    return paidAt && new Date(paidAt) >= tier.paidAt;
  });

  return { ...tier, subscriptionCreditAvailable: !usedForSubscription };
}

export function isSubscriptionItem(item?: { interval?: string }) {
  return item?.interval === 'month' || item?.interval === 'year';
}

// A recent pack purchase counts toward the first payment of a subscription.
// The pack credits stay in the account; the subscription grants its full
// allowance.
export function getSubscriptionCreditQuote(
  target: PackPricingItem,
  tier: PackUpgradeTier | null
) {
  if (!tier || !tier.subscriptionCreditAvailable) return null;
  if (!isSubscriptionItem(target)) return null;
  if (target.amount <= tier.item.amount) return null;

  return {
    fromProductId: tier.item.product_id,
    fromName: tier.item.plan_name || tier.item.title || tier.item.product_id,
    amountOff: tier.item.amount,
    firstPayment: target.amount - tier.item.amount,
    expiresAt: tier.expiresAt,
  };
}

export function getPackUpgradeQuote(
  target: PackPricingItem,
  tier: PackUpgradeTier | null
) {
  if (!tier || !isCreditPack(target)) return null;
  if (target.amount <= tier.item.amount) return null;
  if (target.credits <= tier.item.credits) return null;

  return {
    fromProductId: tier.item.product_id,
    fromName: tier.item.plan_name || tier.item.title || tier.item.product_id,
    amount: target.amount - tier.item.amount,
    credits: target.credits - tier.item.credits,
    expiresAt: tier.expiresAt,
  };
}
