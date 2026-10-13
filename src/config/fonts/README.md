# Director's Desk fonts

These are the Latin WOFF2 assets previously served by this project's `next/font/google` build cache, now bundled locally. Font families and design remain unchanged; builds no longer fetch Google Fonts, and browsers request these files from the site's own origin.

- Instrument Sans variable, weights 400–700: `instrument-sans-latin.woff2`
- Newsreader variable roman, weights 200–800: `newsreader-latin.woff2`
- JetBrains Mono variable, weights 100–800: `jetbrains-mono-latin.woff2`

Each accompanying OFL file was obtained from its family directory in the official [Google Fonts repository](https://github.com/google/fonts/tree/main/ofl) on October 12, 2026. Preserve the licenses when distributing these font files. These subsets do not supply Chinese glyphs; the existing system fallback supplies them.

Only the main sans font is preloaded. All families use `font-display: swap`.
