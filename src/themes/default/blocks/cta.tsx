import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function Cta({ section }: { section: Section }) {
  if (section.disabled) return null;

  return (
    <section
      id={section.id || section.name}
      className={cn(
        'bg-director-ink text-director-ink-text py-14 md:py-20',
        section.className
      )}
    >
      <div className="container">
        <div
          className={cn(
            'border-director-rule-dark grid items-center gap-8 border-t pt-10',
            section.image && 'lg:grid-cols-[1.15fr_0.85fr] lg:gap-16'
          )}
        >
          <div>
            {section.label && (
              <p className="text-director-orange text-xs font-bold tracking-[0.14em] uppercase">
                {section.label}
              </p>
            )}
            <h2 className="mt-4 max-w-4xl text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] font-medium tracking-[-0.035em] text-balance">
              {section.title}
            </h2>
            {section.description && (
              <p className="text-director-ink-muted mt-6 max-w-2xl text-base leading-7">
                {section.description}
              </p>
            )}
            {section.buttons && (
              <div className="mt-8 flex flex-wrap gap-3">
                {section.buttons.map((item, index) => (
                  <Link
                    key={`${item.title}-${index}`}
                    href={item.url || '#'}
                    className={cn(
                      'focus-visible:outline-director-amber inline-flex h-11 items-center justify-center gap-2 rounded-md border px-5 text-sm font-bold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
                      index === 0
                        ? 'border-director-orange bg-director-orange text-director-orange-ink hover:bg-director-orange-hover'
                        : 'text-director-ink-text border-white/15 hover:bg-white/5'
                    )}
                  >
                    {item.title}
                    {index === 0 && <ArrowRight className="size-4" />}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {section.image && (
            <Image
              src={section.image.src}
              alt={section.image.alt || ''}
              width={800}
              height={450}
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="aspect-video w-full rounded-md object-cover"
            />
          )}
        </div>
      </div>
    </section>
  );
}
