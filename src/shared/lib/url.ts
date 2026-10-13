const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

export function normalizeSiteOrigin(value: string) {
  return value ? value.replace(/\/+$/, '') : '';
}

export function normalizePathname(pathname: string) {
  if (!pathname || pathname === '/') {
    return '/';
  }

  const normalizedPath = pathname.replace(/^\/+/, '').replace(/\/+$/, '');
  return normalizedPath ? `/${normalizedPath}` : '/';
}

export function buildLocalizedPathname(
  pathname: string,
  locale: string,
  defaultLocale: string
) {
  const normalizedPath = normalizePathname(pathname);

  if (!locale || locale === defaultLocale) {
    return normalizedPath;
  }

  return normalizedPath === '/'
    ? `/${locale}`
    : `/${locale}${normalizedPath}`;
}

export function buildAbsoluteUrl(
  baseUrl: string,
  pathnameOrUrl: string,
  locale?: string,
  defaultLocale?: string
) {
  if (ABSOLUTE_URL_PATTERN.test(pathnameOrUrl)) {
    return pathnameOrUrl;
  }

  const normalizedBaseUrl = normalizeSiteOrigin(baseUrl);
  const pathname =
    locale && defaultLocale
      ? buildLocalizedPathname(pathnameOrUrl, locale, defaultLocale)
      : normalizePathname(pathnameOrUrl);

  if (!normalizedBaseUrl) {
    return pathname;
  }

  return new URL(pathname, `${normalizedBaseUrl}/`).toString();
}
