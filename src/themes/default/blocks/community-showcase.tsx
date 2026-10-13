'use client';

import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface ShowcaseItem {
  title: string;
  image: string;
  videoSrc?: string;
  description?: string;
}

function VideoCard({
  item,
  index,
  prefersReducedMotion,
}: {
  item: ShowcaseItem;
  index: number;
  prefersReducedMotion: boolean | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all duration-500 hover:border-gold/20 hover:bg-white/[0.04]"
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.6,
        delay: prefersReducedMotion ? 0 : 0.06 * index,
        ease: EASE_OUT_EXPO,
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        videoRef.current?.play();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        videoRef.current?.pause();
      }}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className={cn(
            'h-full w-full object-cover transition-all duration-700',
            isHovered ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
          )}
        />
        {item.videoSrc && (
          <video
            ref={videoRef}
            src={item.videoSrc}
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-500',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
            muted
            loop
            playsInline
            preload="none"
          />
        )}
        {/* Play Icon */}
        <div className={cn(
          'absolute inset-0 flex items-center justify-center transition-opacity duration-300',
          isHovered ? 'opacity-0' : 'opacity-100'
        )}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
            <Play className="ml-0.5 h-4 w-4 fill-white text-white" />
          </div>
        </div>
        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/70 to-transparent" />
      </div>
      <div className="px-3 py-2.5">
        <span className="text-xs font-medium text-white/70">{item.title}</span>
      </div>
    </motion.div>
  );
}

export function CommunityShowcase({
  section,
}: {
  section: Section;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (section.disabled) return null;

  const items: ShowcaseItem[] = (section.items ?? []).map((item: any) => ({
    title: item.title,
    image: item.image,
    videoSrc: item.videoSrc,
    description: item.description,
  }));

  return (
    <section
      id={section.id}
      className={cn('dark bg-black py-20 text-white md:py-28', section.className)}
    >
      <div className="container">
        {/* Section Header */}
        <motion.div
          className="mx-auto mb-12 max-w-3xl text-center"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
        >
          {section.label && (
            <Badge className="mb-4 border-gold/20 bg-gold/10 text-xs font-medium text-gold" variant="outline">
              {section.label}
            </Badge>
          )}
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
            {section.title}
          </h2>
          {section.description && (
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/50">
              {section.description}
            </p>
          )}
        </motion.div>

        {/* Masonry Grid */}
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {items.map((item, idx) => (
            <div key={idx} className="mb-4 break-inside-avoid">
              <VideoCard
                item={item}
                index={idx}
                prefersReducedMotion={!!prefersReducedMotion}
              />
            </div>
          ))}
        </div>

        {/* View More */}
        {section.button && (
          <motion.div
            className="mt-10 text-center"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
          >
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-white/10 bg-white/5 px-8 text-white backdrop-blur-sm hover:border-gold/30 hover:bg-white/10"
            >
              <Link href={(section.button as any).url ?? ''}>
                {(section.button as any).title}
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
