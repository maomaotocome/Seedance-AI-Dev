import { getSampleVideo, type SampleVideoId } from '@/config/sample-videos';

export type DirectorsDeskShot = {
  id: 'product-light' | 'human-motion' | 'weather-space';
  image: string;
  poster: string;
  video?: string;
  width: number;
  height: number;
  title: string;
  alt: string;
  direction: string;
  metadata: string;
  badge?: string;
};

const localizedCopy = {
  en: {
    'product-light': {
      title: 'Product light',
      alt: 'Brushed aluminum speaker on wet black stone under a warm edge light',
      direction:
        'Slow dolly-in. Keep the metal texture and warm practical edge consistent.',
      metadata: 'Site-made motion study · 6-second loop · not model output',
    },
    'human-motion': {
      title: 'Human motion',
      alt: 'Dancer turning through a sunlit concrete gallery in an orange coat',
      direction:
        'Track laterally. Preserve anatomy, foot contact and the coat’s trailing motion through the light.',
      metadata: 'Site-made visual reference · not model output',
    },
    'weather-space': {
      title: 'Weather and space',
      alt: 'Open stone pavilion and orange curtain above a calm coast at sunrise',
      direction:
        'Hold the structure. Let the curtain, cloud and reflections carry the environmental motion.',
      metadata: 'Site-made visual reference · not model output',
    },
  },
  zh: {
    'product-light': {
      title: '产品光线',
      alt: '暖色轮廓光下，潮湿黑色石面上的拉丝铝制音箱',
      direction: '缓慢推进。保持金属纹理与暖色实景轮廓光的一致性。',
      metadata: '本站原创运动研究 · 6 秒循环 · 非模型输出',
    },
    'human-motion': {
      title: '人物动作',
      alt: '身着橙色外套的舞者正在阳光照亮的混凝土展厅内转身',
      direction: '横向跟拍。保持人体结构、脚部接触与外套穿过光线时的拖尾稳定。',
      metadata: '本站原创视觉参考 · 非模型输出',
    },
    'weather-space': {
      title: '天气与空间',
      alt: '日出时分，宁静海岸上方的开放石亭与橙色帘幕',
      direction: '固定建筑主体，让帘幕、云层和倒影承担环境运动。',
      metadata: '本站原创视觉参考 · 非模型输出',
    },
  },
} as const;

const assets = {
  'product-light': {
    image: '/media/directors-desk/studio-speaker.webp',
    poster: '/media/directors-desk/studio-speaker-poster.jpg',
    video: '/media/directors-desk/studio-speaker-loop.mp4',
  },
  'human-motion': {
    image: '/media/directors-desk/motion-gallery.webp',
    poster: '/media/directors-desk/motion-gallery.webp',
  },
  'weather-space': {
    image: '/media/directors-desk/coastal-pavilion-sunrise.webp',
    poster: '/media/directors-desk/coastal-pavilion-sunrise.webp',
  },
} as const;

const shotOrder: DirectorsDeskShot['id'][] = [
  'product-light',
  'human-motion',
  'weather-space',
];

export function getDirectorsDeskShots(locale: string): DirectorsDeskShot[] {
  const language = locale.startsWith('zh') ? 'zh' : 'en';

  return shotOrder.map((id) => ({
    id,
    ...assets[id],
    ...localizedCopy[language][id],
    width: 1672,
    height: 941,
  }));
}

const guideShotBySlug: Record<string, DirectorsDeskShot['id']> = {
  'seedance-2-5-free': 'product-light',
  'seedance-2-0': 'product-light',
  'seedance-2-5-api': 'product-light',
  'seedance-2-5-prompt-guide': 'human-motion',
  'seedance-2-5-vs-2-0': 'weather-space',
  'unlimited-seedance-2-5': 'weather-space',
  'kling-3-0-ai-video-generator': 'human-motion',
  'wan-2-7-video-generator': 'weather-space',
  'minimax-h3-video-generator': 'product-light',
  'grok-imagine-video-1-5': 'human-motion',
};

// Seedance guides lead with a frame from a real, unedited model output.
const guideSampleBySlug: Record<string, SampleVideoId> = {
  'seedance-2-5-free': 'dialogue-25',
  'seedance-2-0': 'product-20',
  'seedance-2-5-api': 'product-25',
  'seedance-2-5-prompt-guide': 'sequence-25',
  'seedance-2-5-vs-2-0': 'camera-25',
  'unlimited-seedance-2-5': 'anime-25',
  'what-is-seedance': 'i2v-25',
  'seedance-3-0': 'camera-25',
};

export function getGuideVisualMedia(
  slug: string,
  locale: string
): DirectorsDeskShot {
  const sampleId = guideSampleBySlug[slug];
  if (sampleId) {
    const sample = getSampleVideo(sampleId, locale);
    const isChinese = locale.startsWith('zh');

    return {
      id: 'product-light',
      image: sample.poster,
      poster: sample.poster,
      width: 854,
      height: 480,
      title: sample.title,
      alt: isChinese
        ? `${sample.modelLabel} 输出画面：${sample.title}`
        : `Frame from a ${sample.modelLabel} output: ${sample.title}`,
      direction: sample.prompt,
      metadata: isChinese
        ? `${sample.modelLabel} 原始输出画面 · ${sample.resolution} · ${sample.duration} 秒`
        : `Frame from an unedited ${sample.modelLabel} output · ${sample.resolution} · ${sample.duration}s`,
      badge: isChinese ? '模型输出' : 'Model output',
    };
  }

  const shotId = guideShotBySlug[slug] || 'product-light';
  return getDirectorsDeskShots(locale).find((shot) => shot.id === shotId)!;
}
