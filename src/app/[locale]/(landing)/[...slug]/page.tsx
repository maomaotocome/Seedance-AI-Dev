import { notFound } from 'next/navigation';
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from 'next-intl/server';

import { envConfigs } from '@/config';
import { JsonLd } from '@/shared/components/seo/json-ld';
import { getLocalizedAlternates } from '@/shared/lib/seo';
import {
  breadcrumbSchema,
  faqSchema,
  organizationSchema,
  softwareApplicationSchema,
  structuredDataDates,
  structuredUrl,
} from '@/shared/lib/structured-data';
import { buildAbsoluteUrl } from '@/shared/lib/url';
import { getLocalPage } from '@/shared/models/post';
import { SearchGuide } from '@/themes/default/blocks/search-guide';
import { SearchGuideGenerator } from '@/themes/default/blocks/search-guide-generator';
import StaticPage from '@/themes/default/pages/static-page';

export const revalidate = 3600;

// Message namespaces that already have a dedicated route. Serving them here
// too would publish an indexable duplicate (for example /index for the home page).
const RESERVED_PAGE_SLUGS = new Set(['index', 'pricing', 'blog']);

function getPageMessages(messages: Record<string, any>, pageSlug: string) {
  if (RESERVED_PAGE_SLUGS.has(pageSlug)) return undefined;

  return pageSlug
    .split('.')
    .filter(Boolean)
    .reduce<any>((value, segment) => value?.[segment], messages.pages);
}

// dynamic page metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  // metadata values
  let title = '';
  let description = '';
  // 1. try to get static page metadata from
  // content/pages/**/*.mdx

  // static page slug
  const staticPageSlug =
    typeof slug === 'string' ? slug : (slug as string[]).join('/') || '';

  // filter invalid slug
  if (staticPageSlug.includes('.')) {
    return;
  }

  const alternates = getLocalizedAlternates(staticPageSlug || '/', locale);

  // get static page content
  const staticPage = await getLocalPage({ slug: staticPageSlug, locale });

  // return static page metadata
  if (staticPage) {
    title = staticPage.title || '';
    description = staticPage.description || '';

    return {
      title,
      description,
      alternates,
    };
  }

  // 2. static page not found, try to get dynamic page metadata from
  // src/config/locale/messages/{locale}/pages/**/*.json

  // dynamic page slug
  const dynamicPageSlug =
    typeof slug === 'string' ? slug : (slug as string[]).join('.') || '';

  const messages = (await getMessages({ locale })) as Record<string, any>;
  const dynamicPage = getPageMessages(messages, dynamicPageSlug);

  // return dynamic page metadata
  if (dynamicPage?.metadata) {
    title = dynamicPage.metadata.title || '';
    description = dynamicPage.metadata.description || '';
    const canonical = alternates.canonical;
    const image = buildAbsoluteUrl(
      envConfigs.app_url,
      envConfigs.app_preview_image
    );

    return {
      title,
      description,
      alternates,
      openGraph: {
        type: 'website',
        locale,
        url: canonical,
        title,
        description,
        siteName: envConfigs.app_name,
        images: [image],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
      robots: { index: true, follow: true },
    };
  }

  // 3. return common metadata
  const tc = await getTranslations('common.metadata');

  title = tc('title');
  description = tc('description');

  return {
    title,
    description,
    alternates,
  };
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  // 1. try to get static page from
  // content/pages/**/*.mdx

  // static page slug
  const staticPageSlug =
    typeof slug === 'string' ? slug : (slug as string[]).join('/') || '';

  // filter invalid slug
  if (staticPageSlug.includes('.')) {
    return notFound();
  }

  // get static page content
  const staticPage = await getLocalPage({ slug: staticPageSlug, locale });

  // return static page
  if (staticPage) {
    const Page = StaticPage;

    return <Page locale={locale} post={staticPage} />;
  }

  // 2. static page not found
  // try to get dynamic page content from
  // src/config/locale/messages/{locale}/pages/**/*.json

  // dynamic page slug
  const dynamicPageSlug =
    typeof slug === 'string' ? slug : (slug as string[]).join('.') || '';

  const messages = (await getMessages({ locale })) as Record<string, any>;
  const dynamicPage = getPageMessages(messages, dynamicPageSlug);

  // return dynamic page
  if (dynamicPage?.page) {
    const page = dynamicPage.page as any;
    const guide = page.sections?.hero;
    const Guide =
      guide?.block === 'search-guide-generator'
        ? SearchGuideGenerator
        : SearchGuide;

    if (
      guide?.block === 'search-guide' ||
      guide?.block === 'search-guide-generator'
    ) {
      const pathname = `/${staticPageSlug}`;
      const organization = organizationSchema();
      const dates = structuredDataDates(pathname);
      const primaryEntity = guide.show_generator
        ? softwareApplicationSchema({
            locale,
            pathname,
            name: page.title,
            description: guide.description,
          })
        : {
            '@type': 'TechArticle',
            headline: page.title,
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

      const graph = [
        organization,
        primaryEntity,
        breadcrumbSchema({ locale, pathname, title: page.title }),
        faqSchema(guide.faqs),
      ].filter(Boolean);

      return (
        <>
          <JsonLd
            data={{ '@context': 'https://schema.org', '@graph': graph }}
          />
          <Guide locale={locale} section={guide} />
        </>
      );
    }

    return notFound();
  }

  // 3. page not found
  return notFound();
}
