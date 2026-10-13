import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getPackUpgradeQuote,
  getSubscriptionCreditQuote,
} from '../shared/services/pack-upgrade';
import enPricing from './locale/messages/en/pages/pricing.json';
import enComparison from './locale/messages/en/pages/seedance-2-5-vs-2-0.json';
import zhPricing from './locale/messages/zh/pages/pricing.json';
import zhComparison from './locale/messages/zh/pages/seedance-2-5-vs-2-0.json';

type PricingItem = {
  product_id: string;
  amount: number;
  credits: number;
};

function getItems(data: typeof enPricing) {
  return data.page.sections.pricing.items as PricingItem[];
}

test('keeps the approved subscriptions and trial credit packs', () => {
  const expected = {
    plus_monthly: { amount: 1990, credits: 450 },
    pro_monthly: { amount: 4990, credits: 1250 },
    max_monthly: { amount: 9990, credits: 2600 },
    plus_yearly: { amount: 19900, credits: 5400 },
    pro_yearly: { amount: 49900, credits: 15000 },
    max_yearly: { amount: 99900, credits: 31200 },
    pack_starter: { amount: 990, credits: 150 },
    pack_creator: { amount: 2990, credits: 600 },
  };

  const items = getItems(enPricing);
  assert.deepEqual(
    items.map((item) => item.product_id).sort(),
    Object.keys(expected).sort()
  );

  for (const item of items) {
    assert.deepEqual(
      { amount: item.amount, credits: item.credits },
      expected[item.product_id as keyof typeof expected]
    );
  }
});

test('never sells a credit below the highest provider cost per credit', () => {
  // Seedance 2.5 at 720p is the most expensive credit to fulfil:
  // $0.315 per second for 12 credits.
  const highestCostPerCredit = 0.315 / 12;

  for (const item of getItems(enPricing)) {
    const pricePerCredit = item.amount / 100 / item.credits;
    assert.ok(
      pricePerCredit > highestCostPerCredit * 1.2,
      `${item.product_id} leaves less than a 20% margin over provider cost`
    );
  }
});

test('quotes a pack upgrade as the price and credit difference', () => {
  const items = getItems(enPricing) as Array<
    PricingItem & { group: string; interval: string }
  >;
  const find = (id: string) => items.find((item) => item.product_id === id)!;
  const tier = {
    item: find('pack_starter'),
    paidAt: new Date(),
    expiresAt: new Date(Date.now() + 1000),
    subscriptionCreditAvailable: true,
  };

  const quote = getPackUpgradeQuote(find('pack_creator'), tier);
  assert.equal(quote?.amount, 2000);
  assert.equal(quote?.credits, 450);
  assert.equal(getPackUpgradeQuote(find('pack_starter'), tier), null);
  assert.equal(getPackUpgradeQuote(find('plus_monthly'), tier), null);
  assert.equal(getPackUpgradeQuote(find('pack_creator'), null), null);
});

test('counts a recent pack toward the first subscription payment once', () => {
  const items = getItems(enPricing) as Array<
    PricingItem & { group: string; interval: string }
  >;
  const find = (id: string) => items.find((item) => item.product_id === id)!;
  const tier = {
    item: find('pack_starter'),
    paidAt: new Date(),
    expiresAt: new Date(Date.now() + 1000),
    subscriptionCreditAvailable: true,
  };

  assert.equal(
    getSubscriptionCreditQuote(find('plus_monthly'), tier)?.firstPayment,
    1000
  );
  assert.equal(
    getSubscriptionCreditQuote(find('max_yearly'), tier)?.amountOff,
    990
  );
  assert.equal(getSubscriptionCreditQuote(find('pack_creator'), tier), null);
  assert.equal(
    getSubscriptionCreditQuote(find('plus_monthly'), {
      ...tier,
      subscriptionCreditAvailable: false,
    }),
    null
  );
});

test('keeps English and Chinese commercial values in parity', () => {
  const commercialFields = (items: PricingItem[]) =>
    items.map(({ product_id, amount, credits }) => ({
      product_id,
      amount,
      credits,
    }));

  assert.deepEqual(
    commercialFields(getItems(zhPricing as typeof enPricing)),
    commercialFields(getItems(enPricing))
  );
});

test('publishes the complete Seedance ladder and the five-second 2.5 price', () => {
  const enDescription = enPricing.page.sections.pricing.description;
  const zhDescription = zhPricing.page.sections.pricing.description;

  for (const value of [
    'Seedance 2.5',
    '2.0 Standard',
    '2.0 Fast',
    '2.0 Mini',
    '30 credits',
    '60',
  ]) {
    assert.ok(
      enDescription.includes(value),
      `missing English pricing copy: ${value}`
    );
  }

  for (const value of [
    'Seedance 2.5',
    '2.0 标准版',
    '2.0 Fast',
    '2.0 Mini',
    '30 积分',
    '60 积分',
  ]) {
    assert.ok(
      zhDescription.includes(value),
      `missing Chinese pricing copy: ${value}`
    );
  }
});

test('keeps the comparison table aligned with generator credit rates', () => {
  const comparisonText = [enComparison, zhComparison]
    .map((value) => JSON.stringify(value))
    .join('\n');

  for (const value of [
    '6/sec at 480p; 12/sec at 720p',
    'Standard: 4/8; Fast: 3/5; Mini: 1/2 per second',
    '480p 每秒 6；720p 每秒 12',
    '标准版每秒 4/8；Fast 3/5；Mini 1/2',
  ]) {
    assert.ok(
      comparisonText.includes(value),
      `missing current comparison rate: ${value}`
    );
  }

  for (const staleValue of [
    '5/sec at 480p; 10/sec at 720p',
    'Same published product rates',
    '480p 每秒 5；720p 每秒 10',
    '公开费率相同',
  ]) {
    assert.equal(
      comparisonText.includes(staleValue),
      false,
      `stale comparison rate remains: ${staleValue}`
    );
  }
});
