const localOrigin = process.env.QA_ORIGIN || 'http://localhost:3002';
const publicOrigin = 'https://seedanceai.dev';

const failures = [];
const notes = [];

function fail(message) {
  failures.push(message);
}

function getAttribute(tag, name) {
  const match = tag.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'));
  return match?.[1] || '';
}

function tags(html, name) {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) || [];
}

async function fetchText(pathname, init) {
  const response = await fetch(`${localOrigin}${pathname}`, init);
  return { response, text: await response.text() };
}

const sitemapResult = await fetchText('/sitemap.xml');
if (!sitemapResult.response.ok) {
  fail(`sitemap returned ${sitemapResult.response.status}`);
}

const publicUrls = [
  ...sitemapResult.text.matchAll(
    /<loc>(https:\/\/seedanceai\.dev[^<]+)<\/loc>/g
  ),
].map((match) => match[1]);
const uniqueUrls = [...new Set(publicUrls)];

const sitemapEntries = [
  ...sitemapResult.text.matchAll(/<url>([\s\S]*?)<\/url>/g),
].map((match) => {
  const block = match[1];
  const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1] || '';
  const lastModified = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] || '';
  const alternates = [
    ...block.matchAll(/<xhtml:link\b[^>]*rel=["']alternate["'][^>]*\/?\s*>/gi),
  ].map((alternate) => ({
    language: getAttribute(alternate[0], 'hreflang'),
    href: getAttribute(alternate[0], 'href'),
  }));
  return { loc, lastModified, alternates };
});

if (uniqueUrls.length !== 36) {
  fail(`expected 36 public sitemap URLs, found ${uniqueUrls.length}`);
}

if (sitemapEntries.length !== uniqueUrls.length) {
  fail(
    `sitemap contains ${sitemapEntries.length} URL entries but ${uniqueUrls.length} unique loc values`
  );
}

const sitemapDatesByBasePath = new Map();
for (const entry of sitemapEntries) {
  if (!entry.lastModified) {
    fail(`${entry.loc || 'unknown sitemap URL'} is missing lastmod`);
  } else {
    const timestamp = Date.parse(entry.lastModified);
    if (Number.isNaN(timestamp)) {
      fail(`${entry.loc} has invalid lastmod ${entry.lastModified}`);
    } else if (timestamp > Date.now() + 24 * 60 * 60 * 1000) {
      fail(`${entry.loc} has a future lastmod ${entry.lastModified}`);
    }
  }

  const pathname = entry.loc ? new URL(entry.loc).pathname : '';
  const basePath = pathname.replace(/^\/zh(?=\/|$)/, '') || '/';
  const enUrl = `${publicOrigin}${basePath}`;
  const zhUrl = `${publicOrigin}/zh${basePath === '/' ? '' : basePath}`;
  const expectedAlternates = new Map([
    ['en', enUrl],
    ['zh', zhUrl],
    ['x-default', enUrl],
  ]);

  for (const [language, href] of expectedAlternates) {
    const actual = entry.alternates.find(
      (alternate) => alternate.language === language
    )?.href;
    if (actual !== href) {
      fail(
        `${pathname || 'unknown sitemap URL'} ${language} sitemap alternate is ${actual || 'missing'}`
      );
    }
  }

  const pairedDates = sitemapDatesByBasePath.get(basePath) || new Set();
  if (entry.lastModified) pairedDates.add(entry.lastModified);
  sitemapDatesByBasePath.set(basePath, pairedDates);
}

for (const [basePath, dates] of sitemapDatesByBasePath) {
  if (dates.size !== 1) {
    fail(`${basePath} English and Chinese sitemap lastmod values do not match`);
  }
}

for (const publicUrl of uniqueUrls) {
  const pathname = new URL(publicUrl).pathname;
  const { response, text } = await fetchText(pathname);

  if (response.status !== 200) {
    fail(`${pathname} returned ${response.status}`);
    continue;
  }

  const canonicalTag = tags(text, 'link').find(
    (tag) => getAttribute(tag, 'rel').toLowerCase() === 'canonical'
  );
  const canonical = canonicalTag ? getAttribute(canonicalTag, 'href') : '';
  if (canonical !== publicUrl) {
    fail(`${pathname} canonical is ${canonical || 'missing'}`);
  }

  const basePath = pathname.replace(/^\/zh(?=\/|$)/, '') || '/';
  const expectedAlternates = new Map([
    ['en', `${publicOrigin}${basePath}`],
    ['zh', `${publicOrigin}/zh${basePath === '/' ? '' : basePath}`],
    ['x-default', `${publicOrigin}${basePath}`],
  ]);
  const alternateTags = tags(text, 'link').filter(
    (tag) => getAttribute(tag, 'rel').toLowerCase() === 'alternate'
  );
  for (const [language, href] of expectedAlternates) {
    const actual = alternateTags.find(
      (tag) => getAttribute(tag, 'hreflang') === language
    );
    if (getAttribute(actual || '', 'href') !== href) {
      fail(`${pathname} ${language} HTML alternate is missing or incorrect`);
    }
  }

  const htmlTag = tags(text, 'html')[0];
  const expectedLanguage =
    pathname === '/zh' || pathname.startsWith('/zh/') ? 'zh' : 'en';
  if (getAttribute(htmlTag || '', 'lang') !== expectedLanguage) {
    fail(`${pathname} has incorrect or missing html lang`);
  }

  const h1Count = (text.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) {
    fail(`${pathname} has ${h1Count} H1 elements`);
  }

  const title = text.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() || '';
  if (!title) fail(`${pathname} is missing a title`);

  const descriptionTag = tags(text, 'meta').find(
    (tag) => getAttribute(tag, 'name').toLowerCase() === 'description'
  );
  if (!getAttribute(descriptionTag || '', 'content')) {
    fail(`${pathname} is missing a meta description`);
  }

  const robotsTag = tags(text, 'meta').find(
    (tag) => getAttribute(tag, 'name').toLowerCase() === 'robots'
  );
  const robots = getAttribute(robotsTag || '', 'content').toLowerCase();
  if (robots.includes('noindex')) {
    fail(`${pathname} is unexpectedly noindex`);
  }

  for (const match of text.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )) {
    try {
      JSON.parse(match[1]);
    } catch {
      fail(`${pathname} contains invalid JSON-LD`);
    }
  }

  if (
    text.includes('fal available as a fallback path') ||
    text.includes('5/sec at 480p; 10/sec at 720p') ||
    text.includes('480p 每秒 5；720p 每秒 10')
  ) {
    fail(`${pathname} contains stale provider or pricing copy`);
  }
}

const generatorResult = await fetchText('/ai-video-generator');
const generatorH1 =
  generatorResult.text.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '';
if (!/AI\s+video\s+generator/i.test(generatorH1.replace(/<[^>]+>/g, ' '))) {
  fail('/ai-video-generator H1 is missing the primary AI video generator term');
}

for (const pathname of [
  '/this-route-must-not-exist',
  '/zh/this-route-must-not-exist',
]) {
  const { response, text } = await fetchText(pathname);
  if (response.status !== 404) {
    fail(`${pathname} returned ${response.status} instead of 404`);
  }
  const robotsTag = tags(text, 'meta').find(
    (tag) => getAttribute(tag, 'name').toLowerCase() === 'robots'
  );
  if (
    !getAttribute(robotsTag || '', 'content')
      .toLowerCase()
      .includes('noindex')
  ) {
    fail(`${pathname} 404 response is missing noindex`);
  }
}

for (const pathname of [
  '/sign-in',
  '/sign-up',
  '/verify-email?email=qa%40example.com',
  '/zh/sign-in',
  '/zh/sign-up',
  '/zh/verify-email?email=qa%40example.com',
]) {
  const { response, text } = await fetchText(pathname);
  if (response.status !== 200) {
    fail(`${pathname} returned ${response.status}`);
    continue;
  }
  const robotsTag = tags(text, 'meta').find(
    (tag) => getAttribute(tag, 'name').toLowerCase() === 'robots'
  );
  const robots = getAttribute(robotsTag || '', 'content').toLowerCase();
  if (!robots.includes('noindex') || !robots.includes('nofollow')) {
    fail(`${pathname} is missing noindex,nofollow`);
  }
}

for (const pathname of ['/video', '/zh/video']) {
  const response = await fetch(`${localOrigin}${pathname}`, {
    redirect: 'manual',
  });
  const location = response.headers.get('location') || '';
  const redirectUrl = location ? new URL(location, localOrigin) : null;
  const expectedPath = pathname.startsWith('/zh') ? '/zh/sign-in' : '/sign-in';
  if (
    response.status < 300 ||
    response.status >= 400 ||
    redirectUrl?.pathname !== expectedPath ||
    redirectUrl.searchParams.get('callbackUrl') !== '/video'
  ) {
    fail(`${pathname} did not redirect to the localized sign-in flow`);
  }
}

const robotsResult = await fetchText('/robots.txt');
if (
  robotsResult.text.includes('Disallow: /sign-in') ||
  robotsResult.text.includes('Disallow: /sign-up') ||
  robotsResult.text.includes('Disallow: /verify-email')
) {
  fail('robots.txt blocks an authentication noindex page');
}
if (!robotsResult.text.includes(`${publicOrigin}/sitemap.xml`)) {
  fail('robots.txt is missing the production sitemap URL');
}

const llmsResult = await fetchText('/llms.txt');
if (!llmsResult.response.ok || !llmsResult.text.includes('# SeedanceAI.dev')) {
  fail('llms.txt is missing or malformed');
}

const rootResult = await fetch(`${localOrigin}/`);
if (rootResult.headers.has('x-powered-by')) {
  fail('x-powered-by exposes the framework');
}
for (const [name, expected] of [
  ['x-content-type-options', 'nosniff'],
  ['x-frame-options', 'DENY'],
  ['referrer-policy', 'strict-origin-when-cross-origin'],
  ['strict-transport-security', 'max-age=31536000'],
]) {
  if (rootResult.headers.get(name) !== expected) {
    fail(`security header ${name} is missing or incorrect`);
  }
}

notes.push(`${uniqueUrls.length} sitemap URLs checked`);
notes.push(
  'public canonicals, hreflang, languages, titles, descriptions, H1s and JSON-LD checked'
);
notes.push(
  'sitemap dates, 404s, auth noindex, legacy redirect, robots, llms.txt and security headers checked'
);

if (failures.length) {
  console.error(`SEO release gate failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('SEO release gate passed');
for (const note of notes) console.log(`- ${note}`);
