import { envConfigs } from '@/config';
import { defaultTheme } from '@/config/theme';

type ComponentLoader = () => Promise<any>;

// Explicit imports let Next.js split public blocks. A template-string import
// creates a directory-wide context and pulls unrelated generator/demo code
// into small editorial pages.
const defaultPageLoaders: Record<string, ComponentLoader> = {
  'dynamic-page': () =>
    import('@/themes/default/pages/dynamic-page').then(
      (module) => module.default
    ),
  'static-page': () =>
    import('@/themes/default/pages/static-page').then(
      (module) => module.default
    ),
};

const defaultLayoutLoaders: Record<string, ComponentLoader> = {
  landing: () =>
    import('@/themes/default/layouts/landing').then((module) => module.default),
};

const defaultBlockLoaders: Record<string, ComponentLoader> = {
  blog: () =>
    import('@/themes/default/blocks/blog').then((module) => module.Blog),
  'blog-detail': () =>
    import('@/themes/default/blocks/blog-detail').then(
      (module) => module.BlogDetail
    ),
  'community-showcase': () =>
    import('@/themes/default/blocks/community-showcase').then(
      (module) => module.CommunityShowcase
    ),
  comparison: () =>
    import('@/themes/default/blocks/comparison').then(
      (module) => module.Comparison
    ),
  'cinematic-showcase': () =>
    import('@/themes/default/blocks/cinematic-showcase').then(
      (module) => module.CinematicShowcase
    ),
  'sample-reel': () =>
    import('@/themes/default/blocks/sample-reel').then(
      (module) => module.SampleReel
    ),
  'cta-bg': () =>
    import('@/themes/default/blocks/cta-bg').then((module) => module.default),
  cta: () => import('@/themes/default/blocks/cta').then((module) => module.Cta),
  faq: () => import('@/themes/default/blocks/faq').then((module) => module.Faq),
  'features-accordion': () =>
    import('@/themes/default/blocks/features-accordion').then(
      (module) => module.FeaturesAccordion
    ),
  'features-flow': () =>
    import('@/themes/default/blocks/features-flow').then(
      (module) => module.FeaturesFlow
    ),
  'features-list': () =>
    import('@/themes/default/blocks/features-list').then(
      (module) => module.FeaturesList
    ),
  'features-media': () =>
    import('@/themes/default/blocks/features-media').then(
      (module) => module.FeaturesMedia
    ),
  'features-step': () =>
    import('@/themes/default/blocks/features-step').then(
      (module) => module.FeaturesStep
    ),
  features: () =>
    import('@/themes/default/blocks/features').then(
      (module) => module.Features
    ),
  footer: () =>
    import('@/themes/default/blocks/footer').then((module) => module.Footer),
  header: () =>
    import('@/themes/default/blocks/header').then((module) => module.Header),
  'hero-bg': () =>
    import('@/themes/default/blocks/hero-bg').then((module) => module.default),
  hero: () =>
    import('@/themes/default/blocks/hero').then((module) => module.Hero),
  logos: () =>
    import('@/themes/default/blocks/logos').then((module) => module.Logos),
  'model-roster': () =>
    import('@/themes/default/blocks/model-roster').then(
      (module) => module.ModelRoster
    ),
  'page-detail': () =>
    import('@/themes/default/blocks/page-detail').then(
      (module) => module.PageDetail
    ),
  pricing: () =>
    import('@/themes/default/blocks/pricing').then((module) => module.Pricing),
  'prompt-system': () =>
    import('@/themes/default/blocks/prompt-system').then(
      (module) => module.PromptSystem
    ),
  'search-guide': () =>
    import('@/themes/default/blocks/search-guide').then(
      (module) => module.SearchGuide
    ),
  'search-guide-generator': () =>
    import('@/themes/default/blocks/search-guide-generator').then(
      (module) => module.SearchGuideGenerator
    ),
  showcase: () =>
    import('@/themes/default/blocks/showcase').then(
      (module) => module.Showcase
    ),
  'showcases-flow': () =>
    import('@/themes/default/blocks/showcases-flow').then(
      (module) => module.ShowcasesFlow
    ),
  showcases: () =>
    import('@/themes/default/blocks/showcases').then(
      (module) => module.Showcases
    ),
  'social-avatars': () =>
    import('@/themes/default/blocks/social-avatars').then(
      (module) => module.SocialAvatars
    ),
  stats: () =>
    import('@/themes/default/blocks/stats').then((module) => module.Stats),
  subscribe: () =>
    import('@/themes/default/blocks/subscribe').then(
      (module) => module.Subscribe
    ),
  'testimonial-column': () =>
    import('@/themes/default/blocks/testimonial-column').then(
      (module) => module.TestimonialsColumn
    ),
  testimonial: () =>
    import('@/themes/default/blocks/testimonial').then(
      (module) => module.Testimonial
    ),
  testimonials: () =>
    import('@/themes/default/blocks/testimonials').then(
      (module) => module.Testimonials
    ),
  updates: () =>
    import('@/themes/default/blocks/updates').then((module) => module.Updates),
  'use-cases': () =>
    import('@/themes/default/blocks/use-cases').then(
      (module) => module.UseCases
    ),
  'version-paths': () =>
    import('@/themes/default/blocks/version-paths').then(
      (module) => module.VersionPaths
    ),
  workbench: () =>
    import('@/themes/default/blocks/workbench').then(
      (module) => module.Workbench
    ),
};

/** Get the configured theme. Only the bundled default theme is supported. */
export function getActiveTheme(): string {
  return (envConfigs.theme as string) || defaultTheme;
}

function getDefaultLoader(
  loaders: Record<string, ComponentLoader>,
  name: string,
  kind: string
) {
  const loader = loaders[name];
  if (!loader) {
    throw new Error(`Unknown ${kind} "${name}" in theme "${defaultTheme}"`);
  }
  return loader;
}

export async function getThemePage(pageName: string, theme?: string) {
  const loadTheme = theme || getActiveTheme();
  if (loadTheme !== defaultTheme) {
    console.warn(
      `Theme "${loadTheme}" is not bundled; using "${defaultTheme}" instead.`
    );
  }
  return getDefaultLoader(defaultPageLoaders, pageName, 'page')();
}

export async function getThemeLayout(layoutName: string, theme?: string) {
  const loadTheme = theme || getActiveTheme();
  if (loadTheme !== defaultTheme) {
    console.warn(
      `Theme "${loadTheme}" is not bundled; using "${defaultTheme}" instead.`
    );
  }
  return getDefaultLoader(defaultLayoutLoaders, layoutName, 'layout')();
}

export async function getThemeBlock(blockName: string, theme?: string) {
  const loadTheme = theme || getActiveTheme();
  if (loadTheme !== defaultTheme) {
    console.warn(
      `Theme "${loadTheme}" is not bundled; using "${defaultTheme}" instead.`
    );
  }
  return getDefaultLoader(defaultBlockLoaders, blockName, 'block')();
}
