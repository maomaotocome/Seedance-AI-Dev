import type { DirectorsDeskShot } from '@/config/directors-desk-media';
import { SeedanceGeneratorPanel } from '@/shared/blocks/generator/video';

import { SearchGuide, type SearchGuideSection } from './search-guide';

export function SearchGuideGenerator({
  locale,
  section,
  media,
}: {
  locale: string;
  section: SearchGuideSection;
  media?: DirectorsDeskShot;
}) {
  return (
    <SearchGuide
      locale={locale}
      section={section}
      media={media}
      generator={
        <SeedanceGeneratorPanel
          variant="embedded"
          defaultModel={section.default_model || 'seedance-2.5'}
        />
      }
    />
  );
}
