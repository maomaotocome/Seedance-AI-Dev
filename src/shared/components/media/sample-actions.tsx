'use client';

import { useState } from 'react';

import { Link } from '@/core/i18n/navigation';
import type { SampleVideo } from '@/config/sample-videos';
import {
  getAnalyticsPageGroup,
  rememberAnalyticsEntryPage,
  trackAnalyticsEvent,
} from '@/shared/lib/analytics';
import { cn } from '@/shared/lib/utils';

export function SampleActions({
  sample,
  locale,
  tone = 'paper',
  showCopy = true,
}: {
  sample: SampleVideo;
  locale: string;
  tone?: 'paper' | 'ink';
  showCopy?: boolean;
}) {
  const ink = tone === 'ink';
  const zh = locale.startsWith('zh');
  const [notice, setNotice] = useState('');
  return (
    <div className="mt-auto flex flex-wrap items-center gap-3 pt-2 text-sm">
      {showCopy && (
        <button
          type="button"
          className={cn(
            'min-h-11 rounded-md border px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
            ink
              ? 'border-white/20 hover:bg-white/5'
              : 'border-black/25 hover:bg-black/5'
          )}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(sample.prompt);
              setNotice(zh ? '已复制' : 'Copied');
            } catch {
              setNotice(
                zh
                  ? '请选中上方提示词复制'
                  : 'Select the prompt above to copy it'
              );
            }
          }}
        >
          {zh ? '复制提示词' : 'Copy prompt'}
        </button>
      )}
      <Link
        href={`/ai-video-generator?sample=${sample.id}#seedance-generator`}
        className={cn(
          'inline-flex min-h-11 items-center rounded-md px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
          ink
            ? 'text-director-ink-text bg-white/10 hover:bg-white/15'
            : 'bg-director-paper-text text-director-paper'
        )}
        onClick={(event) => {
          rememberAnalyticsEntryPage();
          trackAnalyticsEvent('sample_selected', {
            sample_id: sample.id,
            page_group: getAnalyticsPageGroup(),
            content_locale: locale,
          });
          if (document.getElementById('seedance-generator')) {
            event.preventDefault();
            window.dispatchEvent(
              new CustomEvent('seedance:sample', { detail: sample.id })
            );
            document
              .getElementById('seedance-generator')
              ?.scrollIntoView({ block: 'start', behavior: 'auto' });
          }
        }}
      >
        {zh ? '使用这组设置' : 'Use these settings'}
      </Link>
      <span
        role="status"
        className={cn(
          'text-xs',
          ink ? 'text-director-ink-muted' : 'text-director-paper-muted'
        )}
      >
        {notice}
      </span>
    </div>
  );
}
