# Seedance AI Design System

## Product and audience

Seedance AI is an independent, English-first AI video workspace with complete Chinese public-page parity. Its primary users are creators, marketers, filmmakers, and developers comparing or using Seedance 2.5 and Seedance 2.0.

The interface should help a search visitor answer four questions quickly:

1. Can I generate here now?
2. Which Seedance version and workflow am I using?
3. What will the generation cost and output before I click?
4. What evidence supports the product and model claims?

## Visual direction: Director's Desk

Use a restrained film-production workspace rather than a generic neon AI landing page. The page should feel like a modern director's desk: dark projection-room canvas, warm paper controls, visible timecodes, contact sheets, shot metadata, and direct language.

The public landing page keeps the original bright editorial composition: warm-white canvas, strong left-aligned title, and an independent film preview on the right. Dark projection surfaces support the media and workspace; they should not turn the whole landing page into a dashboard. This follows the user's October 13 feedback preferring the original live design over the dark form-led revisions.

Keep the category patterns validated across current Seedance tools and established video platforms:

- Put the working generator in or immediately after the first viewport.
- Keep video or output evidence visually dominant.
- Make references, model, resolution, duration, audio, and cost understandable before generation.
- On mobile, show the prompt workflow immediately after the concise hero copy.

Do not copy the category's overused neon green or purple glow, giant decorative 3D scenes, full-bleed autoplay backgrounds, or unsupported 4K and unlimited claims.

## Color

- Projection ink: `#0B0D0C` — main dark background and video canvas.
- Carbon surface: `#151816` — elevated dark panels.
- Studio paper: `oklch(0.978 0.011 86)` — the original warm-white landing canvas and light sections; use the darker paper variants for inset controls.
- Signal orange: `#FF5B3D` — primary action and selected state.
- Timecode amber: `#F1B84B` — timecodes, editorial emphasis, and guidance.
- Ready sage: `#A8C9B7` — live/ready/success states.
- Muted text: `#A3AAA4` on dark, `#606761` on light.

Signal orange is an action color, not decoration. Timecode amber is reserved for filmmaking context and editorial emphasis. Never use color alone to communicate status.

## Typography

- Primary: Instrument Sans for navigation, headings, body, controls, and data labels.
- Editorial accent: Newsreader for short cinematic phrases, pull quotes, or section transitions.
- Monospace: JetBrains Mono for timecodes, request IDs, costs, and code.

Use condensed-looking, tightly tracked display headings only at large sizes. Body copy stays comfortably spaced and never uses editorial serif for long passages.

## Layout and components

- Desktop hero: asymmetric copy/workspace split; the workspace is the dominant object.
- Mobile hero: concise status, H1, one short paragraph, then generator. Move secondary proof below the generator.
- Use rectangular controls with 6–12px radii. Reserve fully rounded shapes for status dots or compact tags.
- Prefer thin dividers and spacing over nested cards. Avoid cards inside cards unless the inner surface is a functional control.
- Example galleries behave like film contact sheets and include prompt, version, duration, resolution, and provenance.
- Motion is limited to state transitions, progress, and subtle reveal. Respect `prefers-reduced-motion`.

## Content and trust

- The product is independent and is not affiliated with ByteDance, Doubao, or Dreamina.
- Distinguish official model limits from the limits currently available in this product.
- Do not claim 4K, unlimited generation, private-by-default storage, no-training use, commercial rights, custom fine-tuning, or exact output duration unless the implemented product and current terms support the claim.
- Show a visible last-reviewed date and sources on fact-heavy pages.
- Keep the homepage focused; detailed 2.0, comparison, prompt, API, and plan-limit intent belongs on dedicated pages.

## Accessibility and performance

- Meet WCAG AA contrast for text and controls.
- All controls have visible focus states, labels, and keyboard access.
- Use poster images and lazy video loading below the fold; no heavy decorative WebGL/Spline hero.
- Reserve media dimensions to prevent layout shift.
- Default to server-rendered semantic content for SEO pages.
