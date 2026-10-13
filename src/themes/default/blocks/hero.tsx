import { ArrowRight, Check } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { SeedanceGeneratorPanel } from '@/shared/blocks/generator/video';
import { GeneratorSamples } from '@/shared/components/media/generator-samples';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

function HighlightedTitle({
  title,
  highlight,
  tone = 'dark',
}: {
  title?: string;
  highlight?: string;
  tone?: 'dark' | 'light';
}) {
  if (!title) return null;
  if (!highlight || !title.includes(highlight)) return <>{title}</>;

  const [before, after] = title.split(highlight, 2);
  return (
    <>
      {before}
      <span
        className={cn(
          'whitespace-normal',
          tone === 'light' ? 'text-director-orange-text' : 'text-director-amber'
        )}
      >
        {highlight}
      </span>
      {after}
    </>
  );
}

function HomeHero({ section }: { section: Section }) {
  const facts = Array.isArray(section.facts) ? section.facts : [];
  const [headline, versions] = (section.title || '').split(/[:：]/, 2);

  return (
    <section
      id={section.id}
      className={cn(
        'home-studio bg-director-paper text-director-paper-text pt-24 pb-10 sm:pt-28 lg:pt-24 lg:pb-14',
        section.className
      )}
    >
      <div className="container">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-12">
          <div className="min-w-0">
            <p className="text-director-paper-muted flex items-center gap-2 text-xs font-medium sm:text-sm">
              <span
                className="bg-director-sage size-2 rounded-full"
                aria-hidden="true"
              />
              {section.status}
            </p>
            <h1 className="mt-4 max-w-[14ch] text-[clamp(2.3rem,4.5vw,4.2rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance">
              <HighlightedTitle
                title={headline}
                highlight={section.highlight_text}
                tone="light"
              />
              {versions && (
                <>
                  <span className="sr-only">: </span>
                  <span className="text-director-paper-text mt-3 block text-[clamp(1.05rem,1.8vw,1.5rem)] leading-snug font-medium tracking-[-0.015em]">
                    {versions.trim()}
                  </span>
                </>
              )}
            </h1>
            {section.description && (
              <p className="text-director-paper-muted mt-4 max-w-[43ch] text-sm leading-6 sm:text-base sm:leading-7">
                {section.description}
              </p>
            )}
            <div className="mt-6 hidden flex-wrap items-center gap-3 lg:flex">
              {section.buttons?.map((item, index) => (
                <Button
                  key={item.title}
                  asChild
                  variant={index === 0 ? 'default' : 'outline'}
                  className={cn(
                    'h-11 rounded-md px-5 text-sm font-semibold shadow-none',
                    index === 0
                      ? 'bg-director-orange text-director-orange-ink hover:bg-director-orange-hover'
                      : 'border-director-rule-light text-director-paper-text hover:bg-director-paper-2 hover:text-director-paper-text dark:border-director-rule-light dark:hover:bg-director-paper-2 dark:hover:text-director-paper-text bg-transparent dark:bg-transparent'
                  )}
                >
                  <Link href={item.url || '#seedance-generator'}>
                    {item.title}
                    {index === 0 && (
                      <ArrowRight className="size-4" aria-hidden="true" />
                    )}
                  </Link>
                </Button>
              ))}
            </div>
            {section.disclaimer && (
              <p className="text-director-paper-muted mt-5 hidden max-w-sm text-xs leading-5 lg:block">
                {section.disclaimer}
              </p>
            )}
          </div>
          <div className="hidden min-w-0 lg:block">
            <GeneratorSamples />
          </div>
        </div>

        <div className="mt-6 lg:mt-7">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-[-0.025em] lg:text-xl">
              {section.workspace_title}
            </h2>
            <Link
              href="/pricing#video-budget"
              className="text-director-paper-muted studio-text-link hidden min-h-8 items-center gap-1 text-xs font-medium sm:inline-flex"
            >
              {section.cost_link_label}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          <SeedanceGeneratorPanel variant="hero" defaultModel="seedance-2.5" />
        </div>
        {facts.length > 0 && (
          <ul className="text-director-paper-muted mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs">
            {facts.slice(0, 3).map((fact: any) => (
              <li key={fact.title} className="flex items-center gap-1.5">
                <Check className="size-3.5" aria-hidden="true" />
                {fact.title}
              </li>
            ))}
          </ul>
        )}
        {section.disclaimer && (
          <p className="text-director-paper-muted mt-4 text-xs leading-5 lg:hidden">
            {section.disclaimer}
          </p>
        )}
      </div>
    </section>
  );
}

function StandardHero({ section }: { section: Section }) {
  return (
    <section
      id={section.id}
      className={cn(
        'bg-director-ink text-director-ink-text relative overflow-hidden pt-24 pb-32 md:pt-28 md:pb-40',
        section.className
      )}
    >
      <div className="relative container">
        <div className="max-w-4xl">
          {section.label && (
            <p className="text-director-orange text-xs font-bold tracking-[0.14em] uppercase">
              {section.label}
            </p>
          )}
          <h1 className="mt-4 max-w-[16ch] text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.94] font-semibold tracking-[-0.035em] text-balance">
            <HighlightedTitle
              title={section.title}
              highlight={section.highlight_text || section.highlight_title}
            />
          </h1>
          {section.description && (
            <p className="text-director-ink-muted mt-6 max-w-2xl text-base leading-7 sm:text-lg">
              {section.description}
            </p>
          )}
          {section.tip && (
            <p className="text-director-sage mt-4 flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0" />
              {section.tip}
            </p>
          )}
          {section.buttons && (
            <div className="mt-8 flex flex-wrap gap-3">
              {section.buttons.map((item, index) => (
                <Button
                  key={`${item.title}-${index}`}
                  asChild
                  variant={index === 0 ? 'default' : 'outline'}
                  className={cn(
                    'focus-visible:outline-director-amber h-11 rounded-md px-5 font-bold focus-visible:outline-2 focus-visible:outline-offset-2',
                    index === 0
                      ? 'bg-director-orange text-director-orange-ink hover:bg-director-orange-hover'
                      : 'text-director-ink-text border-white/15 bg-transparent hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Link href={item.url || '#'}>{item.title}</Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function Hero({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const merged = { ...section, className: cn(section.className, className) };
  if (section.variant === 'home' || section.show_generator) {
    return <HomeHero section={merged} />;
  }
  return <StandardHero section={merged} />;
}
