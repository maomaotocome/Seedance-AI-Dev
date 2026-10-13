import { ReactNode } from 'react';

import {
  Footer as FooterType,
  Header as HeaderType,
} from '@/shared/types/blocks/landing';

import { Footer } from '../blocks/footer';
import { Header } from '../blocks/header';

export default async function LandingLayout({
  children,
  header,
  footer,
  locale,
}: {
  children: ReactNode;
  header: HeaderType;
  footer: FooterType;
  locale: string;
}) {
  return (
    <div className="min-h-screen w-full overflow-x-clip">
      <Header header={header} />
      <a
        href="#main-content"
        className="focus:bg-background sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:p-3"
      >
        {locale.startsWith('zh') ? '跳转到主要内容' : 'Skip to content'}
      </a>
      <main id="main-content">{children}</main>
      <Footer footer={footer} locale={locale} />
    </div>
  );
}
