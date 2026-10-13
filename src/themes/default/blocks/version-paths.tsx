import { Check } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { getSampleVideo } from '@/config/sample-videos';
import { SampleActions } from '@/shared/components/media/sample-actions';
import { SceneVideo } from '@/shared/components/media/scene-video';
import { Section } from '@/shared/types/blocks/landing';

export function VersionPaths({
  section,
  locale = 'en',
}: {
  section: Section;
  locale?: string;
}) {
  const zh = locale.startsWith('zh');
  return (
    <section
      id={section.id}
      className="bg-director-ink text-director-ink-text scroll-mt-20 py-16 lg:py-20"
    >
      <div className="container">
        <header className="grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-20">
          <h2 className="max-w-[20ch] text-[clamp(1.8rem,3.2vw,3rem)] leading-[1.12] font-medium tracking-[-0.035em] text-balance">
            {section.title}
          </h2>
          <p className="text-director-ink-muted max-w-xl text-sm leading-7">
            {section.description}
          </p>
        </header>
        <div className="border-director-rule-dark mt-7 flex flex-wrap items-baseline justify-between gap-3 border-t pt-5">
          <p className="text-base font-medium sm:text-lg">
            {section.scene_title}
          </p>
          <p className="text-director-ink-muted text-xs">
            {section.scene_note}
          </p>
        </div>
        <div className="mt-5 grid gap-10 md:grid-cols-2 md:gap-6">
          {section.items?.map((item, index) => {
            const sample = getSampleVideo(
              index === 0 ? 'camera-25' : 'camera-20',
              locale
            );
            return (
              <article key={item.version}>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h3 className="text-2xl font-medium tracking-[-0.03em]">
                    {item.title}
                  </h3>
                  <span className="text-director-ink-muted text-xs">
                    {item.status}
                  </span>
                </div>
                <SceneVideo
                  src={sample.src}
                  poster={`/media/samples/seedance-${sample.id}-reveal.webp`}
                  title={
                    zh
                      ? `${item.title}：日出山脊上的徒步者`
                      : `${item.title}: a hiker on a mountain ridge at sunrise`
                  }
                  playLabel={
                    zh
                      ? `播放 ${item.title} 运镜对照`
                      : `Play ${item.title} camera comparison`
                  }
                  errorLabel={
                    zh
                      ? '视频暂不可用，点击重试。'
                      : 'Video unavailable. Select play to retry.'
                  }
                  sizes="(min-width: 1280px) 590px, (min-width: 768px) 45vw, 90vw"
                />
                <p className="text-director-ink-muted mt-3 font-mono text-[10px]">
                  {zh ? '本站样片' : 'Our sample'} · {sample.resolution} ·{' '}
                  {sample.duration}s · {sample.credits}{' '}
                  {zh ? '积分' : 'credits'}
                </p>
                <p className="text-director-ink-muted mt-5 max-w-xl text-sm leading-6">
                  {item.description}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {item.points?.map((point: string) => (
                    <li key={point} className="flex items-start gap-2 text-sm">
                      <Check className="text-director-sage mt-0.5 size-4 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-white/15 pt-3 text-sm">
                  <SampleActions
                    sample={sample}
                    locale={locale}
                    tone="ink"
                    showCopy={false}
                  />
                  <Link
                    href={item.secondary?.url || '/seedance-2-5-vs-2-0'}
                    className="text-director-ink-muted min-h-10 content-center underline underline-offset-4"
                  >
                    {item.secondary?.title}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
        <details className="border-director-rule-dark text-director-ink-muted mt-7 border-t pt-3 text-xs">
          <summary className="min-h-11 cursor-pointer content-center font-medium">
            {section.prompt_label}
          </summary>
          <p className="max-w-4xl pb-4 text-sm leading-6">
            {getSampleVideo('camera-25', locale).prompt}
          </p>
        </details>
      </div>
    </section>
  );
}
