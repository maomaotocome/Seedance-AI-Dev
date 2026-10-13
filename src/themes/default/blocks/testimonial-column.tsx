'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { LazyImage } from '@/shared/blocks/common/lazy-image';

interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
}

interface TestimonialsColumnProps {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}

export function TestimonialsColumn({
  className,
  testimonials,
  duration = 15,
}: TestimonialsColumnProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={className}>
      <motion.div
        animate={prefersReducedMotion ? undefined : { translateY: '-50%' }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...new Array(2)].map((_, index) => (
          <React.Fragment key={index}>
            {testimonials.map(({ text, image, name, role }, i) => (
              <div
                className="border-border/50 bg-card hover:border-border w-full max-w-xs rounded-2xl border p-6 shadow-sm transition-colors duration-300"
                key={i}
              >
                <q className="text-muted-foreground mb-5 block text-sm leading-relaxed">
                  {text}
                </q>
                <div className="flex items-center gap-3">
                  <div className="ring-input size-10 overflow-hidden rounded-full ring-1">
                    <LazyImage
                      src={image}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="text-sm leading-5 font-medium">{name}</div>
                    <div className="text-muted-foreground text-xs leading-4">
                      {role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}
