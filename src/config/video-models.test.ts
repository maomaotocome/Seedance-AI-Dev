import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildKieVideoInput,
  calculateVideoCredits,
  getKieVideoModel,
  isVideoProductModel,
  normalizeVideoDuration,
} from './video-models';

test('allowlists all public video product models', () => {
  assert.equal(isVideoProductModel('seedance-2.5'), true);
  assert.equal(isVideoProductModel('seedance-2.0-fast'), true);
  assert.equal(isVideoProductModel('seedance-2.0-mini'), true);
  assert.equal(isVideoProductModel('kling-3.0'), true);
  assert.equal(isVideoProductModel('wan-2.7'), true);
  assert.equal(isVideoProductModel('minimax-h3'), true);
  assert.equal(isVideoProductModel('grok-imagine-video-1.5'), true);
  assert.equal(isVideoProductModel('arbitrary/provider-model'), false);
});

test('maps scene-specific Kie model IDs', () => {
  assert.equal(
    getKieVideoModel('wan-2.7', 'text-to-video'),
    'wan/2-7-text-to-video'
  );
  assert.equal(
    getKieVideoModel('wan-2.7', 'image-to-video'),
    'wan/2-7-image-to-video'
  );
  assert.equal(
    getKieVideoModel('minimax-h3', 'image-to-video'),
    'minimax-h3/image-to-video'
  );
});

test('normalizes unsupported durations to a model-safe default', () => {
  assert.equal(normalizeVideoDuration('seedance-2.5', 30), 30);
  assert.equal(normalizeVideoDuration('seedance-2.0', 30), 5);
  assert.equal(normalizeVideoDuration('seedance-2.0-mini', 15), 15);
  assert.equal(normalizeVideoDuration('kling-3.0', 7), 5);
  assert.equal(normalizeVideoDuration('minimax-h3', 7), 6);
});

test('builds Kling 3.0 single-shot input without unsupported product modes', () => {
  assert.deepEqual(
    buildKieVideoInput({
      model: 'kling-3.0',
      scene: 'text-to-video',
      prompt: 'A precise product dolly shot',
      options: {
        resolution: '1080p',
        duration: 10,
        aspect_ratio: '16:9',
        generate_audio: true,
      },
    }),
    {
      prompt: 'A precise product dolly shot',
      aspect_ratio: '16:9',
      sound: true,
      duration: '10',
      mode: 'pro',
      multi_shots: false,
    }
  );
});

test('builds Wan 2.7 first-and-last-frame input', () => {
  assert.deepEqual(
    buildKieVideoInput({
      model: 'wan-2.7',
      scene: 'image-to-video',
      prompt: 'Slow push in',
      options: {
        resolution: '720p',
        duration: 5,
        image_input: [
          'https://example.com/first.png',
          'https://example.com/last.png',
        ],
        negative_prompt: 'flicker',
      },
    }),
    {
      prompt: 'Slow push in',
      negative_prompt: 'flicker',
      first_frame_url: 'https://example.com/first.png',
      last_frame_url: 'https://example.com/last.png',
      resolution: '720p',
      duration: 5,
      prompt_extend: true,
      watermark: false,
    }
  );
});

test('calculates product credits from the selected model controls', () => {
  assert.equal(
    calculateVideoCredits({
      model: 'seedance-2.5',
      resolution: '720p',
      duration: 5,
      generateAudio: true,
    }),
    60
  );
  assert.equal(
    calculateVideoCredits({
      model: 'seedance-2.0-mini',
      resolution: '480p',
      duration: 5,
      generateAudio: true,
    }),
    5
  );
  assert.equal(
    calculateVideoCredits({
      model: 'kling-3.0',
      resolution: '720p',
      duration: 5,
      generateAudio: true,
    }),
    15
  );
  assert.equal(
    calculateVideoCredits({
      model: 'minimax-h3',
      resolution: '2K',
      duration: 10,
    }),
    30
  );
});
