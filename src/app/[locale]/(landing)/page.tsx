import { getTranslations, setRequestLocale } from 'next-intl/server';

import { JsonLd } from '@/shared/components/seo/json-ld';
import { getMetadata } from '@/shared/lib/seo';
import {
  faqSchema,
  organizationSchema,
  softwareApplicationSchema,
  structuredUrl,
} from '@/shared/lib/structured-data';
import { DynamicPage } from '@/shared/types/blocks/landing';
import HomePage from '@/themes/default/pages/home-page';

export const revalidate = 3600;

export const generateMetadata = getMetadata({
  metadataKey: 'pages.index.metadata',
  canonicalUrl: '/',
});

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.index');

  // get page data
  const page: DynamicPage = t.raw('page');

  const faqItems = (page.sections?.faq as any)?.items;
  const organization = organizationSchema();
  const graph = [
    organization,
    {
      '@type': 'WebSite',
      name: 'Seedance AI',
      url: structuredUrl('/', locale),
      inLanguage: locale,
      description: t('metadata.description'),
      publisher: { '@id': organization['@id'] },
    },
    softwareApplicationSchema({
      locale,
      name: 'Seedance AI Video Generator',
      description: t('metadata.description'),
    }),
    faqSchema(faqItems),
  ].filter(Boolean);

  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': graph }} />
      <HomePage locale={locale} page={page} />
    </>
  );
}
