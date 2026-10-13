import Image from 'next/image';

import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { cn } from '@/shared/lib/utils';
import { Footer as FooterType } from '@/shared/types/blocks/landing';

export function Footer({
  footer,
  locale,
}: {
  footer: FooterType;
  locale: string;
}) {
  const isChinese = locale.startsWith('zh');

  if (footer.disabled) {
    return null;
  }

  return (
    <section
      id={footer.id || footer.name}
      className={cn(
        'dark border-director-rule-dark bg-director-ink text-director-ink-text border-t py-12 sm:py-16',
        footer.className
      )}
    >
      <div className="container mx-auto">
        <footer>
          <div className="border-director-rule-dark grid gap-10 border-b pb-10 lg:grid-cols-[minmax(16rem,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
            <div className="flex max-w-sm flex-col items-start justify-between gap-8">
              {footer.brand && (
                <div>
                  <div className="flex items-center gap-2">
                    {footer.brand.logo && (
                      <Image
                        src={footer.brand.logo.src}
                        alt={
                          footer.brand.logo.alt || footer.brand.title || 'Logo'
                        }
                        width={footer.brand.logo.width || 80}
                        height={footer.brand.logo.height || 80}
                        className="h-9 w-auto"
                      />
                    )}
                    {footer.brand.title && (
                      <p className="text-xl font-semibold tracking-tight">
                        {footer.brand.title}
                      </p>
                    )}
                  </div>
                  {footer.brand.description && (
                    <p className="mt-5 text-sm leading-6 text-white/58">
                      {footer.brand.description}
                    </p>
                  )}
                </div>
              )}
              {footer.social && (
                <ul className="flex items-center space-x-5 text-white/60">
                  {footer.social.items?.map((item, i) => (
                    <li
                      key={i}
                      className="transition-colors duration-200 hover:text-white"
                    >
                      <a
                        href={item.url || ''}
                        target={item.target}
                        aria-label={item.title || 'Social link'}
                        className="focus-visible:outline-director-focus focus-visible:outline-2 focus-visible:outline-offset-4"
                      >
                        {item.icon && (
                          <SmartIcon name={item.icon as string} size={20} />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <nav
              aria-label={isChinese ? '网站索引' : 'Site index'}
              className="font-mono text-xs leading-5"
            >
              <p className="text-director-orange text-[10px] font-bold tracking-[0.14em] uppercase">
                {isChinese
                  ? '网站索引 · 公开页面'
                  : 'Site index · public routes'}
              </p>
              <div className="border-director-rule-dark mt-4 border-b">
                {footer.nav?.items?.map((item, i) => (
                  <div
                    key={i}
                    className="border-director-rule-dark grid gap-2 border-t py-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-5"
                  >
                    <p className="font-bold tracking-[0.08em] text-white/72 uppercase">
                      {item.title}
                    </p>
                    <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/50">
                      {item.children?.map((iitem, ii) => {
                        const isAnchor = iitem.url?.startsWith('#');

                        return (
                          <li
                            key={ii}
                            className="whitespace-nowrap transition-colors duration-200 hover:text-white"
                          >
                            {isAnchor ? (
                              <a
                                href={iitem.url || ''}
                                className="focus-visible:outline-director-focus cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
                              >
                                {iitem.title}
                              </a>
                            ) : (
                              <Link
                                href={iitem.url || ''}
                                target={iitem.target}
                                className="focus-visible:outline-director-focus focus-visible:outline-2 focus-visible:outline-offset-2"
                              >
                                {iitem.title}
                              </Link>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </nav>
          </div>
          <div className="flex flex-col justify-between gap-4 pt-6 font-mono text-[10px] leading-5 tracking-[0.04em] text-white/45 lg:flex-row lg:items-center">
            {footer.copyright && (
              <p>
                {footer.copyright}
                {process.env.NEXT_PUBLIC_SHOW_POWERED_BY === 'false' ? null : (
                  <a
                    href="/"
                    target="_blank"
                    className="focus-visible:outline-director-focus px-2 text-white/80 underline decoration-white/45 underline-offset-2 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    powered by Seedance Ai Dev
                  </a>
                )}
              </p>
            )}

            {footer.agreement && (
              <ul className="flex gap-4">
                {footer.agreement.items?.map((item: any, i: number) => (
                  <li
                    key={i}
                    className="transition-colors duration-200 hover:text-white/70"
                  >
                    <a
                      href={item.url || ''}
                      target={item.target}
                      className="focus-visible:outline-director-focus focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </footer>
      </div>
    </section>
  );
}
