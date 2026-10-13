import { ArrowUpRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { getSampleVideo, HOME_SAMPLE_IDS } from '@/config/sample-videos';
import { SampleVideoCard } from '@/shared/components/media/sample-video';
import type { Section } from '@/shared/types/blocks/landing';

type SampleReelSection = Section & {
  provenance?: string;
  button?: { title: string; url: string };
};

export function SampleReel({
  locale = 'en',
  section,
}: {
  locale?: string;
  section: SampleReelSection;
}) {
  const titleId = `${section.id || 'sample-reel'}-title`;

  return (
    <section
      id={section.id}
      aria-labelledby={titleId}
      className="border-director-rule-light bg-director-paper text-director-paper-text scroll-mt-20 border-y py-14 sm:py-16 lg:scroll-mt-24 lg:py-20"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,0.48fr)] lg:items-end lg:gap-14">
          <header className="min-w-0">
            {section.label && (
              <p className="text-director-orange-text font-mono text-[10px] font-bold tracking-[0.18em] uppercase">
                {section.label}
              </p>
            )}
            <h2
              id={titleId}
              className="mt-3 max-w-[26ch] text-[clamp(1.9rem,3.2vw,2.8rem)] leading-[1.1] font-semibold tracking-[-0.03em] text-balance"
            >
              {section.title}
            </h2>
            {section.description && (
              <p className="text-director-paper-muted mt-4 max-w-2xl text-sm leading-6">
                {section.description}
              </p>
            )}
          </header>

          <div className="border-director-rule-light border-l pl-5">
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

        <div className="mt-8 grid min-w-0 gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
          {HOME_SAMPLE_IDS.map((id) => (
            <SampleVideoCard
              key={id}
              sample={getSampleVideo(id, locale)}
              locale={locale}
              compact
            />
          ))}
        </div>
      </div>
    </section>
  );
}
