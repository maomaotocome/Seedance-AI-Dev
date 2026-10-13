export type SeedanceVersion = '2.5' | '2.0' | '2.0-fast' | '2.0-mini';
export type SeedanceResolution = '480p' | '720p';
export type SeedanceScene =
  | 'text-to-video'
  | 'image-to-video'
  | 'reference-to-video';

export const SEEDANCE_PRODUCT_MODELS = {
  'seedance-2.5': {
    version: '2.5' as const,
    label: 'Seedance 2.5',
    kieModel: 'bytedance/seedance-2-5',
    falPath: 'bytedance/seedance-2.5',
  },
  'seedance-2.0': {
    version: '2.0' as const,
    label: 'Seedance 2.0 Standard',
    kieModel: 'bytedance/seedance-2',
    falPath: 'bytedance/seedance-2.0',
  },
  'seedance-2.0-fast': {
    version: '2.0-fast' as const,
    label: 'Seedance 2.0 Fast',
    kieModel: 'bytedance/seedance-2-fast',
    falPath: 'bytedance/seedance-2.0/fast',
  },
  'seedance-2.0-mini': {
    version: '2.0-mini' as const,
    label: 'Seedance 2.0 Mini',
    kieModel: 'bytedance/seedance-2-mini',
    falPath: 'bytedance/seedance-2.0/mini',
  },
};

export type SeedanceProductModel = keyof typeof SEEDANCE_PRODUCT_MODELS;

export const SEEDANCE_DURATION_OPTIONS = [5, 8, 10, 15, 30] as const;
export const SEEDANCE_2_0_DURATION_OPTIONS = [5, 8, 10, 15] as const;
export const SEEDANCE_ASPECT_RATIOS = [
  '16:9',
  '9:16',
  '1:1',
  '4:3',
  '3:4',
  '21:9',
] as const;

// Product credit rates. These are what this app charges, independent of the
// upstream provider. They are set against the current Kie list cost with a
// margin buffer; do not silently route to a higher-cost provider at these rates.
const CREDIT_RATE_PER_SECOND: Record<
  SeedanceVersion,
  Record<SeedanceResolution, number>
> = {
  '2.5': { '480p': 6, '720p': 12 },
  '2.0': { '480p': 4, '720p': 8 },
  '2.0-fast': { '480p': 3, '720p': 5 },
  '2.0-mini': { '480p': 1, '720p': 2 },
};

export function isSeedanceProductModel(
  model: string
): model is SeedanceProductModel {
  return model in SEEDANCE_PRODUCT_MODELS;
}

export function getSeedanceVersion(model: SeedanceProductModel) {
  return SEEDANCE_PRODUCT_MODELS[model].version;
}

export function normalizeSeedanceResolution(
  value: unknown
): SeedanceResolution {
  return value === '480p' ? '480p' : '720p';
}

export function normalizeSeedanceDuration(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return 5;
  return Math.min(30, Math.max(4, Math.round(parsed)));
}

export function calculateSeedanceCredits({
  model,
  resolution,
  duration,
}: {
  model: SeedanceProductModel;
  resolution: unknown;
  duration: unknown;
}) {
  const version = getSeedanceVersion(model);
  const normalizedResolution = normalizeSeedanceResolution(resolution);
  const normalizedDuration = normalizeSeedanceDuration(duration);

  return (
    CREDIT_RATE_PER_SECOND[version][normalizedResolution] * normalizedDuration
  );
}

export function getSeedanceProviderModel({
  provider,
  productModel,
  scene,
}: {
  provider: 'kie' | 'fal';
  productModel: SeedanceProductModel;
  scene: SeedanceScene;
}) {
  const config = SEEDANCE_PRODUCT_MODELS[productModel];

  if (provider === 'kie') {
    return config.kieModel;
  }

  return `${config.falPath}/${scene}`;
}

export function buildSeedanceProviderOptions({
  provider,
  scene,
  options,
  endUserId,
}: {
  provider: 'kie' | 'fal';
  scene: SeedanceScene;
  options: Record<string, any>;
  endUserId: string;
}) {
  const resolution = normalizeSeedanceResolution(options.resolution);
  const duration = normalizeSeedanceDuration(options.duration);
  const aspectRatio = SEEDANCE_ASPECT_RATIOS.includes(options.aspect_ratio)
    ? options.aspect_ratio
    : '16:9';

  const normalized: Record<string, any> = {
    scene,
    resolution,
    duration: provider === 'fal' ? String(duration) : duration,
    aspect_ratio: aspectRatio,
    generate_audio: options.generate_audio !== false,
  };

  if (provider === 'fal') {
    normalized.end_user_id = endUserId;
  }

  if (Array.isArray(options.image_input)) {
    normalized.image_input = options.image_input.filter(Boolean);
  }
  if (Array.isArray(options.video_input)) {
    normalized.video_input = options.video_input.filter(Boolean);
  }
  if (Array.isArray(options.audio_input)) {
    normalized.audio_input = options.audio_input.filter(Boolean);
  }

  return normalized;
}
