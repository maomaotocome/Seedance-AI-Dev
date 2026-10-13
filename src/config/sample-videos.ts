import {
  calculateSeedanceCredits,
  SEEDANCE_PRODUCT_MODELS,
  type SeedanceProductModel,
} from '@/config/seedance';

// Unedited model outputs generated for this site on 2026-10-03. The prompt is
// the exact text that was submitted, so it stays in English in every locale.
export type SampleVideoId =
  | 'product-25'
  | 'product-20'
  | 'camera-25'
  | 'camera-20'
  | 'dialogue-25'
  | 'anime-25'
  | 'i2v-25'
  | 'sequence-25';

type SampleSource = {
  model: SeedanceProductModel;
  duration: number;
  mode: 'text' | 'image';
  title: { en: string; zh: string };
  prompt: string;
};

const PROMPTS = {
  product:
    'Locked macro of an unbranded matte-black espresso cup on pale stone. Steam rises and curls left. Slow push-in that stops at the rim. Soft window light, quiet room tone, no text.',
  camera:
    'Start close on a brass compass in an open palm, then dolly back to reveal a hiker on a ridge at sunrise. One continuous move that ends on a stable wide shot. Wind, distant birds.',
};

const SOURCES: Record<SampleVideoId, SampleSource> = {
  'product-25': {
    model: 'seedance-2.5',
    duration: 5,
    mode: 'text',
    title: {
      en: 'Espresso cup macro — steam and camera movement',
      zh: '咖啡杯微距：蒸汽与镜头移动',
    },
    prompt: PROMPTS.product,
  },
  'product-20': {
    model: 'seedance-2.0',
    duration: 5,
    mode: 'text',
    title: {
      en: 'Espresso cup macro — steam and camera movement',
      zh: '咖啡杯微距：蒸汽与镜头移动',
    },
    prompt: PROMPTS.product,
  },
  'camera-25': {
    model: 'seedance-2.5',
    duration: 8,
    mode: 'text',
    title: {
      en: 'Ridge reveal — one continuous dolly-back',
      zh: '山脊揭示：连续后拉镜头',
    },
    prompt: PROMPTS.camera,
  },
  'camera-20': {
    model: 'seedance-2.0',
    duration: 8,
    mode: 'text',
    title: {
      en: 'Ridge reveal — one continuous dolly-back',
      zh: '山脊揭示：连续后拉镜头',
    },
    prompt: PROMPTS.camera,
  },
  'dialogue-25': {
    model: 'seedance-2.5',
    duration: 8,
    mode: 'text',
    title: {
      en: 'Bus-stop dialogue — speech and rain ambience',
      zh: '车站对白：人物说话与雨声',
    },
    prompt:
      'Medium close-up of a woman in her thirties at a rainy bus stop. She looks up from her phone and says, "It\'s late again." Handheld at eye level, shallow focus, traffic hiss and rain.',
  },
  'anime-25': {
    model: 'seedance-2.5',
    duration: 5,
    mode: 'text',
    title: {
      en: 'Anime puddle jump — tracking and splash timing',
      zh: '动漫跃过水洼：跟拍与水花时序',
    },
    prompt:
      '2D anime style. A girl in a yellow raincoat jumps a puddle on a neon-lit street; the splash freezes for a beat, then falls. Side tracking shot, bold outlines, city ambience.',
  },
  'i2v-25': {
    model: 'seedance-2.5',
    duration: 5,
    mode: 'image',
    title: {
      en: 'Rooftop turn — motion from a starting image',
      zh: '屋顶转身：从首帧图片生成动作',
    },
    prompt:
      'Keep the subject, outfit and background from the first frame. She turns into the wind and the cobalt coat lifts behind her. Hair moves in the breeze. Locked camera, no new objects.',
  },
  'sequence-25': {
    model: 'seedance-2.5',
    duration: 15,
    mode: 'text',
    title: {
      en: 'Street-food sequence — timecoded shot changes',
      zh: '街头烹饪段落：时间码与镜头变化',
    },
    prompt:
      '[0-5s] Wide: a street chef lights a wok burner at night. [5-10s] Close: vegetables toss through the flame, oil sizzles. [10-15s] Medium: he plates the dish and slides it forward. Warm practical light.',
  },
};

export const SAMPLE_RESOLUTION = '480p';

export function getSampleVideo(id: SampleVideoId, locale: string) {
  const source = SOURCES[id];
  const isChinese = locale.startsWith('zh');

  return {
    id,
    src: `/media/samples/seedance-${id}.mp4`,
    poster: `/media/samples/seedance-${id}.webp`,
    model: source.model,
    referenceImage:
      source.mode === 'image'
        ? '/media/directors-desk/hero-rooftop-turn.webp'
        : undefined,
    title: isChinese ? source.title.zh : source.title.en,
    prompt: source.prompt,
    mode: source.mode,
    modelLabel: SEEDANCE_PRODUCT_MODELS[source.model].label,
    duration: source.duration,
    resolution: SAMPLE_RESOLUTION,
    credits: calculateSeedanceCredits({
      model: source.model,
      resolution: SAMPLE_RESOLUTION,
      duration: source.duration,
    }),
  };
}

export type SampleVideo = ReturnType<typeof getSampleVideo>;

export const HOME_SAMPLE_IDS: SampleVideoId[] = [
  'dialogue-25',
  'product-25',
  'camera-25',
  'anime-25',
  'i2v-25',
  'sequence-25',
];

export function isSampleVideoId(value: unknown): value is SampleVideoId {
  return typeof value === 'string' && Object.hasOwn(SOURCES, value);
}
