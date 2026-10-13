import assert from 'node:assert/strict';
import test from 'node:test';

import { calculateSeedanceCredits, getSeedanceProviderModel } from './seedance';

test('uses the current Kie model IDs for the Seedance product ladder', () => {
  const expectedModels = {
    'seedance-2.5': 'bytedance/seedance-2-5',
    'seedance-2.0': 'bytedance/seedance-2',
    'seedance-2.0-fast': 'bytedance/seedance-2-fast',
    'seedance-2.0-mini': 'bytedance/seedance-2-mini',
  } as const;

  for (const [productModel, providerModel] of Object.entries(expectedModels)) {
    assert.equal(
      getSeedanceProviderModel({
        provider: 'kie',
        productModel: productModel as keyof typeof expectedModels,
        scene: 'text-to-video',
      }),
      providerModel
    );
  }
});

test('charges the approved five-second Seedance rates at both resolutions', () => {
  const expectedCredits = {
    'seedance-2.5': { '480p': 30, '720p': 60 },
    'seedance-2.0': { '480p': 20, '720p': 40 },
    'seedance-2.0-fast': { '480p': 15, '720p': 25 },
    'seedance-2.0-mini': { '480p': 5, '720p': 10 },
  } as const;

  for (const [model, resolutions] of Object.entries(expectedCredits)) {
    for (const [resolution, credits] of Object.entries(resolutions)) {
      assert.equal(
        calculateSeedanceCredits({
          model: model as keyof typeof expectedCredits,
          resolution,
          duration: 5,
        }),
        credits
      );
    }
  }
});
