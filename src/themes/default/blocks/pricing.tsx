'use client';

import { useEffect, useState } from 'react';
import { Check, Loader } from 'lucide-react';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';

import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { Button } from '@/shared/components/ui/button';
import { useAppContext } from '@/shared/contexts/app';
import { trackAnalyticsEvent } from '@/shared/lib/analytics';
import { cn } from '@/shared/lib/utils';

interface PricingItem {
  title?: string;
  group?: string;
  price?: string;
  description?: string;
  button?: { title: string; url: string; icon?: string };
  is_featured?: boolean;
  feature?: Array<{ title: string; list: string[] }>;
  product_id?: string;
  currency?: string;
  amount?: number;
  interval?: string;
  plan_name?: string;
  original_price?: string;
  tip?: string;
  label?: string;
  credits?: number;
}

interface PricingGroup {
  name: string;
  title: string;
}

const formatUsd = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export function Pricing({ section }: { section: any }) {
  const locale = useLocale();
  const isZh = locale.startsWith('zh');
  const { user, setIsShowSignModal } = useAppContext();
  const pricing = section;
  const groups: PricingGroup[] = pricing?.groups || [];
  const [group, setGroup] = useState<string>(groups[0]?.name || 'packs');
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  // The pack this buyer already paid for inside the upgrade window, if any.
  const [offer, setOffer] = useState<{
    fromId: string;
    subscriptionCredit: boolean;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      setOffer(null);
      return;
    }

    let cancelled = false;
    fetch('/api/payment/upgrade-offer', { method: 'POST' })
      .then((response) => response.json())
      .then(({ data }) => {
        if (cancelled) return;
        setOffer(
          data?.offer?.from_product_id
            ? {
                fromId: data.offer.from_product_id,
                subscriptionCredit: Boolean(data.offer.subscription_credit),
              }
            : null
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!pricing || pricing.disabled) return null;

  const allItems: PricingItem[] = pricing.items || [];
  const items = allItems.filter((item) => item.group === group);
  const upgradeFrom = allItems.find(
    (item) => offer && item.product_id === offer.fromId
  );

  const handleCheckout = async (item: PricingItem) => {
    if (!user) {
      setIsShowSignModal(true);
      return;
    }

    try {
      setLoadingProductId(item.product_id || null);
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: item.product_id,
          currency: item.currency,
          locale,
        }),
      });

      if (response.status === 401) {
        setIsShowSignModal(true);
        return;
      }

      const { code, message, data } = await response.json();
      if (code !== 0) {
        toast.error(message);
        return;
      }

      const checkoutUrl = data?.checkoutUrl || data?.checkout_url;
      if (!checkoutUrl) {
        toast.error(isZh ? '无法开始结账' : 'Unable to start checkout');
        return;
      }

      const checkoutAnalytics = data?.analytics;
      const checkoutItem = checkoutAnalytics?.item;
      trackAnalyticsEvent('begin_checkout', {
        billing_interval:
          checkoutAnalytics?.billing_interval ||
          item.interval ||
          item.group ||
          'unknown',
        currency: checkoutAnalytics?.currency || item.currency || 'USD',
        value:
          typeof checkoutAnalytics?.value === 'number'
            ? checkoutAnalytics.value
            : typeof item.amount === 'number'
              ? item.amount / 100
              : 0,
        items: checkoutItem
          ? [checkoutItem]
          : [
              {
                item_id: item.product_id || 'unknown',
                item_name: item.plan_name || item.title || 'unknown',
                item_category: 'credit_plan',
                item_variant: item.interval || item.group || 'unknown',
                price: typeof item.amount === 'number' ? item.amount / 100 : 0,
                quantity: 1,
              },
            ],
      });
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('checkout failed', error);
      toast.error(isZh ? '无法开始结账' : 'Unable to start checkout');
    } finally {
      setLoadingProductId(null);
    }
  };

  return (
    <section
      id={pricing.id || 'pricing'}
      className="bg-director-paper text-director-paper-text"
    >
      <header className="border-director-rule-dark bg-director-ink text-director-ink-text border-b pt-24 pb-32 lg:pt-28 lg:pb-40">
        <div className="container mx-auto max-w-6xl">
          <p className="text-director-orange font-mono text-[11px] tracking-[0.17em] uppercase">
            {isZh ? '透明计费' : 'Transparent credits'}
          </p>
          <h1 className="mt-5 max-w-[16ch] text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.94] font-semibold tracking-[-0.035em] text-balance">
            {pricing.title}
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-white/68">
            {pricing.description}
          </p>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl py-14 lg:py-20">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-5 border-b border-black/12 pb-6">
          <div>
            <p className="font-mono text-[10px] tracking-[0.16em] text-black/45 uppercase">
              {isZh ? '购买方式' : 'How to buy'}
            </p>
            <p className="mt-2 text-sm leading-6 text-black/60">
              {isZh
                ? '订阅的每积分价格最低。积分包为一次性付款；购买后 24 小时内，积分包的价格可以抵扣订阅首期或用于升级更大的积分包。'
                : 'Subscriptions give the lowest price per credit. Credit packs are one-time; within 24 hours of buying one, its price counts toward a subscription or a larger pack.'}
            </p>
          </div>
          <div
            className="bg-director-paper-3 inline-flex border border-black/15 p-1"
            role="group"
            aria-label={isZh ? '选择购买方式' : 'Choose how to buy'}
          >
            {groups.map((option) => (
              <button
                key={option.name}
                type="button"
                aria-pressed={group === option.name}
                onClick={() => setGroup(option.name)}
                className={cn(
                  'focus-visible:outline-director-focus h-10 px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
                  group === option.name
                    ? 'bg-director-ink text-white'
                    : 'text-black/58 hover:text-black'
                )}
              >
                {option.title}
              </button>
            ))}
          </div>
        </div>

        <div
          className={cn(
            'grid gap-px border border-black/12 bg-black/12 sm:grid-cols-2',
            items.length === 3 && 'lg:grid-cols-3',
            items.length > 3 && 'xl:grid-cols-4'
          )}
        >
          {items.map((item) => {
            const plan = { name: item.title, isPopular: item.is_featured };
            const isLoading = loadingProductId === item.product_id;
            const isSubscription =
              item.interval === 'month' || item.interval === 'year';
            const upgrade =
              upgradeFrom &&
              !isSubscription &&
              (item.amount || 0) > (upgradeFrom.amount || 0) &&
              (item.credits || 0) > (upgradeFrom.credits || 0)
                ? {
                    amount: (item.amount || 0) - (upgradeFrom.amount || 0),
                    credits: (item.credits || 0) - (upgradeFrom.credits || 0),
                  }
                : null;
            const subscriptionCredit =
              upgradeFrom &&
              offer?.subscriptionCredit &&
              isSubscription &&
              (item.amount || 0) > (upgradeFrom.amount || 0)
                ? {
                    pack: upgradeFrom.title,
                    firstPayment:
                      (item.amount || 0) - (upgradeFrom.amount || 0),
                  }
                : null;

            return (
              <article
                key={item.product_id}
                className={cn(
                  'bg-director-paper relative flex min-w-0 flex-col p-7 lg:p-8',
                  plan.isPopular && 'bg-director-paper-2'
                )}
              >
                {plan.isPopular && (
                  <span className="bg-director-orange text-director-orange-ink absolute top-0 right-0 px-3 py-1.5 font-mono text-[10px] font-semibold tracking-[0.12em] uppercase">
                    {item.label || (isZh ? '推荐' : 'Recommended')}
                  </span>
                )}
                <h2 className="font-mono text-[11px] tracking-[0.14em] text-black/45 uppercase">
                  {plan.name}
                </h2>
                <div className="mt-7 flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-[-0.05em]">
                    {item.price || '$0'}
                  </span>
                  <span className="pb-1.5 text-sm text-black/48">
                    {isSubscription
                      ? `/ ${isZh ? '月' : 'month'}${item.interval === 'year' ? (isZh ? '，按年付' : ', billed yearly') : ''}`
                      : isZh
                        ? '一次性'
                        : 'one-time'}
                  </span>
                </div>
                {subscriptionCredit && (
                  <p className="border-director-orange bg-director-orange/8 mt-4 border-l-2 px-3 py-2 text-sm leading-6 font-medium">
                    {isZh
                      ? `${subscriptionCredit.pack} 积分包抵扣首期：今天只付 ${formatUsd(subscriptionCredit.firstPayment)}`
                      : `Your ${subscriptionCredit.pack} pack counts toward the first payment: pay ${formatUsd(subscriptionCredit.firstPayment)} today`}
                  </p>
                )}
                {upgrade && (
                  <p className="border-director-orange bg-director-orange/8 mt-4 border-l-2 px-3 py-2 text-sm leading-6 font-medium">
                    {isZh
                      ? `补差价升级：支付 ${formatUsd(upgrade.amount)}，获得 ${upgrade.credits.toLocaleString()} 积分`
                      : `Upgrade price: pay ${formatUsd(upgrade.amount)}, get ${upgrade.credits.toLocaleString()} credits`}
                  </p>
                )}
                {item.original_price && (
                  <p className="mt-2 text-sm text-black/42 line-through">
                    {item.original_price}
                  </p>
                )}
                <p className="mt-3 min-h-12 text-sm leading-6 text-black/62">
                  {item.description}
                </p>
                <p className="border-director-amber mt-3 border-l-2 pl-3 font-mono text-[11px] leading-5 text-black/54">
                  {item.tip}
                </p>

                <div className="mt-8 flex-1 space-y-6 border-t border-black/12 pt-6">
                  {item.feature?.map((group) => (
                    <div key={group.title}>
                      <h3 className="font-mono text-[10px] tracking-[0.15em] text-black/45 uppercase">
                        {group.title}
                      </h3>
                      <ul className="mt-3 space-y-2.5">
                        {group.list.map((feature) => (
                          <li
                            key={feature}
                            className="flex gap-2.5 text-sm leading-6 text-black/68"
                          >
                            <Check className="text-director-orange-text mt-1 size-4 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <Button
                  className={cn(
                    'focus-visible:outline-director-focus mt-8 h-12 w-full rounded-md text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2',
                    plan.isPopular
                      ? 'bg-director-orange text-director-orange-ink hover:bg-director-orange-hover'
                      : 'bg-director-ink hover:bg-director-carbon text-white'
                  )}
                  disabled={Boolean(loadingProductId)}
                  onClick={() => handleCheckout(item)}
                >
                  {isLoading ? (
                    <Loader className="size-4 animate-spin" />
                  ) : (
                    <>
                      {upgrade
                        ? isZh
                          ? '补差价升级'
                          : 'Upgrade and pay the difference'
                        : item.button?.title ||
                          (isZh ? '开始创作' : 'Get started')}
                      {item.button?.icon && (
                        <SmartIcon name={item.button.icon} className="size-4" />
                      )}
                    </>
                  )}
                </Button>
              </article>
            );
          })}
        </div>

        <p className="mt-8 max-w-3xl text-sm leading-6 text-black/58">
          {isZh
            ? '提交前会显示精确积分成本。仅供应商确认失败的任务才会自动退回积分；付款与退款受结账页展示的条款约束。'
            : 'The exact credit cost is shown before submission. Credits are automatically returned only for provider-confirmed failed tasks; payments and refunds follow the terms shown at checkout.'}
        </p>
      </div>
    </section>
  );
}
