import {
  getVideoModelConfig,
  isVideoProductModel,
  type VideoProductModel,
  type VideoScene,
} from '@/config/video-models';

export type VideoDraft = {
  model: VideoProductModel;
  scene: VideoScene;
  prompt: string;
  resolution: string;
  duration: number;
  aspectRatio: string;
  generateAudio: boolean;
  referenceUrls: string[];
  negativePrompt: string;
  promptExtend: boolean;
};

export function normalizeVideoDraft(input: unknown): VideoDraft | null {
  if (!input || typeof input !== 'object') return null;
  const value = input as Partial<VideoDraft>;
  if (typeof value.model !== 'string' || !isVideoProductModel(value.model))
    return null;
  const config = getVideoModelConfig(value.model);
  const scene = config.scenes.includes(value.scene!)
    ? value.scene!
    : config.scenes[0];
  const maxImages =
    scene === 'image-to-video' && value.model.startsWith('seedance-')
      ? 2
      : config.maxImages;
  return {
    model: value.model,
    scene,
    prompt: typeof value.prompt === 'string' ? value.prompt.slice(0, 4000) : '',
    resolution: config.resolutions.includes(value.resolution!)
      ? value.resolution!
      : config.defaultResolution,
    duration: config.durations.includes(value.duration!)
      ? value.duration!
      : config.defaultDuration,
    aspectRatio: config.aspectRatios.includes(value.aspectRatio!)
      ? value.aspectRatio!
      : config.defaultAspectRatio,
    generateAudio: config.audio === 'toggle' && value.generateAudio !== false,
    referenceUrls:
      scene === 'text-to-video'
        ? []
        : (Array.isArray(value.referenceUrls) ? value.referenceUrls : [])
            .filter(
              (url): url is string =>
                typeof url === 'string' && /^https:\/\//.test(url)
            )
            .slice(0, maxImages),
    negativePrompt:
      typeof value.negativePrompt === 'string'
        ? value.negativePrompt.slice(0, 4000)
        : '',
    promptExtend: value.promptExtend !== false,
  };
}

export const VIDEO_DRAFT_KEY = 'seedance_video_draft_v1';
export const VIDEO_DRAFT_TTL = 30 * 60 * 1000;

export function readVideoDraft(
  storage: Pick<Storage, 'getItem' | 'removeItem'>,
  path: string,
  now = Date.now()
) {
  try {
    const raw = storage.getItem(VIDEO_DRAFT_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    storage.removeItem(VIDEO_DRAFT_KEY);
    // The sign-in callback keeps the pathname but may omit a public sample query.
    // Restore that return trip, without applying the draft to a different preset.
    const sameRoute =
      saved.path === path ||
      (typeof saved.path === 'string' &&
        !path.includes('?') &&
        saved.path.split('?')[0] === path);
    if (
      !sameRoute ||
      !Number.isFinite(saved.savedAt) ||
      now - saved.savedAt > VIDEO_DRAFT_TTL ||
      saved.savedAt > now
    )
      return null;
    return normalizeVideoDraft(saved.draft);
  } catch {
    return null;
  }
}
