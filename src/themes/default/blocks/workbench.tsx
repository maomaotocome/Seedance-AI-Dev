'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  ChevronDown,
  Folder,
  Grid3X3,
  Layers,
  MonitorPlay,
  Pause,
  Play,
  Plus,
  Search,
  Settings,
  SkipBack,
  SkipForward,
  Sliders,
  Upload,
  Volume2,
  Zap,
} from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="w-full truncate text-white/60">{label}</span>
      <span className="text-gold shrink-0 font-mono">{value}%</span>
    </div>
  );
}

function TimelineTrack({
  label,
  color,
  segments,
}: {
  label: string;
  color: string;
  segments: { start: number; width: number }[];
}) {
  return (
    <div className="flex h-6 items-center gap-2">
      <span className="w-20 shrink-0 truncate text-[10px] text-white/50">
        {label}
      </span>
      <div className="relative h-4 flex-1 rounded bg-white/[0.03]">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="absolute top-0.5 bottom-0.5 rounded-sm"
            style={{
              left: `${seg.start}%`,
              width: `${seg.width}%`,
              backgroundColor: color,
              opacity: 0.7,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function Workbench({
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

        {/* Workbench Mockup */}
        <motion.div
          className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0f] shadow-2xl"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, ease: EASE_OUT_EXPO }}
        >
          {/* Top Toolbar */}
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0d0d14] px-4 py-2.5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs font-semibold text-white/80">SeedanceAI Studio</span>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
                <Search className="h-3 w-3 text-white/30" />
                <span className="text-[10px] text-white/30">Search assets...</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
              <span className="text-[10px] text-white/50">Creator</span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex" style={{ height: '420px' }}>
            {/* Left Sidebar - Asset Library */}
            <div className="hidden w-48 shrink-0 border-r border-white/[0.06] bg-[#0c0c12] lg:block">
              {/* Tabs */}
              <div className="flex border-b border-white/[0.06]">
                {['Models', 'Prompts', 'Uploads'].map((tab, i) => (
                  <button
                    key={tab}
                    className={cn(
                      'flex-1 px-2 py-2.5 text-[10px] font-medium transition-colors',
                      i === 0
                        ? 'border-b border-gold text-gold'
                        : 'text-white/40 hover:text-white/60'
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Asset Grid */}
              <div className="p-2">
                <div className="mb-2 flex items-center gap-1.5 rounded border border-white/[0.06] bg-white/[0.03] px-2 py-1">
                  <Search className="h-2.5 w-2.5 text-white/30" />
                  <span className="text-[9px] text-white/30">Import from...</span>
                </div>
                <div className="mb-1.5 flex items-center gap-1 text-[9px] text-white/40">
                  <Folder className="h-3 w-3" />
                  <span>Uploads</span>
                  <span className="text-white/20">·</span>
                  <span>Exported Now</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="aspect-square overflow-hidden rounded-md bg-gradient-to-br from-white/[0.06] to-white/[0.02] transition-all hover:ring-1 hover:ring-gold/30"
                    >
                      <div className={cn(
                        'h-full w-full',
                        i === 1 && 'bg-gradient-to-br from-purple-900/40 to-blue-900/40',
                        i === 2 && 'bg-gradient-to-br from-amber-900/40 to-red-900/40',
                        i === 3 && 'bg-gradient-to-br from-emerald-900/40 to-teal-900/40',
                        i === 4 && 'bg-gradient-to-br from-pink-900/40 to-violet-900/40',
                        i === 5 && 'bg-gradient-to-br from-cyan-900/40 to-blue-900/40',
                        i === 6 && 'bg-gradient-to-br from-orange-900/40 to-yellow-900/40',
                      )} />
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {['Cinematic', 'Studio Sh...'].map((label) => (
                    <div
                      key={label}
                      className="rounded bg-white/[0.04] px-1.5 py-1 text-center text-[8px] text-white/40"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Center - Preview */}
            <div className="flex flex-1 flex-col">
              {/* Video Preview */}
              <div className="relative flex-1 bg-gradient-to-b from-[#0a0a12] to-[#080810]">
                {/* Preview content area */}
                <div className="absolute inset-4 flex items-center justify-center overflow-hidden rounded-lg border border-white/[0.04] bg-black">
                  <div className="relative h-full w-full bg-gradient-to-br from-[#1a1428] via-[#0d0d1a] to-[#0a1420]">
                    {/* Simulated video frame */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm transition-all hover:border-gold/40 hover:bg-gold/10">
                        <Play className="ml-0.5 h-6 w-6 text-white/80" />
                      </div>
                    </div>
                    {/* Top-left corner tag */}
                    <div className="absolute top-3 left-3 rounded bg-black/60 px-2 py-0.5 text-[9px] text-white/50 backdrop-blur-sm">
                      1080p · 16:9
                    </div>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-lg border border-white/[0.06] bg-[#0c0c14]/90 px-3 py-2 backdrop-blur-md">
                  <SkipBack className="h-3 w-3 cursor-pointer text-white/40 hover:text-white/70" />
                  <div className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-gold">
                    <Play className="ml-0.5 h-3 w-3 fill-black text-black" />
                  </div>
                  <SkipForward className="h-3 w-3 cursor-pointer text-white/40 hover:text-white/70" />
                  <span className="font-mono text-[10px] text-white/40">
                    00:04 / 0:10:53
                  </span>
                  <div className="mx-2 h-1 flex-1 rounded-full bg-white/10">
                    <div className="h-full w-1/3 rounded-full bg-gold/70" />
                  </div>
                  <Volume2 className="h-3 w-3 text-white/40" />
                  <MonitorPlay className="h-3 w-3 text-white/40" />
                </div>
              </div>

              {/* Timeline */}
              <div className="border-t border-white/[0.06] bg-[#0b0b12] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-white/50">Timeline Rts</span>
                    <ChevronDown className="h-3 w-3 text-white/30" />
                  </div>
                  <div className="flex items-center gap-2">
                    {[Grid3X3, Layers, Settings].map((Icon, i) => (
                      <Icon key={i} className="h-3 w-3 cursor-pointer text-white/30 hover:text-white/50" />
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <TimelineTrack label="Track 1" color="#D4A843" segments={[{ start: 5, width: 30 }, { start: 40, width: 20 }]} />
                  <TimelineTrack label="V-Track" color="#8B5CF6" segments={[{ start: 10, width: 45 }]} />
                  <TimelineTrack label="Themes 1" color="#06B6D4" segments={[{ start: 0, width: 60 }]} />
                  <TimelineTrack label="Drone" color="#10B981" segments={[{ start: 15, width: 25 }, { start: 50, width: 15 }]} />
                  <TimelineTrack label="Audio 1x6 f.1" color="#F97316" segments={[{ start: 0, width: 80 }]} />
                </div>
              </div>
            </div>

            {/* Right Sidebar - Parameters & Queue */}
            <div className="hidden w-52 shrink-0 border-l border-white/[0.06] bg-[#0c0c12] xl:block">
              {/* Parameters */}
              <div className="border-b border-white/[0.06] p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-white/70">Parameters</span>
                  <Sliders className="h-3 w-3 text-white/30" />
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Aspect Ratio', value: '16:9' },
                    { label: 'Camera Soccer?', value: '0' },
                    { label: 'Lighting', value: '0201' },
                    { label: 'Seed', value: '' },
                  ].map((param) => (
                    <div key={param.label}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[10px] text-white/50">{param.label}</span>
                        <span className="font-mono text-[10px] text-white/40">{param.value}</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-gold/50"
                          style={{
                            width:
                              param.label === 'Aspect Ratio'
                                ? '70%'
                                : param.label === 'Lighting'
                                  ? '45%'
                                  : '20%',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="mb-1 block text-[10px] text-white/50">Seed</label>
                  <div className="rounded border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[10px] text-white/30">
                    Random Rta
                  </div>
                </div>
                <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-2.5 text-xs font-semibold text-black transition-all hover:bg-gold/90 hover:shadow-[0_0_20px_rgba(212,168,67,0.3)]">
                  <Zap className="h-3.5 w-3.5" />
                  Generate Video
                </button>
              </div>

              {/* Generation Queue */}
              <div className="p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-white/70">Generation Queue</span>
                  <span className="text-[9px] text-white/30">Autoplay</span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Generating: Se Fl Over...', value: 67 },
                    { label: 'Generating: Se Fl Over...', value: 45 },
                    { label: 'Generating: Se Fl Over...', value: 23 },
                    { label: 'Generating: Se Fl Over...', value: 89 },
                    { label: 'Generating: Su Fl Over...', value: 12 },
                  ].map((item, i) => (
                    <div key={i} className="rounded border border-white/[0.04] bg-white/[0.02] px-2 py-1.5">
                      <ProgressBar value={item.value} label={item.label} />
                      <div className="mt-1 h-0.5 rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-gold/60 transition-all"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
