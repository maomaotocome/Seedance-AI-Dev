'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

const DEFAULT_LOGOS = [
  {
    title: 'Hailuo',
    image: { src: '/imgs/logos/hailuo.svg', alt: 'Hailuo' },
  },
  {
    title: 'Kling',
    image: { src: '/imgs/logos/kling.svg', alt: 'Kling' },
  },
  {
    title: 'Wan',
    image: { src: '/imgs/logos/wan.svg', alt: 'Wan' },
  },
  {
    title: 'Pixverse',
    image: { src: '/imgs/logos/pixverse.svg', alt: 'Pixverse' },
  },
  {
    title: 'Luma',
    image: { src: '/imgs/logos/luma.svg', alt: 'Luma' },
  },
];

function LogoItem({ item }: { item: any }) {
  const inner = (
    <div className="flex flex-col items-center gap-2.5 px-6">
      <img
        src={item.image?.src ?? ''}
        alt={item.image?.alt ?? ''}
        className={cn(
          'h-8 opacity-40 transition-opacity duration-300 group-hover:opacity-80',
          item.image?.invert === false ? '' : 'dark:invert'
        )}
      />
      <span className="text-[11px] font-medium tracking-wide text-white/30">
        {item.title}
      </span>
    </div>
  );

  if (item.url) {
    return (
      <a
        href={item.url}
        target={item.target || '_blank'}
        rel="noreferrer noopener"
        className="group shrink-0"
      >
        {inner}
      </a>
    );
  }

  return <div className="group shrink-0">{inner}</div>;
}

export function Logos({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  const items: any[] = section.items?.length
    ? section.items
    : section.logos?.length
      ? section.logos.map((item: any) => ({
          title: item.title || item.name || '',
          image: item.image,
        }))
      : DEFAULT_LOGOS;

  return (
    <section
      id={section.id}
      className={cn('bg-black py-12', section.className, className)}
    >
      <motion.div
        className="container flex flex-col items-center"
        initial={prefersReducedMotion ? undefined : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="sr-only">{section.title}</h2>
        <p className="mb-8 text-center text-[11px] font-medium tracking-[0.2em] text-white/25 uppercase">
          {section.title || 'Powered by Industry-Leading AI'}
        </p>

        <div
          className="relative w-full overflow-hidden"
          style={
            {
              '--duration': '35s',
              maskImage:
                'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
              WebkitMaskImage:
                'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
            } as React.CSSProperties
          }
        >
          <div
            className={cn(
              'flex w-max gap-12',
              !prefersReducedMotion && 'animate-marquee'
            )}
          >
            {[...items, ...items].map((item, idx) => (
              <LogoItem key={idx} item={item} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
