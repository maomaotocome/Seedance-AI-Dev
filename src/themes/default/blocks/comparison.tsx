'use client';

import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Play, X } from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

function ComparisonPanel({
  item,
  index,
  prefersReducedMotion,
}: {
  item: any;
  index: number;
  prefersReducedMotion: boolean | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isFeatured = item.is_featured;

  return (
    <motion.div
      className={cn(
        'group relative overflow-hidden rounded-2xl border transition-all duration-500',
        isFeatured
          ? 'border-gold/30 bg-gold/[0.03] shadow-[0_0_30px_rgba(212,168,67,0.1)]'
          : 'border-white/[0.08] bg-white/[0.02]'
      )}
      initial={prefersReducedMotion ? undefined : { opacity: 0, x: index === 0 ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.8,
        delay: prefersReducedMotion ? 0 : 0.2 * index,
        ease: EASE_OUT_EXPO,
      }}
    >
      {/* Top Label */}
      <div className={cn(
        'flex items-center gap-2 px-5 py-3',
        isFeatured ? 'bg-gold/[0.06]' : 'bg-white/[0.02]'
      )}>
        <div className={cn(
          'flex h-5 w-5 items-center justify-center rounded-full',
          isFeatured ? 'bg-gold/20' : 'bg-red-500/20'
        )}>
          {isFeatured ? (
            <Check className="h-3 w-3 text-gold" />
          ) : (
            <X className="h-3 w-3 text-red-400" />
          )}
        </div>
        <span className={cn(
          'text-sm font-semibold',
          isFeatured ? 'text-gold' : 'text-white/70'
        )}>
          {item.title}
        </span>
      </div>

      {/* Video/Image */}
      <div
        className="relative aspect-video cursor-pointer overflow-hidden"
        onClick={() => {
          if (isPlaying) {
            videoRef.current?.pause();
          } else {
            videoRef.current?.play();
          }
          setIsPlaying(!isPlaying);
        }}
      >
        <img
          src={item.image}
          alt={item.title}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-500',
            isPlaying ? 'opacity-0' : 'opacity-100'
          )}
        />
        {item.videoSrc && (
          <video
            ref={videoRef}
            src={item.videoSrc}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            loop
            playsInline
            preload="none"
          />
        )}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-sm',
              isFeatured ? 'bg-gold/30' : 'bg-white/20'
            )}>
              <Play className={cn(
                'ml-0.5 h-5 w-5',
                isFeatured ? 'fill-gold text-gold' : 'fill-white text-white'
              )} />
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="px-5 py-4">
        <p className={cn(
          'text-sm font-medium',
          isFeatured ? 'text-gold/80' : 'text-white/50'
        )}>
          {item.label}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-white/40">
          {item.description}
        </p>
      </div>
    </motion.div>
  );
}

export function Comparison({
  section,
}: {
  section: Section;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (section.disabled) return null;

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
            <Badge className="mb-4 border-white/10 bg-white/5 text-xs font-medium text-white/60" variant="outline">
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

        {/* Comparison Grid */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          {section.items?.map((item: any, idx: number) => (
            <ComparisonPanel
              key={idx}
              item={item}
              index={idx}
              prefersReducedMotion={!!prefersReducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
