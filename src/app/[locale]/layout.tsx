import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';

import { routing } from '@/core/i18n/config';
import { envConfigs } from '@/config';
import { Toaster } from '@/shared/components/ui/sonner';
import { AppContextProvider } from '@/shared/contexts/app';
import { getMetadata } from '@/shared/lib/seo';

export const generateMetadata = getMetadata();

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  // Guides are rendered by Server Components. Shipping every guide's copy in
  // the client provider duplicates the HTML and delays the first usable screen.
  // Retain the three page namespaces used by client pricing/blog/app previews.
  const clientMessages = {
    ...messages,
    pages: Object.fromEntries(
      Object.entries(messages.pages as Record<string, any>).filter(([key]) =>
        ['index', 'pricing', 'blog'].includes(key)
      )
    ),
  };

  return (
    <NextIntlClientProvider messages={clientMessages}>
      <AppContextProvider>
        {children}
        <Toaster
          position="top-center"
          richColors
          theme={envConfigs.appearance === 'light' ? 'light' : 'dark'}
        />
      </AppContextProvider>
    </NextIntlClientProvider>
  );
}
