'use client';

import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLocale } from 'next-intl';

import { Link, usePathname } from '@/core/i18n/navigation';
import { BrandLogo } from '@/shared/blocks/common/brand-logo';
import { LocaleSelector } from '@/shared/blocks/common/locale-selector';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { ThemeToggler } from '@/shared/blocks/common/theme-toggler';
import { SignUser } from '@/shared/blocks/sign/sign-user';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger as RawNavigationMenuTrigger,
} from '@/shared/components/ui/navigation-menu';
import { useMedia } from '@/shared/hooks/use-media';
import { cn } from '@/shared/lib/utils';
import { NavItem } from '@/shared/types/blocks/common';
import { Header as HeaderType } from '@/shared/types/blocks/landing';

// For Next.js hydration mismatch warning, conditionally render NavigationMenuTrigger only after mount to avoid inconsistency between server/client render
function NavigationMenuTrigger(
  props: React.ComponentProps<typeof RawNavigationMenuTrigger>
) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  // Only render after client has mounted, to avoid SSR/client render id mismatch
  if (!mounted) return null;
  return <RawNavigationMenuTrigger {...props} />;
}

export function Header({ header }: { header: HeaderType }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isScrolledRef = useRef(false);
  const scrollRafRef = useRef<number | null>(null);
  const isLarge = useMedia('(min-width: 64rem)');
  const pathname = usePathname();
  const zh = useLocale().startsWith('zh');

  useEffect(() => {
    // Listen to scroll event to enable header styles on scroll
    const handleScroll = () => {
      // Coalesce high-frequency scroll events & only update state when value changes.
      if (scrollRafRef.current != null) return;
      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = null;
        const next = window.scrollY > 50;
        if (next === isScrolledRef.current) return;
        isScrolledRef.current = next;
        setIsScrolled(next);
      });
    };

    // Initialize once on mount.
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollRafRef.current != null) {
        window.cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, []);

  // Navigation menu for large screens
  const NavMenu = () => {
    return (
      <NavigationMenu
        viewport={false}
        className="**:data-[slot=navigation-menu-content]:top-10 max-lg:hidden"
      >
        <NavigationMenuList className="gap-2">
          {header.nav?.items?.map((item, idx) => {
            if (!item.children || item.children.length === 0) {
              return (
                <NavigationMenuLink key={idx} asChild>
                  <Link
                    href={
                      pathname === '/' && item.url === '/ai-video-generator'
                        ? '#seedance-generator'
                        : item.url || ''
                    }
                    target={item.target || '_self'}
                    className={`text-muted-foreground hover:text-foreground flex flex-row items-center gap-1 px-4 py-1.5 text-sm transition-colors ${
                      item.is_active || pathname.endsWith(item.url as string)
                        ? 'font-medium'
                        : ''
                    }`}
                  >
                    {item.title}
                  </Link>
                </NavigationMenuLink>
              );
            }

            return (
              <NavigationMenuItem key={idx}>
                <NavigationMenuTrigger className="flex flex-row items-center gap-2 text-sm">
                  {item.title}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="min-w-2xs origin-top p-0.5">
                  <div className="border-director-rule-light bg-director-paper text-director-paper-text rounded-md border p-2">
                    <ul className="mt-1 space-y-2">
                      {item.children?.map((subItem: NavItem, index: number) => (
                        <ListItem
                          key={index}
                          href={subItem.url || ''}
                          target={subItem.target || '_self'}
                          title={subItem.title || ''}
                          description={subItem.description || ''}
                        >
                          {subItem.icon && (
                            <SmartIcon name={subItem.icon as string} />
                          )}
                        </ListItem>
                      ))}
                    </ul>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
    );
  };

  // Mobile menu using Accordion, shown on small screens
  const MobileMenu = ({ closeMenu }: { closeMenu: () => void }) => {
    return (
      <nav
        role="navigation"
        className="w-full [--color-border:--alpha(var(--color-foreground)/5%)] [--color-muted:--alpha(var(--color-foreground)/5%)]"
      >
        <Accordion
          type="single"
          collapsible
          className="-mx-4 mt-0.5 space-y-0.5 **:hover:no-underline"
        >
          {header.nav?.items?.map((item, idx) => {
            return (
              <AccordionItem
                key={idx}
                value={item.title || ''}
                className="group relative border-b-0 before:pointer-events-none before:absolute before:inset-x-4 before:bottom-0 before:border-b"
              >
                {item.children && item.children.length > 0 ? (
                  <>
                    <AccordionTrigger className="data-[state=open]:bg-muted flex items-center justify-between px-4 py-3 text-lg **:!font-normal">
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5">
                      <ul>
                        {item.children?.map((subItem: NavItem, iidx) => (
                          <li key={iidx}>
                            <Link
                              href={subItem.url || ''}
                              onClick={closeMenu}
                              className="grid grid-cols-[auto_1fr] items-center gap-2.5 px-4 py-2"
                            >
                              <div
                                aria-hidden
                                className="flex items-center justify-center *:size-4"
                              >
                                {subItem.icon && (
                                  <SmartIcon name={subItem.icon as string} />
                                )}
                              </div>
                              <div className="text-base">{subItem.title}</div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </>
                ) : (
                  <Link
                    href={
                      pathname === '/' && item.url === '/ai-video-generator'
                        ? '#seedance-generator'
                        : item.url || ''
                    }
                    onClick={closeMenu}
                    className="data-[state=open]:bg-muted flex items-center justify-between px-4 py-3 text-lg **:!font-normal"
                  >
                    {item.title}
                  </Link>
                )}
              </AccordionItem>
            );
          })}
        </Accordion>
      </nav>
    );
  };

  // List item for submenus in NavigationMenu
  function ListItem({
    title,
    description,
    children,
    href,
    target,
    ...props
  }: React.ComponentPropsWithoutRef<'li'> & {
    href: string;
    title: string;
    description?: string;
    target?: string;
  }) {
    return (
      <li {...props}>
        <NavigationMenuLink asChild>
          <Link
            href={href}
            target={target || '_self'}
            className="grid grid-cols-[auto_1fr] gap-3.5"
          >
            <div className="border-director-rule-light bg-director-paper-2 relative flex size-9 items-center justify-center rounded border">
              {children}
            </div>
            <div className="space-y-0.5">
              <div className="text-foreground text-sm font-medium">{title}</div>
              <p className="text-muted-foreground line-clamp-1 text-xs">
                {description}
              </p>
            </div>
          </Link>
        </NavigationMenuLink>
      </li>
    );
  }

  return (
    <>
      <header
        data-state={isMobileMenuOpen ? 'active' : 'inactive'}
        {...(isScrolled && { 'data-scrolled': true })}
        className="dark fixed inset-x-0 top-0 z-50 transition-colors duration-300"
      >
        <div
          className={cn(
            'bg-director-ink/96 absolute inset-x-0 top-0 z-50 border-b border-white/[0.07] py-3 transition-[padding,background-color,border-color] duration-300',
            'in-data-scrolled:bg-director-ink/92 in-data-scrolled:backdrop-blur-lg',
            'max-lg:in-data-[state=active]:bg-director-ink max-lg:in-data-[state=active]:h-screen max-lg:in-data-[state=active]:overflow-hidden max-lg:in-data-[state=active]:border-b',
            'lg:max-h-24'
          )}
        >
          <div className="container">
            <div className="relative flex flex-wrap items-center justify-between lg:py-0.5">
              <div className="flex items-center gap-12 max-lg:h-11 max-lg:w-full max-lg:justify-between">
                <div className="flex items-center gap-12">
                  {/* Brand Logo */}
                  {header.brand && <BrandLogo brand={header.brand} />}

                  {/* Desktop Navigation Menu */}
                  {isLarge && <NavMenu />}
                </div>

                {/* Hamburger menu button for mobile navigation */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label={
                    isMobileMenuOpen
                      ? zh
                        ? '关闭菜单'
                        : 'Close Menu'
                      : zh
                        ? '打开菜单'
                        : 'Open Menu'
                  }
                  className="focus-visible:outline-director-focus relative z-20 -m-2.5 -mr-3 block cursor-pointer p-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 lg:hidden"
                >
                  <Menu className="m-auto size-5 duration-200 in-data-[state=active]:scale-0 in-data-[state=active]:rotate-180 in-data-[state=active]:opacity-0" />
                  <X className="absolute inset-0 m-auto size-5 scale-0 -rotate-180 opacity-0 duration-200 in-data-[state=active]:scale-100 in-data-[state=active]:rotate-0 in-data-[state=active]:opacity-100" />
                </button>
              </div>

              {/* Show mobile menu if needed */}
              {!isLarge && isMobileMenuOpen && (
                <MobileMenu closeMenu={() => setIsMobileMenuOpen(false)} />
              )}

              {/* Header right section: theme toggler, locale selector, sign, buttons */}
              <div className="mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 in-data-[state=active]:flex max-lg:in-data-[state=active]:mt-6 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                <div className="flex w-full flex-row items-center gap-4 sm:flex-row sm:gap-6 sm:space-y-0 md:w-fit">
                  {header.buttons &&
                    header.buttons.map((button, idx) => (
                      <Link
                        key={idx}
                        href={
                          pathname === '/' &&
                          button.url === '/ai-video-generator'
                            ? '#seedance-generator'
                            : button.url || ''
                        }
                        target={button.target || '_self'}
                        className={cn(
                          'focus-visible:outline-director-focus inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50',
                          'h-9 px-6 ring-0',
                          button.variant === 'outline'
                            ? 'border border-white/20 bg-transparent text-white shadow-sm duration-200 hover:bg-white/10'
                            : button.variant === 'gold'
                              ? 'bg-director-orange text-director-orange-ink hover:bg-director-orange-hover border-0'
                              : 'bg-primary text-primary-foreground border-0 hover:opacity-90'
                        )}
                      >
                        {button.icon && (
                          <SmartIcon
                            name={button.icon as string}
                            className="size-4"
                          />
                        )}
                        <span>{button.title}</span>
                      </Link>
                    ))}

                  {header.show_theme ? <ThemeToggler /> : null}
                  {header.show_locale ? <LocaleSelector /> : null}
                  <div className="flex-1 md:hidden"></div>
                  <div className="ml-4">
                    {header.show_sign ? (
                      <SignUser userNav={header.user_nav} />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
