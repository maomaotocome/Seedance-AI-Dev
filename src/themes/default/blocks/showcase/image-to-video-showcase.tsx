'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { IconArrowNarrowRight } from '@tabler/icons-react';

import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { Button } from '@/shared/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/shared/components/ui/carousel';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/shared/components/ui/resizable';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { cn, handlePromptClick } from '@/shared/lib/utils';

interface ImageToVideoSlideData {
  prompt: string;
  originalImage: string;
  videoSrc: string;
  url?: string;
  target?: string;
}

interface ImageToVideoShowcaseProps {
  slides: ImageToVideoSlideData[];
  section: any;
}

export function ImageToVideoShowcase({
  slides,
  section,
}: ImageToVideoShowcaseProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Handle carousel API and current slide tracking
  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Handle video autoplay when slide changes
  useEffect(() => {
    const currentVideo = videoRefs.current[current];
    if (currentVideo) {
      currentVideo.play().catch(() => {
        // Autoplay failed, which is expected in some browsers
      });
    }
  }, [current]);

  const scrollToHeroInput = () => {
    const heroInputElement = document.getElementById('hero-input');
    if (heroInputElement) {
      heroInputElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const id = useId();

  if (!slides.length) return null;

  return (
    <div
      className="relative mx-auto w-full max-w-6xl"
      aria-labelledby={`image-to-video-showcase-heading-${id}`}
    >
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: 'start',
          loop: true,
        }}
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="p-4">
                <ResizablePanelGroup direction="horizontal" className="h-full">
                  {/* Panel Group for Two and Three */}
                  <ResizablePanel defaultSize={35} minSize={30}>
                    <ResizablePanelGroup
                      direction="vertical"
                      className="h-full"
                    >
                      {/* Panel Two - Original Image */}
                      <ResizablePanel defaultSize={60} minSize={40}>
                        <div className="flex h-full flex-col rounded-2xl bg-gray-900 p-6">
                          <div className="mb-4 flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-gray-600"></div>
                            <span className="text-sm font-medium text-gray-400">
                              Original image
                            </span>
                          </div>
                          <div className="flex min-h-0 flex-1 items-center justify-center">
                            <div className="relative h-full w-full">
                              {slide.originalImage ? (
                                <Image
                                  src={slide.originalImage}
                                  alt={slide.prompt}
                                  fill
                                  unoptimized
                                  className="rounded-lg object-contain"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm font-medium text-gray-600">
                                  No image
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </ResizablePanel>
                      <ResizableHandle className="h-4 bg-transparent" />
                      {/* Panel Three - Prompt */}
                      <ResizablePanel defaultSize={40} minSize={20}>
                        <div className="flex h-full flex-col rounded-2xl bg-gray-900 p-6">
                          <div className="mb-4 flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-gray-600"></div>
                            <span className="text-sm font-medium text-gray-400">
                              Prompt
                            </span>
                          </div>
                          <div className="flex flex-1 items-start">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p
                                  className="cursor-pointer text-sm leading-relaxed text-white/90 transition-colors hover:text-white"
                                  onClick={() =>
                                    handlePromptClick(slide.prompt)
                                  }
                                >
                                  {slide.prompt}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Click to use this prompt</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  </ResizablePanel>
                  <ResizableHandle className="w-4 bg-transparent" />
                  {/* Panel One - Video (Right side) */}
                  <ResizablePanel defaultSize={65} minSize={50}>
                    <div className="flex h-full flex-col rounded-2xl bg-gray-900 p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="bg-primary h-3 w-3 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-400">
                          Video
                        </span>
                      </div>
                      <div className="flex flex-1 items-center justify-center">
                        <div className="relative h-full max-h-full w-full max-w-full">
                          <video
                            ref={(el) => {
                              videoRefs.current[index] = el;
                            }}
                            className="h-full w-full rounded-lg object-contain"
                            src={slide.videoSrc}
                            muted
                            loop
                            playsInline
                            preload={index === current ? 'metadata' : 'none'}
                            style={{ maxHeight: '500px' }}
                          />
                        </div>
                      </div>
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Navigation Controls with Slide Indicators */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <Button
          className="rotate-180 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
          title="Go to previous example"
          aria-label="Go to previous example"
          onClick={() => api?.scrollPrev()}
          variant="outline"
          size="icon"
        >
          <IconArrowNarrowRight className="text-white" />
        </Button>

        {/* Slide Indicators */}
        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              aria-label={`Go to example ${index + 1}`}
              className={cn(
                'h-2 w-2 rounded-full transition-all duration-200',
                index === current
                  ? 'bg-primary w-6'
                  : 'bg-gray-600 hover:bg-gray-500'
              )}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>

        <Button
          title="Go to next example"
          aria-label="Go to next example"
          className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
          onClick={() => api?.scrollNext()}
          variant="outline"
          size="icon"
        >
          <IconArrowNarrowRight className="text-white" />
        </Button>
      </div>

      {/* CTA Button */}
      {section.imageToVideo?.buttons && (
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          {section.imageToVideo.buttons.map((item: any, idx: number) => (
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
