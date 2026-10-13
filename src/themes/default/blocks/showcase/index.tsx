'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLocale } from 'next-intl';

import { ShowcaseHeader } from './showcase-header';

function getDefaultTextToVideo(locale: string) {
  return {
    title: locale.startsWith('zh') ? '文本转视频' : 'Text to Video',
    description: locale.startsWith('zh')
      ? '将你的文本提示词转化为电影感十足的视频作品。<br />Seedance 2.0 能理解复杂场景描述、镜头语言与风格要求，生成更具表现力的动态画面。'
      : 'Turn your text prompts into cinematic video clips. <br />Seedance 2.0 understands complex scene descriptions, camera motion, and style instructions to generate polished footage from text alone.',
    buttons: [
      {
        title: locale.startsWith('zh')
          ? '立即体验 Seedance 2.0'
          : 'Try Seedance 2.0 Now',
        url: '#hero-input',
        target: '_self',
      },
    ],
    items: [
      {
        prompt: locale.startsWith('zh')
          ? '一只狗在奥运会攀岩墙上飞速向上攀爬，动作夸张、节奏紧凑，充满竞技感。'
          : 'A dog speed climbs up a climbing wall at the olympics',
        videoSrc: 'https://cdn.joyflix.ai/demo/videos/dog-olympics.mp4',
        url: '#',
      },
      {
        prompt: locale.startsWith('zh')
          ? '太阳从高楼之间缓缓升起，镜头贴地跟随自行车轮前进，呈现城市清晨的电影感运动镜头。'
          : 'The sun rises slowly between tall buildings. Ground-level follow shot of bicycle tires',
        videoSrc: 'https://cdn.joyflix.ai/demo/videos/sun-rises-bicycle.mp4',
        url: '#',
      },
      {
        prompt: locale.startsWith('zh')
          ? '一艘海盗船驶入雷电交加的暴风雨海域，巨浪翻涌，画面充满史诗级冒险氛围。'
          : 'Pirate ship sailing into a storm with lightning and high waves',
        videoSrc: 'https://cdn.joyflix.ai/demo/videos/pirate-ship.mp4',
        url: '#',
      },
      {
        prompt: locale.startsWith('zh')
          ? '一只雪豹穿行在积雪覆盖的森林中，镜头细腻、质感真实，呈现电影级 8K 野生动物画面。'
          : 'A snow leopard walking through a snowy forest, cinematic 8k',
        videoSrc: 'https://cdn.joyflix.ai/demo/videos/snow-leopard.mp4',
        url: '#',
      },
    ],
  };
}

function getDefaultImageToVideo(locale: string) {
  return {
    title: locale.startsWith('zh') ? '图像转视频' : 'Image to Video',
    description: locale.startsWith('zh')
      ? '让静态图片拥有真实运动、镜头推进与叙事氛围。<br/>上传任意图像，Seedance 2.0 就能将其扩展成更自然、更具电影感的视频片段。'
      : 'Animate still images with natural motion and cinematic camera work. <br />Upload a single image and let Seedance 2.0 transform it into a dynamic video sequence with realistic movement.',
    buttons: [
      {
        title: locale.startsWith('zh')
          ? '立即体验 Seedance 2.0'
          : 'Try Seedance 2.0 Now',
        url: '#hero-input',
        target: '_self',
        icon: 'GoArrowUpRight',
      },
    ],
    items: [
      {
        prompt: locale.startsWith('zh')
          ? '让画面中的鞋子旋转，其他元素保持静止，突出主体运动与复古像素质感。'
          : 'Rotate the shoe, keep everything else still',
        originalImage: {
          src: 'https://cdn.joyflix.ai/demo/imgs/macpaint.png',
        },
        videoSrc: 'https://cdn.joyflix.ai/demo/videos/macpaint.mp4',
      },
      {
        prompt: locale.startsWith('zh')
          ? '黄金时刻的柔和暖光下，镜头以广角缓慢向前推进并轻微向左倾斜。一位船夫站在平底船上，撑着长杆穿过被水淹没的威尼斯废墟，周围建筑爬满藤蔓、金属锈蚀，在夕阳映照下呈现出诗意而末世的电影场景。'
          : 'Golden hour, soft lighting, warm colors, saturated colors, wide shot, left-heavy composition. A weathered gondolier stands in a flat-bottomed boat, propelling it forward with a long wooden pole through the flooded ruins of Venice. The decaying buildings on either side are cloaked in creeping vines and marked by rusted metalwork, their once-proud facades now crumbling into the water. The camera moves slowly forward and tilts left, revealing behind him the majestic remnants of the city bathed in the amber glow of the setting sun. Silhouettes of collapsed archways and broken domes rise against the golden skyline, while the still water reflects the warm hues of the sky and surrounding structures.',
        originalImage: {
          src: 'https://cdn.joyflix.ai/demo/imgs/gondola.jpg',
        },
        videoSrc: 'https://cdn.joyflix.ai/demo/videos/gondola.mp4',
      },
      {
        prompt: locale.startsWith('zh')
          ? '让画面中的变化瞬间发生，形成更强的视觉反差与创意转场效果。'
          : 'Make the changes happen instantly.',
        originalImage: {
          src: 'https://cdn.joyflix.ai/demo/imgs/woman-city-doodle.jpg',
        },
        videoSrc: 'https://cdn.joyflix.ai/demo/videos/woman-city-doodle.mp4',
      },
    ],
  };
}

const TextToVideoShowcase = dynamic(
  () =>
    import('./text-to-video-showcase').then(
      (module) => module.TextToVideoShowcase
    ),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full pb-36">
        <div className="mx-auto h-[50vmin] max-h-[640px] min-h-[320px] w-[50vmin] max-w-[640px] min-w-[320px] rounded-[2rem] border border-white/10 bg-white/5" />
      </div>
    ),
  }
);

const ImageToVideoShowcase = dynamic(
  () =>
    import('./image-to-video-showcase').then(
      (module) => module.ImageToVideoShowcase
    ),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto h-[640px] w-full max-w-6xl rounded-[2rem] border border-white/10 bg-white/5" />
    ),
  }
);

export function Showcase({ section }: { section: any }) {
  const locale = useLocale();
  const textSectionRef = useRef<HTMLDivElement>(null);
  const imageSectionRef = useRef<HTMLDivElement>(null);
  const [showTextToVideo, setShowTextToVideo] = useState(false);
  const [showImageToVideo, setShowImageToVideo] = useState(false);

  useEffect(() => {
    const registrations = [
      {
        ref: textSectionRef,
        mounted: showTextToVideo,
        onVisible: () => setShowTextToVideo(true),
      },
      {
        ref: imageSectionRef,
        mounted: showImageToVideo,
        onVisible: () => setShowImageToVideo(true),
      },
    ];

    const observers = registrations
      .filter(
        (registration) => registration.ref.current && !registration.mounted
      )
      .map((registration) => {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                registration.onVisible();
                observer.disconnect();
              }
            });
          },
          {
            rootMargin: '300px 0px',
            threshold: 0.1,
          }
        );

        observer.observe(registration.ref.current as Element);
        return observer;
      });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [showImageToVideo, showTextToVideo]);

  if (section.disabled) {
    return null;
  }

  const defaultTextToVideo = getDefaultTextToVideo(locale);
  const defaultImageToVideo = getDefaultImageToVideo(locale);

  const textToVideoSection = {
    ...defaultTextToVideo,
    ...(section.textToVideo || {}),
    items: section.textToVideo?.items?.length
      ? section.textToVideo.items
      : defaultTextToVideo.items,
    buttons: section.textToVideo?.buttons?.length
      ? section.textToVideo.buttons
      : defaultTextToVideo.buttons,
  };

  const imageToVideoSection = {
    ...defaultImageToVideo,
    ...(section.imageToVideo || {}),
    items: section.imageToVideo?.items?.length
      ? section.imageToVideo.items
      : defaultImageToVideo.items,
    buttons: section.imageToVideo?.buttons?.length
      ? section.imageToVideo.buttons
      : defaultImageToVideo.buttons,
  };

  // Transform textToVideo items to video carousel format
  const textToVideoSlides =
    textToVideoSection.items?.map((item: any) => ({
      prompt: item.prompt || '',
      src: item.videoSrc || '',
      url: item.url,
      target: item.target,
    })) || [];

  // Transform imageToVideo items to image-to-video format
  const imageToVideoSlides =
    imageToVideoSection.items?.map((item: any) => ({
      prompt: item.prompt || '',
      originalImage:
        typeof item.originalImage === 'string'
          ? item.originalImage
          : item.originalImage?.src || '',
      videoSrc: item.videoSrc || '',
      url: item.url,
      target: item.target,
    })) || [];

  const Divider = () => (
    <div className="my-10 h-px w-full bg-[linear-gradient(90deg,rgba(99,102,241,0.00)_0%,#6366f1_50%,rgba(99,102,241,0.00)_100%)]"></div>
  );

  return (
    <section
      id={section.id}
      className="dark space-y-16 bg-black pt-16 pb-16 text-white"
    >
      <div className="container">
        {/* Showcase Header */}
        <ShowcaseHeader
          title={
            section.title ||
            (locale.startsWith('zh')
              ? '看看 Seedance 2.0 能创作什么'
              : 'See What Seedance 2.0 Can Create')
          }
          description={
            section.description ||
            (locale.startsWith('zh')
              ? '从电影级场景到动态镜头演绎，探索 Seedance 2.0 多模态视频生成能力所带来的创作可能。'
              : "From cinematic scenes to dynamic motion videos, explore what's possible with Seedance 2.0 and its multimodal AI video generation workflow.")
          }
        />

        <Divider />

        {/* Text to Video Section */}
        {textToVideoSlides.length > 0 && (
          <div ref={textSectionRef}>
            <div className="mx-auto mb-12 text-center">
              <h3 className="mb-6 text-2xl font-bold text-pretty lg:text-3xl">
                {textToVideoSection.title}
              </h3>
              <div
                className="text-muted-foreground mb-4 max-w-xl text-white/70 lg:max-w-none lg:text-lg"
                dangerouslySetInnerHTML={{
                  __html: textToVideoSection.description || '',
                }}
              />
            </div>
            <div className="relative h-full w-full overflow-hidden pb-36">
              {showTextToVideo ? (
                <TextToVideoShowcase
                  section={{ ...section, textToVideo: textToVideoSection }}
                  slides={textToVideoSlides}
                />
              ) : (
                <div className="mx-auto h-[50vmin] max-h-[640px] min-h-[320px] w-[50vmin] max-w-[640px] min-w-[320px] rounded-[2rem] border border-white/10 bg-white/5" />
              )}
            </div>
          </div>
        )}

        <Divider />

        {/* Image to Video Section */}
        {imageToVideoSlides.length > 0 && (
          <div ref={imageSectionRef}>
            <div className="mx-auto mb-12 text-center">
              <h3 className="mb-6 text-2xl font-bold text-pretty lg:text-3xl">
                {imageToVideoSection.title}
              </h3>
              <div
                className="text-muted-foreground mb-4 max-w-xl text-white/70 lg:max-w-none lg:text-lg"
                dangerouslySetInnerHTML={{
                  __html: imageToVideoSection.description || '',
                }}
              />
            </div>
            <div className="relative h-full w-full overflow-hidden">
              {showImageToVideo ? (
                <ImageToVideoShowcase
                  section={{ ...section, imageToVideo: imageToVideoSection }}
                  slides={imageToVideoSlides}
                />
              ) : (
                <div className="mx-auto h-[640px] w-full max-w-6xl rounded-[2rem] border border-white/10 bg-white/5" />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
