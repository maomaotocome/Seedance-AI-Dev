import { setRequestLocale } from 'next-intl/server';

import { SeedanceGuidePage } from '@/shared/components/seo/seedance-guide-page';
import { getMetadata } from '@/shared/lib/seo';

const slug = 'unlimited-seedance-2-5';

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
  return <SeedanceGuidePage locale={locale} slug={slug} />;
}
