import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function Features({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const steps = section.layout === 'staggered';
  const titleId = `${section.id || 'features'}-title`;
  const visual = section.visual;
  return (
    <section
      id={section.id}
      aria-labelledby={titleId}
      className={cn(
        'py-14 lg:py-20',
        steps
          ? 'bg-director-paper text-director-paper-text'
          : 'bg-director-carbon text-director-ink-text',
        className
      )}
    >
      <div className="container grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
        <div>
          <h2
            id={titleId}
            className="max-w-[22ch] text-[clamp(1.8rem,3vw,2.8rem)] leading-[1.12] font-medium tracking-[-0.035em] text-balance"
          >
            {section.title}
          </h2>
          <p
            className={cn(
              'mt-5 max-w-lg text-sm leading-7',
              steps ? 'text-director-paper-muted' : 'text-director-ink-muted'
            )}
          >
            {section.description}
          </p>
          {visual && (
            <figure className="mt-8">
              <Image
                src={visual.src}
                alt={visual.alt}
                width={800}
                height={450}
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="aspect-video w-full rounded-md object-cover"
              />
              <figcaption className="text-director-paper-muted mt-3 text-xs">
                {visual.caption}
              </figcaption>
            </figure>
          )}
          {section.button && (
            <Link
              href={section.button.url}
              className="studio-text-link mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
            >
              {section.button.title}
              <ArrowUpRight className="size-4" />
            </Link>
          )}
        </div>
        <div
          className={cn(
            'divide-y',
            steps ? 'divide-black/15' : 'divide-white/15'
          )}
        >
          {section.items?.map((item, index) => (
            <article
              key={item.title}
              className={cn(
                'grid grid-cols-[2rem_1fr] gap-4 py-6 first:pt-0 last:pb-0',
                !steps && 'lg:py-5'
              )}
            >
              {steps ? (
                <span className="text-director-orange-text pt-1 font-mono text-xs">
                  {String(index + 1).padStart(2, '0')}
                </span>
              ) : (
                <span className="text-director-sage pt-1">
                  {item.icon && (
                    <SmartIcon name={item.icon as string} size={19} />
                  )}
                </span>
              )}
              <div>
                <h3 className="text-lg font-medium tracking-[-0.02em]">
                  {item.title}
                </h3>
                <p
                  className={cn(
                    'mt-2 max-w-lg text-sm leading-6',
                    steps
                      ? 'text-director-paper-muted'
                      : 'text-director-ink-muted'
                  )}
                >
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
