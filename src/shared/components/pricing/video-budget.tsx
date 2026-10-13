'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import {
  calculateSeedanceCredits,
  SEEDANCE_PRODUCT_MODELS,
  type SeedanceProductModel,
} from '@/config/seedance';
import { getVideoModelConfig } from '@/config/video-models';
import { trackAnalyticsEvent } from '@/shared/lib/analytics';
import {
  estimateVideoBudget,
  type CreditPlan,
} from '@/shared/lib/video-budget';

export function VideoBudget() {
  const locale = useLocale();
  const zh = locale.startsWith('zh');
  const t = useTranslations('pages.pricing');
  const plans = t.raw('page.sections.pricing.items') as CreditPlan[];
  const [planId, setPlanId] = useState('pack_starter');
  const [model, setModel] = useState<SeedanceProductModel>('seedance-2.5');
  const [resolution, setResolution] = useState('480p');
  const [duration, setDuration] = useState(5);
  const plan = plans.find((p) => p.product_id === planId)!;
  const credits = calculateSeedanceCredits({ model, resolution, duration });
  const estimate = estimateVideoBudget(plan, credits);
  const selectClass =
    'mt-2 h-11 w-full min-w-0 rounded-md border border-black/25 bg-transparent px-3 text-sm font-semibold';
  const billing = (interval: string) =>
    interval === 'month'
      ? zh
        ? '每月'
        : 'monthly'
      : interval === 'year'
        ? zh
          ? '每年'
          : 'yearly'
        : zh
          ? '一次性'
          : 'one-time';
  return (
    <section
      id="video-budget"
      className="scroll-mt-28 border-y border-black/15 py-10"
    >
      <h2 className="text-3xl font-semibold tracking-tight">
        {zh
          ? '一条 Seedance 视频多少钱？'
          : 'How much does a Seedance video cost?'}
      </h2>
      <p className="text-director-paper-muted mt-3 max-w-3xl text-sm leading-6">
        {zh
          ? '按实际积分套餐和所选模型计算。每条美元费用是整包积分充分使用时的折算，不是按条结账价格。'
          : 'Calculated from the actual credit plans and selected model. The dollar cost per video is an allocation of the plan price, not an individual video purchase.'}
      </p>
      <div
        className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        onChange={() =>
          trackAnalyticsEvent('pricing_calculator_used', {
            page_group: 'pricing',
            content_locale: locale,
          })
        }
      >
        <label className="text-xs font-semibold">
          {zh ? '积分套餐' : 'Credit plan'}
          <select
            className={selectClass}
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
          >
            {plans.map((p) => (
              <option key={p.product_id} value={p.product_id}>
                {p.title} · {billing(p.interval)} · $
                {(p.amount / 100).toFixed(2)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold">
          {zh ? '模型' : 'Model'}
          <select
            className={selectClass}
            value={model}
            onChange={(e) => {
              const next = e.target.value as SeedanceProductModel;
              setModel(next);
              if (!getVideoModelConfig(next).durations.includes(duration))
                setDuration(5);
            }}
          >
            {Object.entries(SEEDANCE_PRODUCT_MODELS).map(([id, config]) => (
              <option key={id} value={id}>
                {config.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold">
          {zh ? '分辨率' : 'Resolution'}
          <select
            className={selectClass}
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
          >
            <option>480p</option>
            <option>720p</option>
          </select>
        </label>
        <label className="text-xs font-semibold">
          {zh ? '时长' : 'Duration'}
          <select
            className={selectClass}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            {getVideoModelConfig(model).durations.map((d) => (
              <option key={d} value={d}>
                {d}
                {zh ? ' 秒' : 's'}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div aria-live="polite" className="bg-director-paper-2 mt-6 p-5">
        <p className="text-2xl font-semibold">
          {credits} {zh ? '积分/条' : 'credits/video'}{' '}
          <span className="text-director-orange-text">
            ≈ ${estimate.dollarsPerVideo.toFixed(2)}
          </span>
        </p>
        <p className="mt-3 text-sm leading-7">
          {zh
            ? `支付 $${estimate.payment.toFixed(2)}（${billing(plan.interval)}），获得 ${plan.credits.toLocaleString()} 积分；按当前设置可生成 ${estimate.completeVideos} 条完整视频，剩余 ${estimate.leftoverCredits} 积分。`
            : `$${estimate.payment.toFixed(2)} ${billing(plan.interval)} buys ${plan.credits.toLocaleString('en-US')} credits: ${estimate.completeVideos} complete videos at these settings, with ${estimate.leftoverCredits} credits left over.`}
        </p>
        <p className="mt-1 text-sm leading-7">
          {zh
            ? `积分有效期：${plan.valid_days} 天。时长、分辨率或模型变更都会影响条数；未用积分不折现。`
            : `Credit validity: ${plan.valid_days} days. Changing duration, resolution or model changes the count. Unused credits are not cash.`}
        </p>
      </div>
    </section>
  );
}
