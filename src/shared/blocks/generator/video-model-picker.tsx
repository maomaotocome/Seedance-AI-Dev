'use client';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { VIDEO_PRODUCT_MODELS, VideoProductModel } from '@/config/video-models';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import { cn } from '@/shared/lib/utils';

export function VideoModelPicker({
  model,
  open,
  onOpenChange,
  onSelect,
}: {
  model: VideoProductModel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (model: VideoProductModel) => void;
}) {
  const t = useTranslations('ai.video.generator');

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('model_picker.title')}
      description={t('model_picker.description')}
      className="border-director-rule-light bg-director-paper text-director-paper-text overflow-hidden [--border:var(--director-rule-light)] [--foreground:var(--director-paper-text)] [--muted-foreground:var(--director-paper-muted)] [--popover-foreground:var(--director-paper-text)] [--popover:var(--director-paper)] sm:max-w-xl [&_[data-slot=dialog-close]]:text-director-paper-text"
    >
      <CommandInput
        aria-label={t('model_picker.search')}
        placeholder={t('model_picker.search')}
      />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>{t('model_picker.empty')}</CommandEmpty>
        <CommandGroup heading={t('model_picker.available')}>
          {Object.entries(VIDEO_PRODUCT_MODELS).map(([value, item]) => (
            <CommandItem
              key={value}
              value={`${item.label} ${item.family} ${t(
                `models.${item.uiKey}.summary`
              )}`}
              onSelect={() => onSelect(value as VideoProductModel)}
              className="group data-[selected=true]:border-director-rule-light data-[selected=true]:bg-director-paper-3 data-[selected=true]:text-director-paper-text my-1 items-start gap-3 rounded-md border border-transparent px-3 py-3"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'border-director-rule-light mt-1 flex size-4 shrink-0 items-center justify-center border',
                  model === value &&
                    'border-director-orange bg-director-orange text-director-orange-ink'
                )}
              >
                {model === value && <Check className="size-3" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm">{item.label}</strong>
                  <span className="text-director-paper-muted font-mono text-[10px]">
                    {item.family}
                  </span>
                  {item.badge && (
                    <span className="bg-director-orange/10 text-director-orange-text px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase">
                      {t(`badges.${item.badge}`)}
                    </span>
                  )}
                </span>
                <span className="text-director-paper-muted mt-1 block text-xs leading-5">
                  {t(`models.${item.uiKey}.description`)}
                </span>
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
