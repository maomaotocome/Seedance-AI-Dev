import { getGuideVisualMedia } from '@/config/directors-desk-media';
import { JsonLd } from '@/shared/components/seo/json-ld';
import {
  getSeedanceGuideContent,
  seedanceGuideGraph,
} from '@/shared/lib/seedance-guide';
import { SearchGuide } from '@/themes/default/blocks/search-guide';

export async function SeedanceGuidePage({
  locale,
  slug,
}: {
  locale: string;
  slug: string;
}) {
  const { page, guide } = await getSeedanceGuideContent(locale, slug);
  const graph = seedanceGuideGraph({
    locale,
    slug,
    title: page.title,
    guide,
  });
  const media = getGuideVisualMedia(slug, locale);

  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': graph }} />
      <SearchGuide locale={locale} section={guide} media={media} />
    </>
  );
}
