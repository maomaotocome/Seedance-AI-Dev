'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { IconArrowNarrowRight } from '@tabler/icons-react';

import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { Button } from '@/shared/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { cn, handlePromptClick } from '@/shared/lib/utils';

interface VideoSlideData {
  prompt: string;
  src: string;
  url?: string;
  target?: string;
}

interface VideoSlideProps {
  slide: VideoSlideData;
  index: number;
  current: number;
  handleSlideClick: (index: number) => void;
}

const VideoSlide = ({
  slide,
  index,
  current,
  handleSlideClick,
}: VideoSlideProps) => {
  const slideRef = useRef<HTMLLIElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Optimize animation: Only update styles on mouse move using requestAnimationFrame
  const frameRef = useRef<number | null>(null);

  const handleMouseMove = (event: React.MouseEvent) => {
    const el = slideRef.current;
    if (!el) return;

    // Throttle updates using requestAnimationFrame
    if (frameRef.current) return;

    const rect = el.getBoundingClientRect();
    const x = event.clientX - (rect.left + Math.floor(rect.width / 2));
    const y = event.clientY - (rect.top + Math.floor(rect.height / 2));

    frameRef.current = requestAnimationFrame(() => {
      if (el) {
        el.style.setProperty('--x', `${x}px`);
        el.style.setProperty('--y', `${y}px`);
      }
      frameRef.current = null;
    });
  };

  const handleMouseLeave = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    // Reset position
    requestAnimationFrame(() => {
      if (slideRef.current) {
        slideRef.current.style.setProperty('--x', '0px');
        slideRef.current.style.setProperty('--y', '0px');
      }
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  // Handle video autoplay when slide becomes active
  useEffect(() => {
    if (videoRef.current) {
      if (current === index) {
        videoRef.current.play().catch(() => {
          // Autoplay failed, which is expected in some browsers
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [current, index]);

  const videoLoaded = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    event.currentTarget.style.opacity = '1';
  };

  const { src } = slide;

  return (
    <li
      ref={slideRef}
      className="relative z-10 mx-[4vmin] flex h-[50vmin] w-[50vmin] flex-1 cursor-pointer flex-col items-center justify-center text-center text-white opacity-100 transition-all duration-300 ease-in-out [perspective:1200px] [transform-style:preserve-3d]"
      onClick={() => handleSlideClick(index)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform:
          current !== index
            ? 'scale(0.98) rotateX(8deg)'
            : 'scale(1) rotateX(0deg)',
        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        transformOrigin: 'bottom',
      }}
    >
      <div
        className="absolute top-0 left-0 h-full w-full overflow-hidden rounded-[1%] bg-[#1D1F2F] transition-all duration-150 ease-out"
        style={{
          transform:
            current === index
              ? 'translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)'
              : 'none',
        }}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover opacity-100 transition-opacity duration-600 ease-in-out"
          style={{
            opacity: current === index ? 1 : 0.5,
          }}
          src={src}
          onLoadedData={videoLoaded}
          muted
          loop
          playsInline
          preload={current === index ? 'metadata' : 'none'}
        />
      </div>
    </li>
  );
};

interface TextToVideoControlProps {
  type: string;
  title: string;
  handleClick: () => void;
}

const TextToVideoControl = ({
  type,
  title,
  handleClick,
}: TextToVideoControlProps) => {
  return (
    <Button
      className={cn(
        type === 'previous' ? 'rotate-180' : '',
        'rounded-full border-white/20 bg-transparent text-white hover:bg-white/10'
      )}
      title={title}
      aria-label={title}
      onClick={handleClick}
      variant="outline"
      size="icon"
    >
      <span className="flex items-center justify-center">
        <IconArrowNarrowRight className="text-white" />
      </span>
    </Button>
  );
};

interface TextToVideoShowcaseProps {
  slides: VideoSlideData[];
  section: any;
  showCTA?: boolean;
  onPromptClick?: (prompt: string) => void;
}

export function TextToVideoShowcase({
  slides,
  section,

  showCTA = true,
  onPromptClick,
}: TextToVideoShowcaseProps) {
  const [current, setCurrent] = useState(1);

  const handlePreviousClick = () => {
    const previous = current - 1;
    setCurrent(previous < 0 ? slides.length - 1 : previous);
  };

  const handleNextClick = () => {
    const next = current + 1;
    setCurrent(next === slides.length ? 0 : next);
  };

  const handleSlideClick = (index: number) => {
    if (current !== index) {
      setCurrent(index);
    }
  };

  const id = useId();

  return (
    <div
      className="relative mx-auto h-[50vmin] w-[50vmin]"
      aria-labelledby={`text-to-video-showcase-heading-${id}`}
    >
      <ul
        className="absolute mx-[-4vmin] flex transition-transform duration-1000 ease-in-out"
        style={{
          transform: `translateX(-${current * (100 / slides.length)}%)`,
        }}
      >
        {slides.map((slide, index) => (
          <VideoSlide
            key={index}
            slide={slide}
            index={index}
            current={current}
            handleSlideClick={handleSlideClick}
          />
        ))}
      </ul>

      <div className="absolute top-[calc(100%+1rem)] flex w-full items-center justify-center gap-4">
        <TextToVideoControl
          type="previous"
          title="Go to previous video"
          handleClick={handlePreviousClick}
        />

        {
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="max-w-2xl flex-1 cursor-pointer rounded-full border border-white/10 bg-black/80 px-4 py-3 backdrop-blur-sm transition-colors hover:bg-black/90"
                onClick={() => {
                  const prompt = slides[current]?.prompt;
                  if (prompt) {
                    if (onPromptClick) {
                      onPromptClick(prompt);
                    } else {
                      handlePromptClick(prompt);
                    }
                  }
                }}
              >
                <p className="line-clamp-1 text-sm leading-relaxed text-white/90">
                  {slides[current]?.prompt}
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to use this prompt</p>
            </TooltipContent>
          </Tooltip>
        }

        <TextToVideoControl
          type="next"
          title="Go to next video"
          handleClick={handleNextClick}
        />
      </div>

      {/* CTA Button */}
      {showCTA && section.textToVideo?.buttons && (
        <div className="absolute top-[calc(100%+6rem)] left-1/2 flex -translate-x-1/2 transform flex-col justify-center gap-4 sm:flex-row">
          {section.textToVideo.buttons.map((item: any, idx: number) => (
            <Button
              key={idx}
              variant={item.variant || 'default'}
              size="lg"
              className="rounded-full"
              asChild
            >
              <Link
                href={item.url || ''}
                target={item.target}
                className="flex items-center justify-center gap-1"
              >
                <span className="flex items-center justify-center gap-1">
                  {item.title}
                  {item.icon && (
                    <SmartIcon name={item.icon as string} size={24} />
                  )}
                </span>
              </Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
