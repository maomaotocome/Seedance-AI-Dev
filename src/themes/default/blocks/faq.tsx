import { ChevronDown } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function Faq({ section }: { section: Section }) {
  if (section.disabled) return null;
  const titleId = `${section.id || section.name || 'faq'}-title`;

  return (
    <section
      id={section.id || section.name}
      aria-labelledby={titleId}
      className={cn(
        'border-director-rule-light bg-director-paper text-director-paper-text border-y py-14 lg:py-20',
        section.className
      )}
    >
      <div className="container">
        {section.label && (
          <p className="text-director-paper-text text-xs font-bold tracking-[0.14em] uppercase">
            {section.label}
          </p>
        )}
        <div
          className={cn(
            'grid items-start gap-10 lg:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1.3fr)] lg:gap-16',
            section.label ? 'mt-5' : 'mt-0'
          )}
        >
          <header>
            <h2
              id={titleId}
              className="max-w-[18ch] text-[clamp(2rem,3.6vw,3.4rem)] leading-[1.04] font-semibold tracking-[-0.035em] text-balance"
            >
              {section.title}
            </h2>
            {section.description && (
              <p className="text-director-paper-muted mt-6 max-w-md text-[15px] leading-7 md:text-base">
                {section.description}
              </p>
            )}
          </header>

          <div className="border-director-rule-light border-t">
            {section.items?.map((item, index) => (
              <details
                key={`${item.title}-${index}`}
                className="border-director-rule-light group border-b"
              >
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-[15px] font-medium marker:hidden">
                  <span>{item.title}</span>
                  <ChevronDown className="text-director-paper-muted size-4 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="text-director-paper-muted max-w-3xl pb-6 text-sm leading-7">
                  {item.description}
                </p>
                {item.button && (
                  <Link
                    href={item.button.url || '/pricing'}
                    className="text-director-paper-text mb-6 inline-flex min-h-8 items-center text-sm font-semibold underline underline-offset-4"
                  >
                    {item.button.title} →
                  </Link>
                )}
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
