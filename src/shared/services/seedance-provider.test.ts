import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getProfitProtectedSeedanceCandidates,
  SeedanceProvidersUnavailableError,
  submitSeedanceWithProviders,
} from './seedance-provider';

test('uses Kie only when product credits are priced against Kie', () => {
  assert.deepEqual(
    getProfitProtectedSeedanceCandidates({
      kieConfigured: true,
      falConfigured: true,
    }),
    ['kie']
  );
  assert.deepEqual(
    getProfitProtectedSeedanceCandidates({
      kieConfigured: false,
      falConfigured: true,
    }),
    []
  );
});

test('retries a transient Kie model registration error before falling back', async () => {
  let kieAttempts = 0;
  let falAttempts = 0;

  const submission = await submitSeedanceWithProviders({
    candidates: ['kie', 'fal'],
    retryDelay: async () => {},
    submit: async (provider) => {
      if (provider === 'fal') {
        falAttempts += 1;
        throw new Error('request failed with status: 401');
      }

      kieAttempts += 1;
      if (kieAttempts === 1) {
        throw new Error(
          'generate video failed: The model name you specified is not supported.'
        );
      }

      return { taskId: 'task-ok' };
    },
  });

  assert.equal(submission.provider, 'kie');
  assert.deepEqual(submission.result, { taskId: 'task-ok' });
  assert.equal(kieAttempts, 2);
  assert.equal(falAttempts, 0);
});

test('does not replace the provider chain with a misleading final 401', async () => {
  await assert.rejects(
    submitSeedanceWithProviders({
      candidates: ['kie', 'fal'],
      retryDelay: async () => {},
      submit: async (provider) => {
        if (provider === 'kie') {
          throw new Error('generate video failed: unsupported request');
        }
        throw new Error('request failed with status: 401');
      },
    }),
    (error: unknown) => {
      assert.ok(error instanceof SeedanceProvidersUnavailableError);
      assert.equal(error.failures.length, 2);
      assert.match(error.failures[0].message, /unsupported request/);
      assert.match(error.failures[1].message, /401/);
      assert.doesNotMatch(error.message, /401/);
      assert.match(error.message, /No credits were charged/);
      return true;
    }
  );
});

test('does not fail over after an ambiguous network error', async () => {
  let falAttempts = 0;

  await assert.rejects(
    submitSeedanceWithProviders({
      candidates: ['kie', 'fal'],
      submit: async (provider) => {
        if (provider === 'fal') falAttempts += 1;
        throw new Error('fetch failed');
      },
    }),
    SeedanceProvidersUnavailableError
  );

  assert.equal(falAttempts, 0);
});
