import { ReactNode } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';

import { LocaleDetector } from '@/shared/blocks/common/locale-detector';
import { TopBanner } from '@/shared/blocks/common/top-banner';
import {
  Footer as FooterType,
  Header as HeaderType,
} from '@/shared/types/blocks/landing';
import DefaultLandingLayout from '@/themes/default/layouts/landing';

export default async function LandingLayout({
  children,
}: {
  children: ReactNode;
}) {
  // load page data
  const t = await getTranslations('landing');
  const locale = await getLocale();

  // header and footer to display
  const header: HeaderType = t.raw('header');
  const footer: FooterType = t.raw('footer');

  return (
    <DefaultLandingLayout header={header} footer={footer} locale={locale}>
      <LocaleDetector />
      {header.topbanner && header.topbanner.text && (
        <TopBanner
          id="topbanner"
          text={header.topbanner?.text}
          buttonText={header.topbanner?.buttonText}
          href={header.topbanner?.href}
          target={header.topbanner?.target}
          closable
          rememberDismiss
          dismissedExpiryDays={header.topbanner?.dismissedExpiryDays ?? 1}
        />
      )}
      {children}
    </DefaultLandingLayout>
  );
}
