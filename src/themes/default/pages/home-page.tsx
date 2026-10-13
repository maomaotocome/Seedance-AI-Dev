import type { DynamicPage } from '@/shared/types/blocks/landing';

import { Cta } from '../blocks/cta';
import { Faq } from '../blocks/faq';
import { Features } from '../blocks/features';
import { Hero } from '../blocks/hero';
import { ModelRoster } from '../blocks/model-roster';
import { PromptSystem } from '../blocks/prompt-system';
import { SampleReel } from '../blocks/sample-reel';
import { ShotWorkflow } from '../blocks/shot-workflow';
import { VersionPaths } from '../blocks/version-paths';

// Keep the public homepage's client graph independent of the template gallery.
// Copy, ordering and visibility still come from the bilingual page configuration.
export default function HomePage({
  locale,
  page,
}: {
  locale: string;
  page: DynamicPage;
}) {
  return (
    <>
      {page.show_sections?.map((key) => {
        const section = page.sections?.[key];
        if (!section || section.disabled) return null;
        switch (section.block || key) {
          case 'hero':
            return <Hero key={key} section={section} />;
          case 'features':
            return <Features key={key} section={section} />;
          case 'shot-workflow':
            return <ShotWorkflow key={key} section={section} locale={locale} />;
          case 'sample-reel':
            return <SampleReel key={key} section={section} locale={locale} />;
          case 'version-paths':
            return <VersionPaths key={key} section={section} locale={locale} />;
          case 'prompt-system':
            return <PromptSystem key={key} section={section} />;
          case 'model-roster':
            return <ModelRoster key={key} section={section} />;
          case 'faq':
            return <Faq key={key} section={section} />;
          case 'cta':
            return <Cta key={key} section={section} />;
          default:
            throw new Error(
              `Unsupported home section: ${section.block || key}`
            );
        }
      })}
    </>
  );
}
