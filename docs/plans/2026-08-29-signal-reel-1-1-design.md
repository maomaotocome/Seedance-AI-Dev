# Signal Reel 1.1

## Outcome

Enrich the bilingual SeedanceAI.dev homepage with a clearer visual hook while preserving the Director's Desk system, immediate generator access, truthful provenance, and restrained performance behavior.

## First-view hierarchy

Desktop visitors see, in order: product status and headline, one concise explanation and primary action, a dominant framed motion study, then the beginning of the working generator. At 1440 x 900 the generator heading and first control area must be visible or touch the viewport edge.

Mobile visitors see: concise status, headline, one paragraph, then the generator. The generator preview is the first media surface on mobile. Secondary facts, provenance, and the standalone hero study follow the generator.

## Media roles

1. Hero lead: a fictional adult human subject captured at an action peak in a cinematic environment. No celebrity likeness, minors, logos, or in-image text.
2. Hero study 02: a tactile material transformation, visually distinct from the lead.
3. Hero study 03: an atmospheric environment or story frame, visually distinct from the lead and later shot studies.
4. Generator empty preview: a product or object-motion study. It must not repeat the hero or cinematic showcase.
5. Cinematic showcase: retain the existing speaker loop, human movement study, and coastal weather study.

The six creative directions are an art-direction system, not a new six-card section. Existing hero filmstrip and cinematic showcase surfaces carry the content.

## Motion policy

The poster is always rendered first and remains the fallback. Desktop playback may begin only when the viewport is at least 1024px wide, reduced motion is not requested, data saving is not enabled, the media is visible, and the poster has already painted. Mobile and reduced-motion users load no video until they press Play.

Every loop has visible Play and Pause controls, keyboard focus, a 44px minimum target, and a stable poster on load or playback failure. Videos pause when offscreen or when the page is hidden.

The connected Runway workspace currently exposes image models but no video model. Until a real video model is available, the hero uses an original high-energy still with a subtle camera-motion loop. Copy and provenance must not describe the subject itself as animated.

## Performance budgets

- Hero poster: WebP or JPEG, target <= 220KB.
- Hero thumbnail: target <= 80KB each.
- Hero MP4: 1280 x 720, 4-6 seconds, no audio track, target <= 1.5MB.
- Only the hero poster receives high loading priority.
- Below-fold video stays `preload="none"`.
- All media reserves its aspect ratio to avoid layout shift.

## Truth and copy

Use `Concept study created for SeedanceAI.dev - not a listed-model output` and the equivalent Chinese disclosure. Do not imply that generated design references are actual product output, customer work, benchmarks, or a named model's result.

English and Chinese labels, alt text, playback labels, captions, prompts, and provenance ship together.

## Implementation scope

- Add selected media under `public/media/directors-desk/` without deleting existing assets.
- Update English and Chinese homepage configuration.
- Extend the home hero to accept poster/video metadata and preserve its image fallback.
- Extend the reusable cinematic loop for conditional playback, reduced motion, visibility pause, and failure fallback.
- Update shared media types only where the new metadata requires it.
- Keep the cinematic showcase layout unchanged unless rendered QA identifies a regression.

## Acceptance

- Visual QA at widths 320, 375, 414, 768, 1024, and 1440.
- No horizontal overflow, broken words, media duplication, or large empty grid tracks.
- Generator follows concise copy on mobile and remains immediately discoverable on desktop.
- Keyboard, reduced-motion, data-saving, autoplay-rejection, and video-error behavior verified.
- English and Chinese routes render equivalent structure and truthful metadata.
- Prettier, TypeScript, `git diff --check`, and production build pass.
- Browser screenshots confirm the actual rendered hierarchy.

## Not in scope

- Generator backend, pricing, model availability, or provider routing changes.
- New SEO routes or model claims.
- Rebrand, generic neon styling, WebGL, or a full-screen autoplay background.
- Commit, push, deployment, PR, or merge.
