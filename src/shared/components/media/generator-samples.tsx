'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Play, Volume2 } from 'lucide-react';
import { useLocale } from 'next-intl';

import {
  getSampleVideo,
  type SampleVideo,
  type SampleVideoId,
} from '@/config/sample-videos';
import { cn } from '@/shared/lib/utils';

import { SampleActions } from './sample-actions';

const examples: SampleVideoId[] = ['i2v-25', 'dialogue-25', 'camera-25'];

function SampleScreen({
  sample,
  zh,
  locale,
}: {
  sample: SampleVideo;
  zh: boolean;
  locale: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState(false);
  return (
    <figure className="bg-director-ink relative isolate overflow-hidden">
      <video
        ref={video}
        tabIndex={started ? 0 : -1}
        controls={started}
        playsInline
        preload="none"
        poster={sample.poster}
        aria-label={sample.title}
        onError={() => setError(true)}
        className={cn(
          'aspect-video w-full',
          started ? 'object-contain' : 'object-cover'
        )}
      >
        <source src={sample.src} type="video/mp4" />
      </video>
      {!started && (
        <>
          <div
            aria-hidden="true"
            className="studio-screen-shade pointer-events-none absolute inset-0"
          />
          <div className="absolute top-4 right-4 left-4 flex items-center justify-between gap-3 text-white">
            <span className="rounded-sm bg-black/60 px-2.5 py-1.5 text-[11px]">
              {zh ? 'Seedance 2.5 · 真实输出' : 'Seedance 2.5 · real output'}
            </span>
            <span className="flex items-center gap-1.5 rounded-sm bg-black/60 px-2 py-1.5 text-[11px]">
              <Volume2 className="size-3.5" />
              {zh ? '原始声音' : 'Original audio'}
            </span>
          </div>
          <button
            type="button"
            className="studio-play absolute top-1/2 left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-black/25 text-white focus-visible:outline-2 focus-visible:outline-offset-4 sm:size-16"
            aria-label={
              zh ? `播放样片：${sample.title}` : `Play sample: ${sample.title}`
            }
            onClick={async () => {
              setError(false);
              setStarted(true);
              try {
                await video.current?.play();
                video.current?.focus();
              } catch {
                setStarted(false);
                setError(true);
              }
            }}
          >
            <Play className="ml-0.5 size-6 fill-current" />
          </button>
          <figcaption className="pointer-events-none absolute right-5 bottom-5 left-5 text-white sm:bottom-6 sm:left-6">
            <p className="max-w-[65%] text-lg leading-tight font-medium tracking-[-0.02em]">
              {sample.title}
            </p>
            <p className="mt-2 font-mono text-[11px] text-white/85">
              {sample.resolution} · {sample.duration}
              {zh ? ' 秒' : 's'} · {sample.credits} {zh ? '积分' : 'credits'}
            </p>
          </figcaption>
        </>
      )}
      <div
        className={cn(
          'absolute right-4',
          started ? 'bg-director-ink/90 top-4 rounded-md' : 'bottom-4'
        )}
      >
        <SampleActions
          sample={sample}
          locale={locale}
          tone="ink"
          showCopy={false}
        />
      </div>
      {started && (
        <figcaption className="sr-only">
          {sample.title} · {sample.resolution} · {sample.duration}s ·{' '}
          {sample.credits} {zh ? '积分' : 'credits'}
        </figcaption>
      )}
      {error && (
        <p
          role="status"
          className="bg-director-carbon text-director-ink-text px-5 py-3 text-sm"
        >
          {zh
            ? '播放暂不可用，请重试。'
            : 'Playback is unavailable. Please try again.'}
        </p>
      )}
    </figure>
  );
}

export function GeneratorSamples() {
  const locale = useLocale();
  const [selected, setSelected] = useState<SampleVideoId>('i2v-25');
  const sample = getSampleVideo(selected, locale);
  const zh = locale.startsWith('zh');
  const labels = zh
    ? ['人物动作', '对白与声音', '运镜与空间']
    : ['Character motion', 'Dialogue & sound', 'Camera movement'];
  return (
    <div className="bg-director-carbon text-director-ink-text overflow-hidden rounded-lg border border-black/10 shadow-[0_8px_24px_-16px_rgb(0_0_0/35%)]">
      <SampleScreen key={selected} sample={sample} zh={zh} locale={locale} />
      <div className="px-4 pt-3 pb-3">
        <div
          role="group"
          aria-label={zh ? '选择样片' : 'Choose a sample'}
          className="grid grid-cols-3 gap-2"
        >
          {examples.map((id, index) => {
            const item = getSampleVideo(id, locale);
            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected === id}
                onClick={() => setSelected(id)}
                className={cn(
                  'studio-film-thumb flex min-h-11 min-w-0 items-center gap-2 rounded-md p-1 text-left outline-offset-4',
                  selected === id
                    ? 'bg-white/8 opacity-100'
                    : 'hover:bg-white/5'
                )}
              >
                <div
                  className={cn(
                    'w-14 shrink-0 overflow-hidden rounded-sm border-2',
                    selected === id
                      ? 'border-director-amber'
                      : 'border-transparent'
                  )}
                >
                  <Image
                    src={item.poster}
                    width={800}
                    height={450}
                    sizes="56px"
                    alt=""
                    className="aspect-video w-full object-cover"
                  />
                </div>
                <span className="block text-[11px] leading-4">
                  {labels[index]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
