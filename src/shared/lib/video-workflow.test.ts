import assert from 'node:assert/strict';
import test from 'node:test';

import enPricing from '@/config/locale/messages/en/pages/pricing.json';
import zhPricing from '@/config/locale/messages/zh/pages/pricing.json';

import { estimateVideoBudget } from './video-budget';
import {
  normalizeVideoDraft,
  readVideoDraft,
  VIDEO_DRAFT_TTL,
} from './video-draft';

test('budget uses the full payment, complete clips and unused remainder in both locales', () => {
  for (const pricing of [enPricing, zhPricing]) {
    const plan = pricing.page.sections.pricing.items.find(
      (p) => p.product_id === 'pack_starter'
    )!;
    assert.deepEqual(estimateVideoBudget(plan, 60), {
      payment: 9.9,
      dollarsPerVideo: 3.96,
      completeVideos: 2,
      leftoverCredits: 30,
    });
    const annual = pricing.page.sections.pricing.items.find(
      (p) => p.product_id === 'plus_yearly'
    )!;
    assert.equal(estimateVideoBudget(annual, 30).payment, 199);
    assert.equal(estimateVideoBudget(annual, 30).completeVideos, 180);
  }
});

test('draft restoration revalidates model limits and strips unsupported inputs', () => {
  assert.equal(normalizeVideoDraft({ model: '__proto__' }), null);
  const draft = normalizeVideoDraft({
    model: 'seedance-2.0-mini',
    duration: 30,
    resolution: '4K',
    scene: 'image-to-video',
    referenceUrls: [
      'javascript:alert(1)',
      'https://example.com/1',
      'https://example.com/2',
      'https://example.com/3',
    ],
    prompt: 'Private prompt',
  })!;
  assert.equal(draft.duration, 5);
  assert.equal(draft.resolution, '480p');
  assert.equal(draft.referenceUrls.length, 2);
  assert.equal(draft.prompt, 'Private prompt');
});

test('sign-in draft is one-use, same-route and expires; disabled storage is harmless', () => {
  let removed = false;
  const now = Date.now();
  const raw = (time: number, path = '/ai-video-generator') =>
    JSON.stringify({
      savedAt: time,
      path,
      draft: { model: 'seedance-2.5', prompt: 'Saved direction' },
    });
  const storage = (value: string) => ({
    getItem: () => value,
    removeItem: () => {
      removed = true;
    },
  });
  assert.equal(
    readVideoDraft(storage(raw(now)), '/ai-video-generator', now)?.prompt,
    'Saved direction'
  );
  assert.equal(removed, true);
  assert.equal(
    readVideoDraft(
      storage(raw(now, '/ai-video-generator?sample=product-25')),
      '/ai-video-generator',
      now
    )?.prompt,
    'Saved direction'
  );
  assert.equal(
    readVideoDraft(
      storage(raw(now, '/ai-video-generator?sample=product-25')),
      '/ai-video-generator?sample=camera-25',
      now
    ),
    null
  );
  assert.equal(
    readVideoDraft(
      storage(raw(now - VIDEO_DRAFT_TTL - 1)),
      '/ai-video-generator',
      now
    ),
    null
  );
  assert.equal(
    readVideoDraft(storage(raw(now, '/')), '/ai-video-generator', now),
    null
  );
  assert.equal(
    readVideoDraft(
      {
        getItem() {
          throw new Error('blocked');
        },
        removeItem() {},
      },
      '/'
    ),
    null
  );
});
