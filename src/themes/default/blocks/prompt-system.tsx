import { ArrowRight, Check } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { Section } from '@/shared/types/blocks/landing';

export function PromptSystem({ section }: { section: Section }) {
  const titleId = `${section.id || 'prompt-system'}-title`;
  return (
    <section
      id={section.id}
      aria-labelledby={titleId}
      className="bg-director-ink text-director-ink-text py-16 lg:py-24"
    >
      <div className="container grid items-start gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-20">
        <div>
          <h2
            id={titleId}
            className="max-w-[20ch] text-[clamp(1.8rem,3vw,2.8rem)] leading-[1.12] font-medium tracking-[-0.035em] text-balance"
          >
            {section.title}
          </h2>
          <p className="text-director-ink-muted mt-5 max-w-lg text-sm leading-7">
            {section.description}
          </p>
          <h3 className="mt-8 text-sm font-medium">
            {section.checkpoints_label}
          </h3>
          <ul className="mt-4 space-y-4">
            {section.tips?.map((tip: string) => (
              <li
                key={tip}
                className="text-director-ink-muted flex items-start gap-3 text-sm leading-6"
              >
                <Check className="text-director-sage mt-1 size-3.5 shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
          <Link
            href={section.button?.url || '/seedance-2-5-prompt-guide'}
            className="studio-text-link mt-7 inline-flex min-h-11 items-center gap-3 text-sm font-medium"
          >
            {section.button?.title}
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div>
          <div className="bg-director-paper text-director-paper-text rounded-md p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4 border-b border-black/15 pb-4 text-xs">
              <span className="font-medium">{section.timeline_label}</span>
              <span className="text-director-paper-muted font-mono">
                {section.timeline_duration}
              </span>
            </div>
            <ol className="divide-y divide-black/15">
              {section.prompt?.map((step: any) => (
                <li
                  key={step.time}
                  className="grid gap-3 py-5 sm:grid-cols-[6.2rem_1fr] sm:gap-5"
                >
                  <span className="text-director-orange-text pt-1 font-mono text-[10px]">
                    {step.time}
                  </span>
                  <div>
                    <h3 className="text-base font-medium">{step.title}</h3>
                    <p className="text-director-paper-muted mt-1 text-sm leading-6">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="text-director-ink-muted mt-5 text-xs leading-6">
            <p className="text-director-ink-text">{section.spine_label}</p>
            <p>
              {section.spine_description} {section.spine_note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
