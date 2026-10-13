import { getTranslations, setRequestLocale } from 'next-intl/server';

import { VideoGenerator } from '@/shared/blocks/generator/video';
import { JsonLd } from '@/shared/components/seo/json-ld';
import { getMetadata } from '@/shared/lib/seo';
import {
  breadcrumbSchema,
  organizationSchema,
  softwareApplicationSchema,
} from '@/shared/lib/structured-data';

export const revalidate = 3600;

export const generateMetadata = getMetadata({
  metadataKey: 'ai.video.metadata',
  canonicalUrl: '/ai-video-generator',
});

export default async function AiVideoGeneratorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // get ai video data
  const t = await getTranslations('ai.video');

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            organizationSchema(),
            softwareApplicationSchema({
              locale,
              name: t('metadata.title'),
              description: t('metadata.description'),
            }),
            breadcrumbSchema({
              locale,
              pathname: '/ai-video-generator',
              title: t('metadata.title'),
            }),
          ],
        }}
      />
      <VideoGenerator />
    </>
  );
}
