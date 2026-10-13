import { setRequestLocale } from 'next-intl/server';

import { SeedanceGeneratorGuidePage } from '@/shared/components/seo/seedance-generator-guide-page';
import { getMetadata } from '@/shared/lib/seo';

const slug = 'wan-2-7-video-generator';

export const revalidate = 3600;
export const generateMetadata = getMetadata({
  metadataKey: `pages.${slug}.metadata`,
  canonicalUrl: `/${slug}`,
});

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SeedanceGeneratorGuidePage locale={locale} slug={slug} />;
}
