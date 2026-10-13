import type { ReactNode } from 'react';
import Image from 'next/image';
import { ArrowRight, Check, Clock3, ExternalLink } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import type { DirectorsDeskShot } from '@/config/directors-desk-media';
import { getSampleVideo, type SampleVideoId } from '@/config/sample-videos';
import type { VideoProductModel } from '@/config/video-models';
import { SampleVideoCard } from '@/shared/components/media/sample-video';
import { cn } from '@/shared/lib/utils';

type QuickFact = {
  label: string;
  value: string;
  description?: string;
};

type GuideSection = {
  id: string;
  kicker?: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  steps?: Array<{ title: string; description: string }>;
  table?: { headers: string[]; rows: string[][] };
  examples?: Array<{ label: string; text: string }>;
  samples?: SampleVideoId[];
  callout?: { title: string; text: string; tone?: 'note' | 'warning' };
};

export type SearchGuideSection = {
  id?: string;
  compact_header?: boolean;
  label?: string;
  title: string;
  description: string;
  verdict?: string;
  last_reviewed?: string;
  source_note?: string;
  primary_button?: { title: string; url: string };
  secondary_button?: { title: string; url: string };
  quick_facts?: QuickFact[];
  show_generator?: boolean;
  default_model?: VideoProductModel;
  sections?: GuideSection[];
  faqs?: Array<{ question: string; answer: string }>;
  sources?: Array<{ title: string; publisher: string; url: string }>;
  related?: Array<{ title: string; description: string; url: string }>;
  cta?: { title: string; description: string; button: string; url: string };
  className?: string;
};

// Guide copy may carry inline links as [label](/path) so body text can point
// at sibling guides with descriptive anchor text.
function renderInline(text: string): ReactNode[] {
  return text.split(/(\[[^\]]+\]\([^)\s]+\))/g).map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (!match || !/^(https?:\/\/|\/(?!\/)|#)/i.test(match[2])) return part;

    return (
      <Link
        key={`${match[2]}-${index}`}
        href={match[2]}
        className="text-director-orange-text focus-visible:outline-director-focus font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {match[1]}
      </Link>
    );
  });
}

export function SearchGuide({
  locale,
  section,
  generator,
  media,
}: {
  locale: string;
  section: SearchGuideSection;
  generator?: ReactNode;
  media?: DirectorsDeskShot;
}) {
  const isChinese = locale === 'zh';

  return (
    <article
      id={section.id || 'guide'}
      className={cn(
        'bg-director-paper text-director-paper-text',
        section.className
      )}
    >
      <header
        className={cn(
          'border-director-rule-dark bg-director-ink text-director-ink-text border-b pt-24 lg:pt-28',
          section.compact_header ? 'pb-8 lg:pb-10' : 'pb-16 lg:pb-20'
        )}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="mb-7 flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-[0.17em] text-white/55 uppercase">
            {section.label && (
              <span className="border-director-orange/45 bg-director-orange/10 text-director-orange border px-2.5 py-1">
                {section.label}
              </span>
            )}
            {section.last_reviewed && (
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5" />
                {section.last_reviewed}
              </span>
            )}
          </div>
          <div
            className={cn(
              'grid gap-10 lg:items-start',
              !section.compact_header &&
                'lg:grid-cols-[minmax(0,1.1fr)_minmax(19rem,0.68fr)]'
            )}
          >
            <div className="min-w-0">
              <h1
                className={cn(
                  'font-semibold tracking-[-0.035em] text-balance',
                  section.compact_header
                    ? 'max-w-[32ch] text-[clamp(2rem,4vw,3.5rem)] leading-[1.06]'
                    : 'max-w-[20ch] text-[clamp(2.5rem,5vw,4.5rem)] leading-none'
                )}
              >
                {section.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-white/75">
                {section.description}
              </p>
              {section.verdict && (
                <p className="border-director-orange mt-4 max-w-3xl border-l-2 pl-4 text-sm leading-6 text-white/82">
                  {section.verdict}
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                {section.primary_button && (
                  <Link
                    href={section.primary_button.url}
                    className="bg-director-orange text-director-orange-ink hover:bg-director-orange-hover focus-visible:outline-director-focus inline-flex min-h-11 items-center gap-2 rounded-md px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
                  >
                    {section.primary_button.title}
                    <ArrowRight className="size-4" />
                  </Link>
                )}
                {section.secondary_button && (
                  <Link
                    href={section.secondary_button.url}
                    className="focus-visible:outline-director-focus inline-flex min-h-11 items-center rounded-md border border-white/18 px-5 text-sm font-medium text-white transition-colors hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-4"
                  >
                    {section.secondary_button.title}
                  </Link>
                )}
              </div>
            </div>
            {media && !section.compact_header && (
              <figure className="border-director-rule-dark bg-director-carbon border">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={media.image}
                    alt={media.alt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 34vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="border-director-rule-dark border-t p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-semibold">{media.title}</span>
                    <span className="font-mono text-[9px] tracking-[0.08em] text-white/45 uppercase">
                      {media.badge || (isChinese ? '视觉研究' : 'Visual study')}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/58">
                    {media.metadata}
                  </p>
                </figcaption>
              </figure>
            )}
          </div>
        </div>
      </header>

      {section.quick_facts && section.quick_facts.length > 0 && (
        <section
          aria-label={isChinese ? '关键信息' : 'Quick facts'}
          className="border-b border-black/12"
        >
          <div className="container mx-auto grid max-w-6xl md:grid-cols-2 lg:grid-cols-4">
            {section.quick_facts.map((fact) => (
              <div
                key={`${fact.label}-${fact.value}`}
                className="border-b border-black/12 py-7 md:border-r md:px-6 md:first:pl-0 lg:border-b-0 lg:last:border-r-0"
              >
                <p className="font-mono text-[10px] tracking-[0.16em] text-black/48 uppercase">
                  {fact.label}
                </p>
                <p className="mt-2 text-xl font-semibold tracking-tight">
                  {fact.value}
                </p>
                {fact.description && (
                  <p className="mt-2 text-sm leading-6 text-black/58">
                    {fact.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {section.show_generator && generator && (
        <section className="border-b border-black/12 py-6 lg:py-8">
          <div className="container mx-auto max-w-6xl">{generator}</div>
        </section>
      )}

      <div className="container mx-auto grid max-w-6xl gap-12 py-14 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-20">
        <aside className="hidden lg:block">
          <nav
            aria-label={isChinese ? '本页目录' : 'On this page'}
            className="sticky top-28"
          >
            <p className="font-mono text-[10px] tracking-[0.16em] text-black/45 uppercase">
              {isChinese ? '本页目录' : 'On this page'}
            </p>
            <ul className="mt-4 space-y-3 border-l border-black/15 pl-4 text-sm text-black/58">
              {section.sections?.map((item) => (
                <li key={item.id}>
                  <a
                    className="transition-colors hover:text-black"
                    href={`#${item.id}`}
                  >
                    {item.title}
                  </a>
                </li>
              ))}
              {section.faqs && section.faqs.length > 0 && (
                <li>
                  <a className="transition-colors hover:text-black" href="#faq">
                    {isChinese ? '常见问题' : 'FAQ'}
                  </a>
                </li>
              )}
              {section.sources && section.sources.length > 0 && (
                <li>
                  <a
                    className="transition-colors hover:text-black"
                    href="#sources"
                  >
                    {isChinese ? '资料来源' : 'Sources'}
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </aside>

        <div className="min-w-0 space-y-16">
          {section.sections?.map((item, sectionIndex) => (
            <section key={item.id} id={item.id} className="scroll-mt-28">
              <div className="mb-7 border-b border-black/12 pb-5">
                <span className="text-director-orange-text block font-mono text-xs">
                  {String(sectionIndex + 1).padStart(2, '0')}
                </span>
                <div className="mt-3">
                  {item.kicker && (
                    <p className="mb-1 font-mono text-[10px] tracking-[0.16em] text-black/45 uppercase">
                      {item.kicker}
                    </p>
                  )}
                  <h2 className="text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
                    {item.title}
                  </h2>
                </div>
              </div>

              <div className="max-w-3xl space-y-5 text-[17px] leading-8 text-black/72">
                {item.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{renderInline(paragraph)}</p>
                ))}
              </div>

              {item.bullets && (
                <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                  {item.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex gap-3 border-t border-black/12 pt-3 text-sm leading-6 text-black/68"
                    >
                      <Check className="text-director-orange-text mt-1 size-4 shrink-0" />
                      <span>{renderInline(bullet)}</span>
                    </li>
                  ))}
                </ul>
              )}

              {item.steps && (
                <ol className="mt-8 grid gap-px overflow-hidden border border-black/12 bg-black/12 sm:grid-cols-2">
                  {item.steps.map((step, index) => (
                    <li key={step.title} className="bg-director-paper p-6">
                      <span className="text-director-orange-text font-mono text-xs">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3 className="mt-4 text-lg font-semibold tracking-tight">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-black/62">
                        {renderInline(step.description)}
                      </p>
                    </li>
                  ))}
                </ol>
              )}

              {item.table && (
                <div
                  role="region"
                  aria-label={item.title}
                  tabIndex={0}
                  className="focus-visible:outline-director-focus mt-8 overflow-x-auto border border-black/12 focus-visible:outline-2"
                >
                  <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                    <thead className="bg-director-paper-3">
                      <tr>
                        {item.table.headers.map((header) => (
                          <th
                            key={header}
                            scope="col"
                            className="border-b border-black/12 px-4 py-3 font-mono text-[11px] tracking-[0.08em] uppercase"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {item.table.rows.map((row, rowIndex) => (
                        <tr
                          key={`${item.id}-${rowIndex}`}
                          className="border-b border-black/10 last:border-0"
                        >
                          {row.map((cell, cellIndex) => (
                            <td
                              key={`${cell}-${cellIndex}`}
                              className={cn(
                                'px-4 py-4 align-top leading-6 text-black/68',
                                cellIndex === 0 && 'font-medium text-black'
                              )}
                            >
                              {renderInline(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {item.samples && (
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  {item.samples.map((id) => (
                    <SampleVideoCard
                      key={id}
                      sample={getSampleVideo(id, locale)}
                      locale={locale}
                    />
                  ))}
                </div>
              )}

              {item.examples && (
                <div className="mt-8 space-y-3">
                  {item.examples.map((example) => (
                    <div
                      key={example.label}
                      className="bg-director-ink text-director-ink-text border border-black/14 p-5 sm:p-6"
                    >
                      <p className="text-director-amber font-mono text-[10px] tracking-[0.16em] uppercase">
                        {example.label}
                      </p>
                      <pre className="mt-4 overflow-x-auto font-mono text-xs leading-6 whitespace-pre-wrap text-white/72 sm:text-sm">
                        {example.text}
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              {item.callout && (
                <div
                  className={cn(
                    'mt-8 border-l-2 p-5',
                    item.callout.tone === 'warning'
                      ? 'border-director-orange bg-director-orange/8'
                      : 'border-director-sage bg-director-sage/10'
                  )}
                >
                  <h3 className="text-sm font-semibold">
                    {item.callout.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-black/65">
                    {renderInline(item.callout.text)}
                  </p>
                </div>
              )}
            </section>
          ))}

          {section.faqs && section.faqs.length > 0 && (
            <section id="faq" className="scroll-mt-28">
              <div className="mb-7 border-b border-black/12 pb-5">
                <span className="text-director-orange-text block font-mono text-xs">
                  FAQ
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
                  {isChinese ? '常见问题' : 'Common questions'}
                </h2>
              </div>
              <div className="divide-y divide-black/12 border-y border-black/12">
                {section.faqs.map((faq) => (
                  <details key={faq.question} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold marker:content-none">
                      {faq.question}
                      <span className="text-director-orange-text font-mono text-xl font-normal group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-4 max-w-3xl pr-8 text-sm leading-7 text-black/65">
                      {renderInline(faq.answer)}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {section.sources && section.sources.length > 0 && (
            <section
              id="sources"
              className="scroll-mt-28 border-t border-black/12 pt-8"
            >
              <h2 className="font-mono text-xs tracking-[0.16em] text-black/48 uppercase">
                {isChinese ? '已复核资料来源' : 'Sources reviewed'}
              </h2>
              <ul className="mt-5 space-y-3">
                {section.sources.map((source) => (
                  <li key={source.url}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start justify-between gap-4 border-b border-black/10 pb-3 text-sm"
                    >
                      <span>
                        <strong className="font-medium text-black">
                          {source.publisher}
                        </strong>
                        <span className="text-black/55"> — {source.title}</span>
                      </span>
                      <ExternalLink className="group-hover:text-director-orange-text mt-0.5 size-4 shrink-0 text-black/35 transition-colors" />
                    </a>
                  </li>
                ))}
              </ul>
              {section.source_note && (
                <p className="mt-5 text-xs leading-5 text-black/48">
                  {section.source_note}
                </p>
              )}
            </section>
          )}
        </div>
      </div>

      {section.related && section.related.length > 0 && (
        <section className="bg-director-paper-3 border-y border-black/12 py-12">
          <div className="container mx-auto max-w-6xl">
            <p className="font-mono text-[10px] tracking-[0.16em] text-black/45 uppercase">
              {isChinese ? '继续了解' : 'Continue researching'}
            </p>
            <div className="mt-5 grid gap-px overflow-hidden border border-black/12 bg-black/12 md:grid-cols-3">
              {section.related.map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  className="group bg-director-paper-3 hover:bg-director-paper p-6 transition-colors"
                >
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-black/60">
                    {item.description}
                  </p>
                  <span className="text-director-orange-text mt-5 inline-flex items-center gap-2 text-xs font-semibold">
                    {isChinese ? '继续阅读' : 'Read next'}{' '}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {section.cta && (
        <section className="bg-director-ink text-director-ink-text py-14">
          <div className="container mx-auto flex max-w-6xl flex-col justify-between gap-8 sm:flex-row sm:items-center">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {section.cta.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/58">
                {section.cta.description}
              </p>
            </div>
            <Link
              href={section.cta.url}
              className="bg-director-orange text-director-orange-ink hover:bg-director-orange-hover focus-visible:outline-director-focus inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {section.cta.button}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      )}
    </article>
  );
}
