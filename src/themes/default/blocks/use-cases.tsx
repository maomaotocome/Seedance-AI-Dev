'use client';

import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play } from 'lucide-react';

import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

function UseCaseCard({
  item,
  index,
  prefersReducedMotion,
}: {
  item: any;
  index: number;
  prefersReducedMotion: boolean | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-500 hover:border-gold/20 hover:bg-white/[0.04]"
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.6,
        delay: prefersReducedMotion ? 0 : 0.1 * index,
        ease: EASE_OUT_EXPO,
      }}
    >
      {/* Content */}
      <div className="flex-1 p-6">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10">
          <SmartIcon
            name={item.icon as string}
            size={20}
            className="text-gold"
          />
        </div>
        <h3 className="mb-2 text-base font-semibold text-white">
          {item.title}
        </h3>
        <p className="text-sm leading-relaxed text-white/50">
          {item.description}
        </p>
      </div>

      {/* Video Thumbnail */}
      {item.image && (
        <div
          className="relative aspect-[16/9] overflow-hidden"
          onMouseEnter={() => {
            setIsHovered(true);
            videoRef.current?.play();
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            videoRef.current?.pause();
          }}
        >
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
          <div className={cn(
            'absolute inset-0 flex items-center justify-center transition-opacity duration-300',
            isHovered ? 'opacity-0' : 'opacity-100'
          )}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
              <Play className="ml-0.5 h-3.5 w-3.5 fill-white text-white" />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function UseCases({
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

        {/* Footer Links under title */}
        <div className="mx-auto mb-10 hidden max-w-5xl items-center justify-center gap-x-12 text-xs text-white/40 md:flex">
          {['Product', 'Community', 'Resources', 'Legal'].map((col) => (
            <span key={col} className="font-medium">{col}</span>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {section.items?.map((item: any, idx: number) => (
            <UseCaseCard
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
