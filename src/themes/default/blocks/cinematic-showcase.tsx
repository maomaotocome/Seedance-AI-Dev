import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { getDirectorsDeskShots } from '@/config/directors-desk-media';
import { CinematicLoop } from '@/shared/components/media/cinematic-loop';
import type { Section } from '@/shared/types/blocks/landing';

type ShowcaseSection = Section & {
  provenance?: string;
  button?: { title: string; url: string };
};

export function CinematicShowcase({
  locale = 'en',
  section,
}: {
  locale?: string;
  section: ShowcaseSection;
}) {
  const isChinese = locale.startsWith('zh');
  const shots = getDirectorsDeskShots(locale);
  const [lead, ...supporting] = shots;

  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id || 'shot-studies'}-title`}
      className="border-director-rule-light bg-director-paper text-director-paper-text scroll-mt-20 border-y py-16 sm:py-20 lg:scroll-mt-24 lg:py-28"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.58fr)] lg:items-start lg:gap-14">
          <header className="min-w-0">
            {section.label && (
              <p className="text-director-orange-text font-mono text-[10px] font-bold tracking-[0.18em] uppercase">
                {section.label}
              </p>
            )}
            <h2
              id={`${section.id || 'shot-studies'}-title`}
              className="mt-4 max-w-[16ch] text-[clamp(2.35rem,4.5vw,4.2rem)] leading-[0.95] font-semibold tracking-[-0.035em]"
            >
              {section.title}
            </h2>
            {section.description && (
              <p className="text-director-paper-muted mt-6 max-w-xl text-[15px] leading-7">
                {section.description}
              </p>
            )}
          </header>

          <div className="border-director-rule-light border-t pt-5">
            <p className="text-director-paper-muted max-w-xl text-xs leading-5">
              {section.provenance}
            </p>
            {section.button && (
              <Link
                href={section.button.url}
                className="text-director-paper-text decoration-director-orange focus-visible:outline-director-focus mt-5 inline-flex min-h-11 items-center gap-2 font-semibold underline decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                {section.button.title}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            )}
          </div>
        </div>

        <div className="mt-10 grid min-w-0 gap-5 lg:grid-cols-12 lg:gap-4">
          <figure className="border-director-rule-light bg-director-paper-2 flex min-w-0 flex-col border lg:col-span-7">
            {lead.video ? (
              <CinematicLoop
                src={lead.video}
                poster={lead.poster}
                label={lead.alt}
                playLabel={isChinese ? '播放研究' : 'Play study'}
                pauseLabel={isChinese ? '暂停研究' : 'Pause study'}
                className="aspect-[16/10]"
              />
            ) : (
              <div className="relative aspect-[16/10]">
                <Image
                  src={lead.image}
                  alt={lead.alt}
                  fill
                  sizes="(min-width: 1024px) 62vw, 100vw"
                  className="object-cover"
                />
              </div>
            )}
            <figcaption className="border-director-rule-light grid flex-1 gap-3 border-t p-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:p-5">
              <span className="text-director-orange-text font-mono text-xs">
                01
              </span>
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold tracking-tight">
                    {lead.title}
                  </h3>
                  <span className="text-director-paper-muted font-mono text-[9px] tracking-[0.1em] uppercase">
                    {lead.metadata}
                  </span>
                </div>
                <p className="text-director-paper-muted mt-2 text-sm leading-6">
                  {lead.direction}
                </p>
              </div>
            </figcaption>
          </figure>

          <div className="grid min-w-0 gap-4 lg:col-span-5 lg:grid-rows-2">
            {supporting.map((shot, index) => (
              <figure
                key={shot.id}
                className="border-director-rule-light bg-director-paper-2 grid min-w-0 border sm:grid-cols-[minmax(8rem,0.78fr)_minmax(0,1.22fr)]"
              >
                <div className="relative aspect-[16/10] min-h-0 sm:aspect-auto">
                  <Image
                    src={shot.image}
                    alt={shot.alt}
                    fill
                    loading="lazy"
                    sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="border-director-rule-light flex min-w-0 flex-col justify-center border-t p-4 sm:border-t-0 sm:border-l lg:p-5">
                  <span className="text-director-orange-text font-mono text-xs">
                    {String(index + 2).padStart(2, '0')}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight">
                    {shot.title}
                  </h3>
                  <p className="text-director-paper-muted mt-2 font-mono text-[9px] leading-4 tracking-[0.08em] uppercase">
                    {shot.metadata}
                  </p>
                  <p className="text-director-paper-muted mt-3 text-sm leading-6">
                    {shot.direction}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
