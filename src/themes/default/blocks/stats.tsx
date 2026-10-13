'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { Section as SectionType } from '@/shared/types/blocks/landing';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

function parseStatValue(raw: string): { number: number; suffix: string } {
  const match = raw.match(/^([\d,.]+)\s*(.*)$/);
  if (!match) return { number: 0, suffix: raw };
  const num = parseFloat(match[1].replace(/,/g, ''));
  return { number: isNaN(num) ? 0 : num, suffix: match[2] || '' };
}

export function Stats({ section }: { section: SectionType }) {
  const prefersReducedMotion = useReducedMotion();

  if (section.disabled) {
    return null;
  }

  const items =
    section.items?.map((item) => {
      const hasTemplateShape = Boolean(item.label);
      const rawValue = item.label || item.title || '0';
      const { number, suffix } = parseStatValue(rawValue);

      return {
        eyebrow: hasTemplateShape ? item.description || '' : '',
        value: rawValue,
        number,
        suffix,
        title: hasTemplateShape ? item.title || '' : item.description || '',
      };
    }) || [];

  return (
    <section
      id={section.id || section.name}
      className={cn(
        'dark bg-black py-24 text-white md:py-32',
        section.className
      )}
    >
      <div className="container flex flex-col items-center">
        <motion.div
          className="mb-16 flex flex-col items-center gap-4 text-center"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
        >
          {section.label && (
            <Badge
              className="border-white/10 bg-white/5 text-xs font-medium text-white/70"
              variant="outline"
            >
              {section.icon && (
                <SmartIcon
                  name={section.icon as string}
                  className="text-primary mr-2 h-4 w-4"
                  size={16}
                />
              )}
              {section.label}
            </Badge>
          )}
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            {section.title}
          </h2>
          <p className="max-w-lg text-lg text-white/50">
            {section.description}
          </p>
        </motion.div>

        <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((item, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center rounded-2xl border border-white/[0.06] bg-white/[0.02] px-8 py-10 text-center backdrop-blur-sm"
              initial={
                prefersReducedMotion
                  ? undefined
                  : { opacity: 0, y: 30, scale: 0.95 }
              }
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: prefersReducedMotion ? 0 : 0.12 * index,
                ease: EASE_OUT_EXPO,
              }}
            >
              <p className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-6xl font-bold text-transparent tabular-nums lg:text-7xl">
                {item.value}
              </p>
              <p className="mt-3 text-base font-medium text-white">
                {item.title}
              </p>
              {item.eyebrow && (
                <p className="mt-1 text-sm text-white/40">{item.eyebrow}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
