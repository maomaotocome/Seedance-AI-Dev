import { envConfigs } from '@/config';
import { defaultLocale } from '@/config/locale';
import { buildAbsoluteUrl } from '@/shared/lib/url';

const DEFAULT_STRUCTURED_DATA_DATES = {
  published: '2026-08-22',
  modified: '2026-08-22',
};

const STRUCTURED_DATA_DATES_BY_PATH: Record<
  string,
  { published: string; modified: string }
> = {
  '/seedance-2-0': { published: '2026-08-22', modified: '2026-10-13' },
  '/unlimited-seedance-2-5': {
    published: '2026-08-22',
    modified: '2026-10-13',
  },
  '/seedance-2-5-vs-2-0': {
    published: '2026-08-22',
    modified: '2026-10-13',
  },
  '/seedance-2-5-api': { published: '2026-08-22', modified: '2026-10-13' },
  '/seedance-2-5-prompt-guide': {
    published: '2026-08-22',
    modified: '2026-10-13',
  },
  '/seedance-2-5-free': { published: '2026-08-22', modified: '2026-10-13' },
  '/what-is-seedance': { published: '2026-10-03', modified: '2026-10-13' },
  '/seedance-3-0': { published: '2026-10-03', modified: '2026-10-13' },
};

export function structuredDataDates(pathname: string) {
  return (
    STRUCTURED_DATA_DATES_BY_PATH[pathname] || DEFAULT_STRUCTURED_DATA_DATES
  );
}

export function structuredUrl(pathname: string, locale: string) {
  return buildAbsoluteUrl(envConfigs.app_url, pathname, locale, defaultLocale);
}

export function organizationSchema() {
  const url = buildAbsoluteUrl(envConfigs.app_url, '/');

  return {
    '@type': 'Organization',
    '@id': `${url}#organization`,
    name: 'Seedance AI',
    alternateName: 'SeedanceAI.dev',
    description:
      'Independent AI video workspace with model-aware controls and visible product credit pricing.',
    url,
    logo: buildAbsoluteUrl(envConfigs.app_url, envConfigs.app_logo),
    email: 'hello@seedanceai.dev',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'hello@seedanceai.dev',
      availableLanguage: ['English', 'Chinese'],
    },
  };
}

export function faqSchema(
  items?: Array<{
    title?: string;
    description?: string;
    question?: string;
    answer?: string;
  }>
) {
  if (!items?.length) return null;

  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question || item.title || '',
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer || item.description || '',
      },
    })),
  };
}

export function softwareApplicationSchema({
  locale,
  pathname = '/ai-video-generator',
  name,
  description,
  featureList,
}: {
  locale: string;
  pathname?: string;
  name: string;
  description: string;
  featureList?: string[];
}) {
  return {
    '@type': 'SoftwareApplication',
    name,
    description,
    url: structuredUrl(pathname, locale),
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    inLanguage: locale,
    featureList: featureList || [
      'Text to video',
      'Image to video',
      'Model-aware output controls',
      'Visible product credit cost before generation',
    ],
    publisher: {
      '@id': `${buildAbsoluteUrl(envConfigs.app_url, '/')}#organization`,
    },
  };
}

export function breadcrumbSchema({
  locale,
  pathname,
  title,
}: {
  locale: string;
  pathname: string;
  title: string;
}) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: locale === 'zh' ? '首页' : 'Home',
        item: structuredUrl('/', locale),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: title,
        item: structuredUrl(pathname, locale),
      },
    ],
  };
}
