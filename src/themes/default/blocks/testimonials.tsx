'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { Section as SectionType } from '@/shared/types/blocks/landing';

import { TestimonialsColumn } from './testimonial-column';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function Testimonials({ section }: { section: SectionType }) {
  const prefersReducedMotion = useReducedMotion();

  if (section.disabled) {
    return null;
  }

  const testimonials =
    section.items?.map((item) => ({
      text: item.description || '',
      image: item.image?.src || item.avatar?.src || '',
      name: item.name || item.title || '',
      role: item.role || item.label || (item.name ? item.title || '' : ''),
    })) || [];

  const firstColumn = testimonials.slice(0, Math.ceil(testimonials.length / 3));
  const secondColumn = testimonials.slice(
    Math.ceil(testimonials.length / 3),
    Math.ceil((testimonials.length * 2) / 3)
  );
  const thirdColumn = testimonials.slice(
    Math.ceil((testimonials.length * 2) / 3)
  );

  return (
    <section
      id={section.id}
      className={cn(
        'relative overflow-hidden py-24 md:py-32',
        section.className
      )}
    >
      <div className="z-10 container mx-auto">
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE_OUT_EXPO }}
          viewport={{ once: true }}
          className="mx-auto flex max-w-xl flex-col items-center justify-center"
        >
          {section.label && (
            <Badge
              className="border-border/50 mb-4 gap-1 text-xs font-medium"
              variant="outline"
            >
              {section.icon &&
                (typeof section.icon === 'string' ? (
                  <SmartIcon name={section.icon} size={16} />
                ) : (
                  section.icon
                ))}
              {section.label}
            </Badge>
          )}

          <h2 className="text-center text-3xl font-bold tracking-tight md:text-5xl">
            {section.title}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md text-center text-lg leading-relaxed">
            {section.description}
          </p>
        </motion.div>

        <div className="mt-14 flex max-h-[740px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
      </div>
    </section>
  );
}
