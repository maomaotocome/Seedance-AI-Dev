'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

// Covers are frames exported from the original clip. Load video on interaction;
// the poster and reserved aspect ratio remain useful before hydration.
export function SceneVideo({
  src,
  poster,
  title,
  playLabel,
  errorLabel,
  sizes,
}: {
  src: string;
  poster: string;
  title: string;
  playLabel: string;
  errorLabel: string;
  sizes: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className="bg-director-ink relative aspect-video overflow-hidden rounded-md">
      <video
        ref={video}
        src={src}
        poster={started ? poster : undefined}
        controls={started}
        tabIndex={started ? 0 : -1}
        playsInline
        preload="none"
        aria-label={title}
        onError={() => {
          setFailed(true);
          setStarted(false);
        }}
        className={cn(
          'absolute inset-0 h-full w-full object-contain',
          !started && 'invisible'
        )}
      />
      {!started && (
        <>
          <Image
            src={poster}
            alt={title}
            fill
            sizes={sizes}
            className="object-cover"
          />
          <button
            type="button"
            aria-label={playLabel}
            className="focus-visible:outline-director-amber group absolute inset-0 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-[-4px]"
            onClick={async () => {
              if (failed) video.current?.load();
              setFailed(false);
              setStarted(true);
              try {
                await video.current?.play();
                video.current?.focus();
              } catch {
                setStarted(false);
                setFailed(true);
              }
            }}
          >
            <span className="flex size-14 items-center justify-center rounded-full border border-white/60 bg-black/55 text-white transition-colors group-hover:bg-black/80 sm:size-16">
              <Play aria-hidden="true" className="ml-1 size-6 fill-current" />
            </span>
          </button>
        </>
      )}
      {failed && (
        <p
          role="status"
          className="bg-director-ink/95 absolute right-3 bottom-3 left-3 rounded px-3 py-2 text-xs text-white"
        >
          {errorLabel}
        </p>
      )}
    </div>
  );
}
