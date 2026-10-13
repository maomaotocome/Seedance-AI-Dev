import type { SampleVideo } from '@/config/sample-videos';
import { cn } from '@/shared/lib/utils';

import { SampleActions } from './sample-actions';

export function SampleVideoCard({
  sample,
  locale,
  className,
  compact = false,
  tone = 'paper',
}: {
  sample: SampleVideo;
  locale: string;
  className?: string;
  compact?: boolean;
  tone?: 'paper' | 'ink';
}) {
  const ink = tone === 'ink';
  const isChinese = locale.startsWith('zh');
  const settings = [
    sample.modelLabel,
    sample.resolution,
    isChinese ? `${sample.duration} 秒` : `${sample.duration}s`,
    isChinese ? `${sample.credits} 积分` : `${sample.credits} credits`,
  ];

  return (
    <figure
      className={cn(
        'flex min-w-0 flex-col overflow-hidden',
        ink
          ? 'studio-contact text-director-ink-text'
          : compact
            ? 'text-director-paper-text'
            : 'text-director-paper-text rounded-lg border border-black/12',
        className
      )}
    >
      <video
        {...{ loading: 'lazy' }}
        controls
        playsInline
        preload="none"
        poster={sample.poster}
        aria-label={`${sample.modelLabel}: ${sample.title}`}
        className="bg-director-ink aspect-video w-full rounded-lg"
      >
        <source src={sample.src} type="video/mp4" />
      </video>
      <figcaption
        className={cn(
          'flex flex-1 flex-col gap-3',
          ink || compact ? 'pt-4' : 'border-t border-black/12 p-4 sm:p-5'
        )}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-base leading-snug font-semibold tracking-[-0.02em]">
            {sample.title}
          </h3>
          <span
            className={cn(
              'text-[11px]',
              compact && 'sr-only',
              ink ? 'text-director-ink-muted' : 'text-black/55'
            )}
          >
            {isChinese
              ? '模型原始输出 · 有声音'
              : 'Unedited output · has sound'}
          </span>
        </div>
        <p
          className={cn(
            'font-mono text-[11px] leading-5',
            ink ? 'text-director-ink-muted' : 'text-director-paper-muted'
          )}
        >
          {settings.join(' · ')}
          {sample.mode === 'image' &&
            (isChinese ? ' · 首帧图片输入' : ' · first-frame image input')}
        </p>
        {compact ? (
          <details className="group text-sm">
            <summary
              className={cn(
                'flex min-h-10 cursor-pointer list-none items-center justify-between border-y py-2 text-xs font-medium',
                ink
                  ? 'text-director-ink-muted border-white/12'
                  : 'text-director-paper-muted border-black/10'
              )}
            >
              {isChinese ? '查看原始提示词' : 'View original prompt'}
              <span
                aria-hidden="true"
                className="text-lg transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p
              className={cn(
                'py-3 text-sm leading-6',
                ink ? 'text-director-ink-muted' : 'text-black/72'
              )}
            >
              {sample.prompt}
            </p>
          </details>
        ) : (
          <p className="text-sm leading-6 text-black/72">
            <span className="font-mono text-[10px] tracking-[0.12em] text-black/65 uppercase">
              {isChinese ? '提示词' : 'Prompt'}
            </span>
            <br />
            {sample.prompt}
          </p>
        )}
        <SampleActions sample={sample} locale={locale} tone={tone} />
      </figcaption>
    </figure>
  );
}
