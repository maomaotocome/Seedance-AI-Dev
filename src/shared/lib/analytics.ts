'use client';

type AnalyticsPrimitive = string | number | boolean;
type AnalyticsItem = Record<string, AnalyticsPrimitive>;
type AnalyticsValue = AnalyticsPrimitive | AnalyticsItem[];
type AnalyticsParameters = Record<string, AnalyticsValue | null | undefined>;

export type AnalyticsPageGroup =
  | 'home'
  | 'generator'
  | 'free'
  | 'unlimited'
  | 'comparison'
  | 'prompt_guide'
  | 'api'
  | 'pricing'
  | 'model_landing'
  | 'app_generator'
  | 'other';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const EVENT_NAME_PATTERN = /^[a-z][a-z0-9_]{0,39}$/;
const ENTRY_PAGE_GROUP_KEY = 'seedance_entry_page_group';

export function getAnalyticsPageGroup(pathname?: string): AnalyticsPageGroup {
  const currentPath =
    pathname ||
    (typeof window !== 'undefined' ? window.location.pathname : '/');
  const normalizedPath = currentPath.replace(/^\/zh(?=\/|$)/, '') || '/';

  if (normalizedPath === '/') return 'home';
  if (normalizedPath === '/ai-video-generator') return 'generator';
  if (normalizedPath === '/seedance-2-5-free') return 'free';
  if (normalizedPath === '/unlimited-seedance-2-5') return 'unlimited';
  if (normalizedPath === '/seedance-2-5-vs-2-0') return 'comparison';
  if (normalizedPath === '/seedance-2-5-prompt-guide') return 'prompt_guide';
  if (normalizedPath === '/seedance-2-5-api') return 'api';
  if (normalizedPath === '/pricing') return 'pricing';
  if (normalizedPath === '/app/video-generator') return 'app_generator';
  if (
    /^\/(seedance-2-0|kling-3-0-ai-video-generator|wan-2-7-video-generator|minimax-h3-video-generator|grok-imagine-video-1-5)$/.test(
      normalizedPath
    )
  ) {
    return 'model_landing';
  }
  return 'other';
}

export function rememberAnalyticsEntryPage() {
  if (typeof window === 'undefined') return;
  try {
    if (!window.sessionStorage.getItem(ENTRY_PAGE_GROUP_KEY))
      window.sessionStorage.setItem(
        ENTRY_PAGE_GROUP_KEY,
        getAnalyticsPageGroup()
      );
  } catch {
    /* Browser storage may be blocked. */
  }
}

export function getAnalyticsEntryPageGroup(): AnalyticsPageGroup {
  if (typeof window === 'undefined') return 'other';
  let stored: string | null = null;
  try {
    stored = window.sessionStorage.getItem(ENTRY_PAGE_GROUP_KEY);
  } catch {
    return getAnalyticsPageGroup();
  }
  const allowed = new Set<AnalyticsPageGroup>([
    'home',
    'generator',
    'free',
    'unlimited',
    'comparison',
    'prompt_guide',
    'api',
    'pricing',
    'model_landing',
    'app_generator',
    'other',
  ]);
  return allowed.has(stored as AnalyticsPageGroup)
    ? (stored as AnalyticsPageGroup)
    : getAnalyticsPageGroup();
}

/**
 * Sends a small, PII-free product event to the configured Google tag.
 * If gtag has not loaded yet, queue the command in dataLayer for replay.
 */
export function trackAnalyticsEvent(
  eventName: string,
  parameters: AnalyticsParameters = {}
) {
  if (typeof window === 'undefined' || !EVENT_NAME_PATTERN.test(eventName)) {
    return;
  }

  const cleanParameters = Object.fromEntries(
    Object.entries(parameters).filter(
      (entry): entry is [string, AnalyticsValue] =>
        entry[1] !== null && entry[1] !== undefined
    )
  );

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

  window.gtag('event', eventName, cleanParameters);
}
