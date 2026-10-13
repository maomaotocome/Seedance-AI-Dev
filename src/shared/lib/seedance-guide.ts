import { getTranslations } from 'next-intl/server';

import { envConfigs } from '@/config';
import type { SearchGuideSection } from '@/themes/default/blocks/search-guide';

import {
  breadcrumbSchema,
  faqSchema,
  organizationSchema,
  softwareApplicationSchema,
  structuredDataDates,
  structuredUrl,
} from './structured-data';
import { buildAbsoluteUrl } from './url';

export async function getSeedanceGuideContent(locale: string, slug: string) {
  const t = await getTranslations({ locale, namespace: `pages.${slug}` });
  const page = t.raw('page') as {
    title: string;
    sections: { hero: SearchGuideSection };
  };

  return { page, guide: page.sections.hero };
}

export function seedanceGuideGraph({
  locale,
  slug,
  title,
  guide,
}: {
  locale: string;
  slug: string;
  title: string;
  guide: SearchGuideSection;
}) {
  const pathname = `/${slug}`;
  const organization = organizationSchema();
  const dates = structuredDataDates(pathname);
  const primaryEntity = guide.show_generator
    ? softwareApplicationSchema({
        locale,
        pathname,
        name: title,
        description: guide.description,
        featureList: guide.quick_facts?.map(
          (fact) => `${fact.label}: ${fact.value}`
        ),
      })
    : {
        '@type': 'TechArticle',
        headline: title,
        description: guide.description,
        url: structuredUrl(pathname, locale),
        mainEntityOfPage: structuredUrl(pathname, locale),
        image: buildAbsoluteUrl(
          envConfigs.app_url,
          envConfigs.app_preview_image
        ),
        datePublished: dates.published,
        dateModified: dates.modified,
        inLanguage: locale,
        author: { '@id': organization['@id'] },
        publisher: { '@id': organization['@id'] },
      };

  return [
    organization,
    primaryEntity,
    breadcrumbSchema({ locale, pathname, title }),
    faqSchema(guide.faqs),
  ].filter(Boolean);
}
