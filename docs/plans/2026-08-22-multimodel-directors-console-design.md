# Multi-model Director's Console Design

**Date:** 2026-08-22  
**Status:** Approved  
**Scope:** Homepage hero and generator, four production-usable Kie models, and four bilingual model landing pages.

## Problem

The current first viewport gives the headline and generator similar visual weight. The headline wraps into a large editorial block, the start CTA repeats the action already present in the generator, all settings appear at once, and the empty output monitor consumes too much space. The result feels like marketing copy next to an embedded form instead of one coherent creative instrument.

The model catalog also concentrates on Seedance 2.5 and 2.0 even though Kie currently exposes several high-interest 2026 video models. Adding model-name pages without making those models usable would create a trust gap and thin SEO content, so model discovery and product capability must ship together.

## Research synthesis

- Krea makes the model workspace primary and treats model comparison as a core navigation pattern.
- Higgsfield combines a compact control rail with a dominant output surface and annotates model choices with capability information.
- Freepik/Magnific keeps the creation sequence legible: provide input, select compatible settings, then generate.
- Seedances.ai places expected cost close to the action.
- MaxVideoAI leads model selection with outputs and use-case fit rather than a long specification wall.
- Google documents overall page experience and Core Web Vitals as useful signals; it does not document dwell time as a direct ranking factor. This redesign therefore targets clearer task completion, accessibility, and stable rendering rather than an unsupported ranking promise.

Primary references:

- https://www.krea.ai/features/ai-video-generator
- https://www.krea.ai/models
- https://higgsfield.ai/blog/AI-Video-Generator-How-to-Create-on-Higgsfield
- https://www.freepik.com/ai/faq/ai-video-generator
- https://seedances.ai/
- https://maxvideoai.com/
- https://developers.google.com/search/docs/appearance/page-experience
- https://developers.google.com/search/docs/appearance/core-web-vitals

## Approved direction

Use a **compact Director's Console** within the existing Director's Desk identity.

Identity lock: projection ink `#0B0D0C`, studio paper `#F3EFE5`, signal orange `#FF5B3D`, timecode amber `#F1B84B`, ready sage `#A8C9B7`; Instrument Sans primary, Newsreader only as a short editorial accent, and JetBrains Mono for technical metadata.

The generator is the dominant object at roughly 65% of the desktop hero. Copy becomes shorter and supports the workflow instead of competing with it. On mobile, status, H1, one short paragraph, and the prompt input appear in that order.

## Homepage composition

### Copy rail

- Keep one compact availability/status line.
- Shorten the H1 to a maximum of three desktop lines and remove excessive negative tracking.
- Use one concise paragraph explaining multi-model generation, compatible controls, and visible cost.
- Remove the redundant “Start creating” button; keep one lower-emphasis comparison/discovery link if useful.
- Add a small proof strip after the primary workflow, not before it.

### Generator console

- Header: workspace identity, active model, and available credits.
- Model switcher: searchable, keyboard-accessible, and grouped by provider/family. Each row includes a truthful capability summary and a compact `New` or `Audio` label when applicable.
- Workflow switcher: show only text, image, or reference modes supported by the selected model.
- Direction field: primary control with model-aware helper text and preserved prompt content when switching compatible models.
- Essential settings: duration, resolution, and aspect ratio. Unsupported values are never sent silently.
- Advanced settings: progressive disclosure for negative prompt, prompt expansion, seed, or other model-specific options.
- Cost/action row: exact site credit charge, audio state, and the primary generate button in one visual group.
- Output monitor: a compact, useful empty state with the selected model, expected format, and a short next step; expand naturally for progress, failure, and generated video.

## Supported model catalog

The first release includes the two existing Seedance models and four Kie-backed models:

| Product model | Kie task model | Workflows | Product-facing limits |
| --- | --- | --- | --- |
| Seedance 2.5 | `bytedance/seedance-2-5` | Text, image, reference | Existing site limits |
| Seedance 2.0 | `bytedance/seedance-2` | Text, image, reference | Existing site limits |
| Kling 3.0 | `kling-3.0/video` | Text, image | 3–15s, 720p/1080p, compatible aspect ratios, optional audio |
| Wan 2.7 | `wan/2-7-text-to-video`, `wan/2-7-image-to-video` | Text, image | Supported Kie duration/resolution/ratio inputs |
| MiniMax H3 | `minimax-h3/text-to-video`, `minimax-h3/image-to-video` | Text, image | Supported duration, 768p/2K-facing options where verified |
| Grok Imagine Video 1.5 | `grok-imagine-video-1-5-preview` | Text, image | 1–15s, supported resolution and aspect ratios |

Only allowlisted product model IDs reach the provider. A server-side adapter translates the normalized UI options into each Kie model's exact input schema. Provider payloads are never accepted verbatim from the browser.

Product credit pricing is kept in the product configuration and validated by tests. It must not be described as Kie's upstream dollar price. The UI labels it as the exact site credit charge for the selected settings.

## Model landing pages

Create bilingual routes:

- `/kling-3-0-ai-video-generator`
- `/wan-2-7-video-generator`
- `/minimax-h3-video-generator`
- `/grok-imagine-video-1-5`

Each route server-renders:

1. A concise model-specific hero and preselected working generator.
2. Product limits versus upstream model capabilities, clearly distinguished.
3. Unique best-fit use cases and workflow advice.
4. Model-specific prompt examples.
5. A comparison table against relevant available models.
6. FAQs based on real controls and limitations.
7. Primary sources and a last-reviewed date.

Each page receives unique English and Chinese metadata, canonical URL, hreflang alternates, breadcrumb/FAQ structured data where valid, sitemap inclusion, and internal links. Pages must not imply affiliation with model vendors or present upstream demonstrations as site output.

## State and error handling

- Switching models reconciles invalid scene/resolution/duration/aspect values to a visible supported default.
- Uploaded media remains only when compatible; otherwise the UI explains why it was cleared.
- Authentication and insufficient-credit states preserve the configured shot so the user can resume.
- Provider failures remain refundable under the site's existing confirmed-failure policy.
- Empty, loading, success, and failure states occupy stable dimensions to control CLS.
- Keyboard focus returns to the relevant control or error summary after a blocked action.

## Responsive behavior

- Large desktop: copy rail and console side-by-side; console receives dominant width.
- Laptop/tablet: copy becomes a compact top rail and generator remains readable without horizontal control compression.
- Mobile: copy first, prompt immediately, settings become two-column only when width permits, and the output follows the action. No label truncation or hover-only information.
- All touch targets are at least 44px and focus indicators remain visible on dark and paper surfaces.

## Performance constraints

- No decorative hero video, WebGL, or large client-only visual dependency.
- Keep primary copy semantic and server-rendered.
- Reserve output/poster dimensions and lazy-load below-fold video.
- Avoid layout animation that changes document geometry; respect `prefers-reduced-motion`.
- Do not add font families or duplicate client bundles.

## Validation

1. Unit tests for model allowlisting, scene support, option normalization, Kie task IDs, provider payloads, and credit calculations.
2. Route and metadata checks for all English/Chinese pages, canonical/hreflang parity, sitemap entries, and valid JSON-LD.
3. Typecheck/lint where configured and a production build.
4. Real rendered checks at 1440px, 1280px, 768px, and 390px.
5. Keyboard traversal, visible focus, model switching, invalid state recovery, generate gating, loading/failure/success monitor states.
6. Browser console/network checks and a final visual polish pass for alignment, rhythm, contrast, optical sizing, and copy wrapping.

