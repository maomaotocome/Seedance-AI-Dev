import { ArrowUpRight, Check } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/shared/lib/utils';
import type { Section } from '@/shared/types/blocks/landing';

export function ModelRoster({ section }: { section: Section }) {
  if (section.layout === 'compact') {
    return (
      <section
        id={section.id}
        aria-labelledby={`${section.id || 'model-roster'}-title`}
        className="border-director-rule-dark bg-director-carbon text-director-ink-text border-y py-10 sm:py-12"
      >
        <div className="container">
          <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-2">
            <h2
              id={`${section.id || 'model-roster'}-title`}
              className="text-2xl font-medium tracking-[-0.025em] sm:text-3xl"
            >
              {section.title}
            </h2>
            {section.description && (
              <p className="text-director-ink-muted max-w-xl text-sm leading-6">
                {section.description}
              </p>
            )}
          </div>
          <ul className="border-director-rule-dark bg-director-rule-dark mt-6 grid gap-px border sm:grid-cols-2 lg:grid-cols-4">
            {section.items?.map((item, index) => (
              <li key={`${item.title}-${index}`} className="flex">
                <Link
                  href={item.url || '/ai-video-generator'}
                  className="bg-director-carbon focus-visible:outline-director-focus group flex w-full items-start justify-between gap-4 p-5 transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                >
                  <span>
                    <span className="block text-base font-semibold tracking-tight">
                      {item.title}
                    </span>
                    <span className="text-director-ink-muted mt-1 block text-xs leading-5">
                      {item.points?.join(' · ')}
                    </span>
                  </span>
                  <ArrowUpRight className="text-director-ink-muted group-hover:text-director-ink-text mt-0.5 size-4 shrink-0 transition-colors" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id || 'model-roster'}-title`}
      className="border-director-rule-light bg-director-paper text-director-paper-text border-y py-16 sm:py-20 lg:py-24"
    >
      <div className="container">
        {section.label && (
          <p className="text-director-orange-text font-mono text-[11px] font-bold tracking-[0.14em] uppercase">
            {section.label}
          </p>
        )}
        <div
          className={cn(
            'grid items-start gap-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(19rem,0.92fr)] lg:gap-16',
            section.label ? 'mt-5' : 'mt-0'
          )}
        >
          <h2
            id={`${section.id || 'model-roster'}-title`}
            className="max-w-[18ch] text-[clamp(2.7rem,5vw,5rem)] leading-[0.96] font-bold tracking-[-0.035em] text-balance"
          >
            {section.title}
          </h2>
          {section.description && (
            <p className="text-director-paper-muted max-w-xl pt-1 text-[15px] leading-7 md:text-base lg:pt-3">
              {section.description}
            </p>
          )}
        </div>

        <div className="border-director-rule-light bg-director-rule-light mt-12 grid gap-px border sm:grid-cols-2">
          {section.items?.map((item, index) => {
            // The first model is the practical starting point for most visitors;
            // give it a clear visual anchor while keeping the rest of the roster quiet.
            const isFeatured = index === 0;

            return (
              <Link
                key={`${item.title}-${index}`}
                href={item.url || '/ai-video-generator'}
                className={cn(
                  'focus-visible:outline-director-focus group relative flex min-h-60 flex-col p-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] md:p-8',
                  isFeatured
                    ? 'bg-director-carbon text-director-ink-text hover:bg-director-carbon/95'
                    : 'bg-director-paper-2 text-director-paper-text hover:bg-director-paper-3'
                )}
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'font-mono text-[11px]',
                        isFeatured
                          ? 'text-director-ink-muted'
                          : 'text-director-paper-muted'
                      )}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        'border px-2 py-1 font-mono text-[9px] font-bold tracking-[0.08em] uppercase',
                        isFeatured
                          ? 'border-director-sage/25 bg-director-sage/10 text-director-sage'
                          : 'border-director-sage/35 bg-director-sage/10 text-director-paper-text'
                      )}
                    >
                      {item.status}
                    </span>
                  </div>
                  <ArrowUpRight
                    className={cn(
                      'size-5 transition-colors',
                      isFeatured
                        ? 'text-director-ink-muted group-hover:text-director-orange'
                        : 'text-director-paper-muted group-hover:text-director-orange-text'
                    )}
                  />
                </div>

                <h3 className="mt-8 text-[clamp(1.45rem,2.2vw,2rem)] font-bold tracking-[-0.025em]">
                  {item.title}
                </h3>
                <p
                  className={cn(
                    'mt-3 max-w-xl text-sm leading-6',
                    isFeatured
                      ? 'text-director-ink-muted'
                      : 'text-director-paper-muted'
                  )}
                >
                  {item.description}
                </p>
                <div
                  className={cn(
                    'mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-7 text-xs',
                    isFeatured
                      ? 'text-director-ink-text'
                      : 'text-director-paper-text'
                  )}
                >
                  {item.points?.map((point: string) => (
                    <span
                      key={point}
                      className="inline-flex items-center gap-1.5"
                    >
                      <Check
                        className={cn(
                          'size-3',
                          isFeatured
                            ? 'text-director-orange'
                            : 'text-director-orange-text'
                        )}
                      />
                      {point}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
