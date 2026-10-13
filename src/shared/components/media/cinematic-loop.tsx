'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Pause, Play } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

type NetworkInformation = EventTarget & {
  saveData?: boolean;
};

export function CinematicLoop({
  src,
  poster,
  label,
  playLabel,
  pauseLabel,
  errorLabel,
  className,
  autoPlayWhenEligible = false,
  posterPriority = false,
  sizes = '100vw',
}: {
  src: string;
  poster: string;
  label: string;
  playLabel: string;
  pauseLabel: string;
  errorLabel?: string;
  className?: string;
  autoPlayWhenEligible?: boolean;
  posterPriority?: boolean;
  sizes?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const userRequestedPlayRef = useRef(false);
  const manualPauseRef = useRef(false);
  const [posterReady, setPosterReady] = useState(false);
  const [sourceRequested, setSourceRequested] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [isAutoPlayEligible, setIsAutoPlayEligible] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!autoPlayWhenEligible) return;

    const desktop = window.matchMedia('(min-width: 1024px)');
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );
    const connection = (
      navigator as Navigator & { connection?: NetworkInformation }
    ).connection;

    const updateEligibility = () => {
      setIsAutoPlayEligible(
        desktop.matches && !reducedMotion.matches && !connection?.saveData
      );
    };

    updateEligibility();
    desktop.addEventListener('change', updateEligibility);
    reducedMotion.addEventListener('change', updateEligibility);
    connection?.addEventListener('change', updateEligibility);

    return () => {
      desktop.removeEventListener('change', updateEligibility);
      reducedMotion.removeEventListener('change', updateEligibility);
      connection?.removeEventListener('change', updateEligibility);
    };
  }, [autoPlayWhenEligible]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.55 }
    );
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (
      autoPlayWhenEligible &&
      isAutoPlayEligible &&
      isVisible &&
      posterReady &&
      !hasError
    ) {
      setSourceRequested(true);
    }
  }, [
    autoPlayWhenEligible,
    hasError,
    isAutoPlayEligible,
    isVisible,
    posterReady,
  ]);

  useEffect(() => {
    if (!sourceRequested || !videoRef.current) return;
    videoRef.current.load();
  }, [sourceRequested]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !canPlay || hasError) return;

    const shouldPlay =
      isPageVisible &&
      isVisible &&
      (userRequestedPlayRef.current ||
        (autoPlayWhenEligible &&
          isAutoPlayEligible &&
          !manualPauseRef.current));

    if (shouldPlay) {
      void video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }, [
    autoPlayWhenEligible,
    canPlay,
    hasError,
    isAutoPlayEligible,
    isPageVisible,
    isVisible,
  ]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const pageIsVisible = document.visibilityState === 'visible';
      setIsPageVisible(pageIsVisible);
      if (!pageIsVisible) {
        videoRef.current?.pause();
      }
    };

    handleVisibilityChange();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const togglePlayback = () => {
    if (hasError) return;

    const video = videoRef.current;
    if (!sourceRequested || !canPlay) {
      userRequestedPlayRef.current = true;
      manualPauseRef.current = false;
      setSourceRequested(true);
      return;
    }
    if (!video) return;

    if (video.paused) {
      userRequestedPlayRef.current = true;
      manualPauseRef.current = false;
      void video.play().catch(() => setIsPlaying(false));
    } else {
      userRequestedPlayRef.current = false;
      manualPauseRef.current = true;
      video.pause();
    }
  };

  const buttonLabel = hasError
    ? errorLabel || playLabel
    : isPlaying
      ? pauseLabel
      : playLabel;

  return (
    <div
      ref={containerRef}
      className={cn(
        'group relative overflow-hidden bg-director-ink',
        className
      )}
    >
      <Image
        src={poster}
        alt=""
        aria-hidden="true"
        fill
        priority={posterPriority}
        sizes={sizes}
        onLoad={() => setPosterReady(true)}
        className="object-cover"
      />
      <video
        ref={videoRef}
        aria-label={label}
        className={cn(
          'absolute inset-0 h-full w-full object-cover transition-opacity duration-500',
          canPlay && !hasError ? 'opacity-100' : 'opacity-0'
        )}
        loop
        muted
        playsInline
        preload="none"
        onCanPlay={() => setCanPlay(true)}
        onError={() => {
          setHasError(true);
          setIsPlaying(false);
        }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      >
        {sourceRequested && <source src={src} type="video/mp4" />}
      </video>
      <div
        style={{ position: 'absolute', right: '0.75rem', bottom: '0.75rem' }}
        className="z-10"
      >
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={buttonLabel}
          disabled={hasError}
          className="focus-visible:outline-director-amber inline-flex min-h-11 min-w-11 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-white/18 bg-director-ink/88 px-3 font-mono text-[10px] font-bold tracking-[0.1em] text-director-ink-text uppercase backdrop-blur-sm transition-colors hover:bg-director-carbon focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPlaying ? (
            <Pause aria-hidden="true" className="size-3.5" />
          ) : (
            <Play aria-hidden="true" className="size-3.5" />
          )}
          <span>{buttonLabel}</span>
        </button>
      </div>
    </div>
  );
}
