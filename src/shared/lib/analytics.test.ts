import assert from 'node:assert/strict';
import test from 'node:test';

import { getAnalyticsPageGroup } from './analytics';

test('maps English and Chinese search routes to stable page groups', () => {
  assert.equal(getAnalyticsPageGroup('/'), 'home');
  assert.equal(getAnalyticsPageGroup('/zh'), 'home');
  assert.equal(getAnalyticsPageGroup('/ai-video-generator'), 'generator');
  assert.equal(getAnalyticsPageGroup('/zh/ai-video-generator'), 'generator');
  assert.equal(getAnalyticsPageGroup('/seedance-2-5-free'), 'free');
  assert.equal(getAnalyticsPageGroup('/zh/seedance-2-5-api'), 'api');
  assert.equal(getAnalyticsPageGroup('/pricing'), 'pricing');
});

test('groups model landing pages without creating high-cardinality values', () => {
  for (const pathname of [
    '/seedance-2-0',
    '/kling-3-0-ai-video-generator',
    '/wan-2-7-video-generator',
    '/minimax-h3-video-generator',
    '/grok-imagine-video-1-5',
    '/zh/kling-3-0-ai-video-generator',
  ]) {
    assert.equal(getAnalyticsPageGroup(pathname), 'model_landing');
  }

  assert.equal(getAnalyticsPageGroup('/about'), 'other');
});
