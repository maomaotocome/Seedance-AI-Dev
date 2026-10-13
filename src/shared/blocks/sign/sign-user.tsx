'use client';

import { useEffect, useRef, useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Coins, LayoutDashboard, Loader2, LogOut, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { authClient, signOut, useSession } from '@/core/auth/client';
import { Link, useRouter } from '@/core/i18n/navigation';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useAppContext } from '@/shared/contexts/app';
import { cn } from '@/shared/lib/utils';
import { User as UserType } from '@/shared/models/user';
import { NavItem, UserNav } from '@/shared/types/blocks/common';

import { SmartIcon } from '../common/smart-icon';

const SignModal = dynamic(
  () => import('./sign-modal').then((module) => module.SignModal),
  { ssr: false }
);

function extractSessionUser(data: any): UserType | null {
  const u = data?.user ?? data?.data?.user ?? null;
  return u && typeof u === 'object' ? (u as UserType) : null;
}

export function SignUser({
  isScrolled,
  signButtonSize = 'sm',
  userNav,
}: {
  isScrolled?: boolean;
  signButtonSize?: 'default' | 'sm' | 'lg' | 'icon';
  userNav?: UserNav;
}) {
  const t = useTranslations('common.sign');
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // get app context values
  const {
    configs,
    fetchConfigs,
    isShowSignModal,
    setIsShowSignModal,
    isCheckSign,
    setIsCheckSign,
    user,
    setUser,
    fetchUserInfo,
  } = useAppContext();

  // get session
  const { data: session, isPending } = useSession();
  const sessionUser = extractSessionUser(session);
  const displayUser = (user as UserType | null) ?? sessionUser;

  // In dev (React StrictMode) effects can run twice; ensure we don't spam getSession().
  const didFallbackSyncRef = useRef(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  // set is check sign
  useEffect(() => {
    setIsCheckSign(isPending);
  }, [isPending]);

  // set user
  useEffect(() => {
    const currentUserId = user?.id;
    const sessionUserId = (sessionUser as any)?.id;

    if (sessionUser && sessionUserId !== currentUserId) {
      setUser(sessionUser as UserType);
      fetchUserInfo();
    } else if (!sessionUser && currentUserId) {
      setUser(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUser?.id, (sessionUser as any)?.email, user?.id]);

  // Fallback: if the session cookie is present but useSession lags, do a single refresh.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (didFallbackSyncRef.current) return;
    // Only run when useSession is done but still no user.
    if (isPending) return;
    if (sessionUser || user) return;

    didFallbackSyncRef.current = true;
    void (async () => {
      try {
        const res: any = await authClient.getSession();
        const fresh = extractSessionUser(res?.data ?? res);
        if (fresh?.id) {
          setUser(fresh);
          fetchUserInfo();
        }
      } catch {
        // ignore
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, sessionUser, user?.id]);

  return (
    <>
      {isCheckSign || !mounted ? (
        <div>
          <Loader2 className="size-4 animate-spin" />
        </div>
      ) : displayUser ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              aria-label={t('user_center_title')}
              className="relative h-10 w-10 rounded-full p-0 focus:ring-0 focus-visible:ring-0"
            >
              <Avatar className="hover:ring-primary/50 ring-2 ring-white/10 transition-all duration-300">
                <AvatarImage
                  src={displayUser.image || ''}
                  alt={displayUser.name || ''}
                />
                <AvatarFallback className="bg-director-amber text-director-ink text-xs font-bold uppercase">
                  {(displayUser.name || displayUser.email || 'U').charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="dark min-w-[160px] overflow-hidden rounded-xl border-white/10 bg-black/95 p-0 text-white backdrop-blur-xl">
            {/* User Name */}
            <div className="border-b border-white/10 px-4 py-3 text-center">
              <span className="text-sm font-medium opacity-90">
                {displayUser.name}
              </span>
            </div>

            {/* User Center / Activity */}
            <DropdownMenuItem
              asChild
              className="cursor-pointer justify-center rounded-none border-b border-white/10 px-4 py-3 focus:bg-white/10 focus:text-white"
            >
              <Link href="/app/video-generator">
                <span className="text-sm">{t('user_center_title')}</span>
              </Link>
            </DropdownMenuItem>

            {/* Admin System (if admin) */}
            {displayUser.isAdmin && (
              <DropdownMenuItem
                asChild
                className="cursor-pointer justify-center rounded-none border-b border-white/10 px-4 py-3 focus:bg-white/10 focus:text-white"
              >
                <Link href="/admin">
                  <span className="text-sm">{t('admin_title')}</span>
                </Link>
              </DropdownMenuItem>
            )}

            {/* Sign Out */}
            <DropdownMenuItem
              className="flex w-full cursor-pointer justify-center rounded-none px-4 py-3 focus:bg-white/10 focus:text-white"
              onClick={() =>
                signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      setUser(null);
                      router.push('/');
                    },
                  },
                })
              }
            >
              <span className="text-sm">{t('sign_out_title')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
          <Button
            size={signButtonSize}
            className={cn(
              'cursor-pointer rounded-full border border-white/20 bg-transparent px-6 font-semibold text-white shadow-none transition-colors hover:bg-white/10 hover:text-white',
              isScrolled && 'lg:hidden'
            )}
            onClick={() => setIsShowSignModal(true)}
          >
            {t('sign_in_title')}
          </Button>
          {isShowSignModal && <SignModal callbackUrl={pathname || '/'} />}
        </div>
      )}
    </>
  );
}
