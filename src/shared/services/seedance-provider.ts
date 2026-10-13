export type SeedanceProviderName = 'kie' | 'fal';

export interface SeedanceProviderFailure {
  provider: SeedanceProviderName;
  message: string;
}

export class SeedanceProvidersUnavailableError extends Error {
  failures: SeedanceProviderFailure[];

  constructor(failures: SeedanceProviderFailure[]) {
    super(
      'Video generation is temporarily unavailable. No credits were charged. Please try again in a minute.'
    );
    this.name = 'SeedanceProvidersUnavailableError';
    this.failures = failures;
  }
}

export function getProfitProtectedSeedanceCandidates({
  kieConfigured,
}: {
  kieConfigured: boolean;
  falConfigured: boolean;
}): SeedanceProviderName[] {
  // Public product credits are currently priced against Kie's list cost.
  // A higher-cost provider must not be introduced as an invisible fallback.
  return kieConfigured ? ['kie'] : [];
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function isSafeSeedanceFailover(error: unknown) {
  const message = getErrorMessage(error);

  return (
    /status:\s*4\d\d/i.test(message) ||
    /generate video failed|no taskId/i.test(message)
  );
}

export function isRetryableKieModelRegistrationError(error: unknown) {
  const message = getErrorMessage(error);

  return /model name .*not supported|model name you specified is not supported/i.test(
    message
  );
}

export async function submitSeedanceWithProviders<T>({
  candidates,
  submit,
  retryDelay = () => new Promise((resolve) => setTimeout(resolve, 350)),
}: {
  candidates: SeedanceProviderName[];
  submit: (provider: SeedanceProviderName) => Promise<T>;
  retryDelay?: () => Promise<void>;
}): Promise<{ provider: SeedanceProviderName; result: T }> {
  const failures: SeedanceProviderFailure[] = [];

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    let error: unknown;

    try {
      return { provider: candidate, result: await submit(candidate) };
    } catch (firstError) {
      error = firstError;
    }

    if (candidate === 'kie' && isRetryableKieModelRegistrationError(error)) {
      await retryDelay();
      try {
        return { provider: candidate, result: await submit(candidate) };
      } catch (retryError) {
        error = retryError;
      }
    }

    failures.push({ provider: candidate, message: getErrorMessage(error) });

    const hasNext = index < candidates.length - 1;
    if (!hasNext || !isSafeSeedanceFailover(error)) {
      break;
    }
  }

  throw new SeedanceProvidersUnavailableError(failures);
}
