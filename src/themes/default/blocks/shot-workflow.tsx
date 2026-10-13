import { ArrowUpRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { getSampleVideo } from '@/config/sample-videos';
import { SampleActions } from '@/shared/components/media/sample-actions';
import { SceneVideo } from '@/shared/components/media/scene-video';
import type { Section } from '@/shared/types/blocks/landing';

export function ShotWorkflow({
  section,
  locale,
}: {
  section: Section;
  locale: string;
}) {
  const zh = locale.startsWith('zh');
  const sample = getSampleVideo('anime-25', locale);
  const titleId = `${section.id}-title`;
  return (
    <section
      id={section.id}
      aria-labelledby={titleId}
      className="bg-director-paper text-director-paper-text scroll-mt-20 py-16 lg:py-20"
    >
      <div className="container">
        <header className="grid gap-5 lg:grid-cols-2 lg:items-end lg:gap-16">
          <h2
            id={titleId}
            className="text-[clamp(1.8rem,3.2vw,3rem)] leading-[1.12] font-semibold tracking-[-0.03em] text-balance"
          >
            {section.title}
          </h2>
          <p className="text-director-paper-muted max-w-xl text-sm leading-7">
            {section.description}
          </p>
        </header>
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
          <figure className="min-w-0">
            <SceneVideo
              src={sample.src}
              poster="/media/samples/seedance-anime-25-action.webp"
              title={
                zh
                  ? '黄色雨衣角色跃过城市水洼的动漫动作镜头'
                  : 'An animated character in a yellow raincoat leaps over a city puddle'
              }
              playLabel={
                zh ? '播放动漫动作示例' : 'Play the anime action example'
              }
              errorLabel={
                zh
                  ? '视频暂不可用，点击重试。'
                  : 'Video unavailable. Select play to retry.'
              }
              sizes="(min-width: 1280px) 660px, (min-width: 1024px) 52vw, 90vw"
            />
            <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-medium">{section.scene_title}</span>
              <span className="text-director-paper-muted font-mono">
                {sample.modelLabel} · 480p · 5{zh ? ' 秒' : 's'} ·{' '}
                {sample.credits} {zh ? '积分' : 'credits'}
              </span>
            </figcaption>
            <div className="border-director-rule-light mt-5 border-l-2 pl-4">
              <p className="text-director-paper-muted mb-2 text-xs font-semibold">
                {section.prompt_label}
              </p>
              <p className="text-director-paper-text text-sm leading-6">
                {sample.prompt}
              </p>
            </div>
            <SampleActions sample={sample} locale={locale} />
            <p className="text-director-paper-muted mt-3 text-xs leading-5">
              {section.provenance}
            </p>
          </figure>
          <div>
            <ol className="divide-director-rule-light divide-y">
              {section.items?.map((step, index) => (
                <li
                  key={step.title}
                  className="grid grid-cols-[2rem_minmax(0,1fr)] gap-4 py-5 first:pt-0"
                >
                  <span className="text-director-orange-text pt-1 font-mono text-xs">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-lg font-medium tracking-[-0.02em]">
                      {step.title}
                    </h3>
                    <p className="text-director-paper-muted mt-2 text-sm leading-6">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <Link
              href="/seedance-2-5-prompt-guide"
              className="studio-text-link text-director-paper-text mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
            >
              {section.guide_label}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
