import type { MetadataRoute } from 'next';

import { envConfigs } from '@/config';
import { defaultLocale, locales } from '@/config/locale';
import { buildAbsoluteUrl } from '@/shared/lib/url';

const SEARCH_ROUTES = [
  {
    path: '/',
    priority: 1,
    changeFrequency: 'weekly' as const,
    lastModified: '2026-10-13',
  },
  {
    path: '/ai-video-generator',
    priority: 0.95,
    changeFrequency: 'weekly' as const,
    lastModified: '2026-10-13',
  },
  {
    path: '/seedance-2-5-free',
    priority: 0.9,
    changeFrequency: 'weekly' as const,
    lastModified: '2026-10-13',
  },
  {
    path: '/seedance-2-0',
    priority: 0.8,
    changeFrequency: 'monthly' as const,
    lastModified: '2026-10-13',
  },
  {
    path: '/seedance-2-5-vs-2-0',
    priority: 0.85,
    changeFrequency: 'monthly' as const,
    lastModified: '2026-10-13',
  },
  {
    path: '/seedance-2-5-prompt-guide',
    priority: 0.85,
    changeFrequency: 'monthly' as const,
    lastModified: '2026-10-13',
  },
  {
    path: '/seedance-2-5-api',
    priority: 0.8,
    changeFrequency: 'weekly' as const,
    lastModified: '2026-10-13',
  },
  {
    path: '/unlimited-seedance-2-5',
    priority: 0.75,
    changeFrequency: 'weekly' as const,
    lastModified: '2026-10-13',
  },
  {
    path: '/what-is-seedance',
    priority: 0.8,
    changeFrequency: 'monthly' as const,
    lastModified: '2026-10-13',
  },
  {
    path: '/seedance-3-0',
    priority: 0.7,
    changeFrequency: 'weekly' as const,
    lastModified: '2026-10-13',
  },
  {
    path: '/kling-3-0-ai-video-generator',
    priority: 0.9,
    changeFrequency: 'weekly' as const,
    lastModified: '2026-10-03',
  },
  {
    path: '/wan-2-7-video-generator',
    priority: 0.88,
    changeFrequency: 'weekly' as const,
    lastModified: '2026-10-03',
  },
  {
    path: '/minimax-h3-video-generator',
    priority: 0.88,
    changeFrequency: 'weekly' as const,
    lastModified: '2026-10-03',
  },
  {
    path: '/grok-imagine-video-1-5',
    priority: 0.86,
    changeFrequency: 'weekly' as const,
    lastModified: '2026-10-03',
  },
  {
    path: '/pricing',
    priority: 0.7,
    changeFrequency: 'monthly' as const,
    lastModified: '2026-10-13',
  },
  {
    path: '/about',
    priority: 0.5,
    changeFrequency: 'monthly' as const,
    lastModified: '2026-08-29',
  },
  {
    path: '/privacy-policy',
    priority: 0.2,
    changeFrequency: 'yearly' as const,
    lastModified: '2026-08-29',
  },
  {
    path: '/terms-of-service',
    priority: 0.2,
    changeFrequency: 'yearly' as const,
    lastModified: '2026-08-29',
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return SEARCH_ROUTES.flatMap((route) => {
    const languages = Object.fromEntries(
      locales.map((locale) => [
        locale,
        buildAbsoluteUrl(envConfigs.app_url, route.path, locale, defaultLocale),
      ])
    );

    const alternates = {
      languages: {
        ...languages,
        'x-default': languages[defaultLocale],
      },
    };

    return locales.map((locale) => ({
      url: languages[locale],
      lastModified: new Date(`${route.lastModified}T00:00:00.000Z`),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates,
    }));
  });
}
