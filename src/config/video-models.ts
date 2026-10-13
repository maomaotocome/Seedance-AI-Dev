import {
  calculateSeedanceCredits,
  isSeedanceProductModel,
  SEEDANCE_2_0_DURATION_OPTIONS,
  SEEDANCE_ASPECT_RATIOS,
  SEEDANCE_DURATION_OPTIONS,
  SeedanceProductModel,
  SeedanceScene,
} from './seedance';

export type VideoScene = SeedanceScene;
export type VideoAudioMode = 'toggle' | 'none';

export interface VideoModelConfig {
  label: string;
  family: string;
  uiKey: string;
  badge?: 'new' | 'popular';
  scenes: readonly VideoScene[];
  resolutions: readonly string[];
  durations: readonly number[];
  aspectRatios: readonly string[];
  defaultResolution: string;
  defaultDuration: number;
  defaultAspectRatio: string;
  audio: VideoAudioMode;
  maxImages: number;
  aspectFromImage?: boolean;
  creditRates?: Record<
    string,
    {
      silent: number;
      audio?: number;
    }
  >;
}

const NEW_VIDEO_MODELS = {
  'kling-3.0': {
    label: 'Kling 3.0',
    family: 'Kuaishou',
    uiKey: 'kling_3_0',
    badge: 'popular',
    scenes: ['text-to-video', 'image-to-video'],
    resolutions: ['720p', '1080p'],
    durations: [5, 10, 15],
    aspectRatios: ['16:9', '9:16', '1:1'],
    defaultResolution: '720p',
    defaultDuration: 5,
    defaultAspectRatio: '16:9',
    audio: 'toggle',
    maxImages: 2,
    aspectFromImage: true,
    creditRates: {
      '720p': { silent: 2, audio: 3 },
      '1080p': { silent: 2, audio: 4 },
    },
  },
  'wan-2.7': {
    label: 'Wan 2.7',
    family: 'Alibaba',
    uiKey: 'wan_2_7',
    badge: 'new',
    scenes: ['text-to-video', 'image-to-video'],
    resolutions: ['720p', '1080p'],
    durations: [5, 10, 15],
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    defaultResolution: '720p',
    defaultDuration: 5,
    defaultAspectRatio: '16:9',
    audio: 'none',
    maxImages: 2,
    aspectFromImage: true,
    creditRates: {
      '720p': { silent: 2 },
      '1080p': { silent: 3 },
    },
  },
  'minimax-h3': {
    label: 'MiniMax H3',
    family: 'MiniMax',
    uiKey: 'minimax_h3',
    badge: 'new',
    scenes: ['text-to-video', 'image-to-video'],
    resolutions: ['768P', '2K'],
    durations: [6, 10, 15],
    aspectRatios: ['21:9', '16:9', '4:3', '1:1', '3:4', '9:16'],
    defaultResolution: '768P',
    defaultDuration: 6,
    defaultAspectRatio: '16:9',
    audio: 'none',
    maxImages: 2,
    aspectFromImage: true,
    creditRates: {
      '768P': { silent: 2 },
      '2K': { silent: 3 },
    },
  },
  'grok-imagine-video-1.5': {
    label: 'Grok Imagine Video 1.5',
    family: 'xAI',
    uiKey: 'grok_imagine_1_5',
    badge: 'popular',
    scenes: ['text-to-video', 'image-to-video'],
    resolutions: ['480p', '720p'],
    durations: [5, 8, 10, 15],
    aspectRatios: ['16:9', '9:16', '1:1', '3:2', '2:3'],
    defaultResolution: '720p',
    defaultDuration: 8,
    defaultAspectRatio: '16:9',
    audio: 'none',
    maxImages: 7,
    aspectFromImage: true,
    creditRates: {
      '480p': { silent: 1 },
      '720p': { silent: 1 },
    },
  },
} as const satisfies Record<string, VideoModelConfig>;

export type NewVideoProductModel = keyof typeof NEW_VIDEO_MODELS;
export type VideoProductModel = SeedanceProductModel | NewVideoProductModel;

const SEEDANCE_VIDEO_MODELS: Record<SeedanceProductModel, VideoModelConfig> = {
  'seedance-2.5': {
    label: 'Seedance 2.5',
    family: 'ByteDance',
    uiKey: 'seedance_2_5',
    badge: 'popular',
    scenes: ['text-to-video', 'image-to-video', 'reference-to-video'],
    resolutions: ['480p', '720p'],
    durations: SEEDANCE_DURATION_OPTIONS,
    aspectRatios: SEEDANCE_ASPECT_RATIOS,
    defaultResolution: '480p',
    defaultDuration: 5,
    defaultAspectRatio: '16:9',
    audio: 'toggle',
    maxImages: 6,
  },
  'seedance-2.0': {
    label: 'Seedance 2.0 Standard',
    family: 'ByteDance',
    uiKey: 'seedance_2_0',
    scenes: ['text-to-video', 'image-to-video', 'reference-to-video'],
    resolutions: ['480p', '720p'],
    durations: SEEDANCE_2_0_DURATION_OPTIONS,
    aspectRatios: SEEDANCE_ASPECT_RATIOS,
    defaultResolution: '480p',
    defaultDuration: 5,
    defaultAspectRatio: '16:9',
    audio: 'toggle',
    maxImages: 6,
  },
  'seedance-2.0-fast': {
    label: 'Seedance 2.0 Fast',
    family: 'ByteDance',
    uiKey: 'seedance_2_0_fast',
    scenes: ['text-to-video', 'image-to-video', 'reference-to-video'],
    resolutions: ['480p', '720p'],
    durations: SEEDANCE_2_0_DURATION_OPTIONS,
    aspectRatios: SEEDANCE_ASPECT_RATIOS,
    defaultResolution: '480p',
    defaultDuration: 5,
    defaultAspectRatio: '16:9',
    audio: 'toggle',
    maxImages: 6,
  },
  'seedance-2.0-mini': {
    label: 'Seedance 2.0 Mini',
    family: 'ByteDance',
    uiKey: 'seedance_2_0_mini',
    badge: 'new',
    scenes: ['text-to-video', 'image-to-video', 'reference-to-video'],
    resolutions: ['480p', '720p'],
    durations: SEEDANCE_2_0_DURATION_OPTIONS,
    aspectRatios: SEEDANCE_ASPECT_RATIOS,
    defaultResolution: '480p',
    defaultDuration: 5,
    defaultAspectRatio: '16:9',
    audio: 'toggle',
    maxImages: 6,
  },
};

export const VIDEO_PRODUCT_MODELS: Record<VideoProductModel, VideoModelConfig> =
  {
    ...SEEDANCE_VIDEO_MODELS,
    ...NEW_VIDEO_MODELS,
  };

export function isVideoProductModel(model: string): model is VideoProductModel {
  return Object.hasOwn(VIDEO_PRODUCT_MODELS, model);
}

export function isNewVideoProductModel(
  model: VideoProductModel
): model is NewVideoProductModel {
  return model in NEW_VIDEO_MODELS;
}

export function getVideoModelConfig(model: VideoProductModel) {
  return VIDEO_PRODUCT_MODELS[model];
}

function normalizeFromList<T extends string | number>(
  value: unknown,
  values: readonly T[],
  fallback: T
): T {
  return values.includes(value as T) ? (value as T) : fallback;
}

export function normalizeVideoScene(
  model: VideoProductModel,
  value: unknown
): VideoScene {
  const config = getVideoModelConfig(model);
  return normalizeFromList(value, config.scenes, config.scenes[0]);
}

export function normalizeVideoResolution(
  model: VideoProductModel,
  value: unknown
) {
  const config = getVideoModelConfig(model);
  return normalizeFromList(value, config.resolutions, config.defaultResolution);
}

export function normalizeVideoDuration(
  model: VideoProductModel,
  value: unknown
) {
  const config = getVideoModelConfig(model);
  const parsed = typeof value === 'number' ? value : Number(value);
  return normalizeFromList(
    Number.isFinite(parsed) ? parsed : config.defaultDuration,
    config.durations,
    config.defaultDuration
  );
}

export function normalizeVideoAspectRatio(
  model: VideoProductModel,
  value: unknown
) {
  const config = getVideoModelConfig(model);
  return normalizeFromList(
    value,
    config.aspectRatios,
    config.defaultAspectRatio
  );
}

export function calculateVideoCredits({
  model,
  resolution,
  duration,
  generateAudio,
}: {
  model: VideoProductModel;
  resolution: unknown;
  duration: unknown;
  generateAudio?: boolean;
}) {
  if (isSeedanceProductModel(model)) {
    return calculateSeedanceCredits({ model, resolution, duration });
  }

  const config = getVideoModelConfig(model);
  const normalizedResolution = normalizeVideoResolution(model, resolution);
  const normalizedDuration = normalizeVideoDuration(model, duration);
  const rates = config.creditRates?.[normalizedResolution];

  if (!rates) {
    throw new Error(`Missing product credit rate for ${model}`);
  }

  const rate = generateAudio && rates.audio ? rates.audio : rates.silent;
  return rate * normalizedDuration;
}

export function getKieVideoModel(
  model: NewVideoProductModel,
  scene: VideoScene
) {
  switch (model) {
    case 'kling-3.0':
      return 'kling-3.0/video';
    case 'wan-2.7':
      return scene === 'image-to-video'
        ? 'wan/2-7-image-to-video'
        : 'wan/2-7-text-to-video';
    case 'minimax-h3':
      return scene === 'image-to-video'
        ? 'minimax-h3/image-to-video'
        : 'minimax-h3/text-to-video';
    case 'grok-imagine-video-1.5':
      return 'grok-imagine-video-1-5-preview';
  }
}

export function buildKieVideoInput({
  model,
  scene,
  prompt,
  options,
}: {
  model: NewVideoProductModel;
  scene: VideoScene;
  prompt: string;
  options: Record<string, any>;
}) {
  const resolution = normalizeVideoResolution(model, options.resolution);
  const duration = normalizeVideoDuration(model, options.duration);
  const aspectRatio = normalizeVideoAspectRatio(model, options.aspect_ratio);
  const imageInput = Array.isArray(options.image_input)
    ? options.image_input.filter(Boolean)
    : [];
  const negativePrompt =
    typeof options.negative_prompt === 'string'
      ? options.negative_prompt.trim().slice(0, 500)
      : '';

  if (model === 'kling-3.0') {
    return {
      prompt,
      ...(scene === 'image-to-video' && imageInput.length > 0
        ? { image_urls: imageInput.slice(0, 2) }
        : { aspect_ratio: aspectRatio }),
      sound: options.generate_audio !== false,
      duration: String(duration),
      mode: resolution === '1080p' ? 'pro' : 'std',
      multi_shots: false,
    };
  }

  if (model === 'wan-2.7') {
    return {
      prompt,
      ...(negativePrompt && { negative_prompt: negativePrompt }),
      ...(scene === 'image-to-video'
        ? {
            first_frame_url: imageInput[0],
            ...(imageInput[1] && { last_frame_url: imageInput[1] }),
          }
        : { ratio: aspectRatio }),
      resolution,
      duration,
      prompt_extend: options.prompt_extend !== false,
      watermark: false,
    };
  }

  if (model === 'minimax-h3') {
    return {
      prompt,
      ...(scene === 'image-to-video'
        ? {
            first_frame_url: imageInput[0],
            ...(imageInput[1] && { last_frame_url: imageInput[1] }),
          }
        : { aspect_ratio: aspectRatio }),
      duration,
      resolution,
    };
  }

  return {
    prompt,
    ...(scene === 'image-to-video' && imageInput.length > 0
      ? { image_urls: imageInput.slice(0, 7) }
      : { aspect_ratio: aspectRatio }),
    resolution,
    duration,
  };
}
