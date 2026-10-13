import { getTranslations, setRequestLocale } from 'next-intl/server';

import { JsonLd } from '@/shared/components/seo/json-ld';
import { getMetadata } from '@/shared/lib/seo';
import {
  breadcrumbSchema,
  faqSchema,
  organizationSchema,
} from '@/shared/lib/structured-data';
import { Pricing } from '@/themes/default/blocks/pricing';
import { PricingDetails } from '@/themes/default/blocks/pricing-details';

export const revalidate = 3600;

export const generateMetadata = getMetadata({
  metadataKey: 'pages.pricing.metadata',
  canonicalUrl: '/pricing',
});

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.pricing');
  const title = t('metadata.title');
  const sections = t.raw('page.sections');

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            organizationSchema(),
            breadcrumbSchema({ locale, pathname: '/pricing', title }),
            faqSchema(sections.faq.items),
          ],
        }}
      />
      <Pricing section={sections.pricing} />
      <PricingDetails section={sections} />
    </>
  );
}
