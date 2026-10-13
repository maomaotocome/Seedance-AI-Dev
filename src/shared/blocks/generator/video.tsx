'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import {
  Check,
  ChevronDown,
  ChevronsUpDown,
  Clapperboard,
  Download,
  ImageIcon,
  Loader2,
  Settings2,
  Upload,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Link, useRouter } from '@/core/i18n/navigation';
import { getSampleVideo, isSampleVideoId } from '@/config/sample-videos';
import {
  calculateVideoCredits,
  getVideoModelConfig,
  isVideoProductModel,
  VideoProductModel,
  VideoScene,
} from '@/config/video-models';
import { AIMediaType, AITaskStatus } from '@/extensions/ai/types';
import type { ImageUploaderValue } from '@/shared/blocks/common/image-uploader';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { Textarea } from '@/shared/components/ui/textarea';
import { useAppContext } from '@/shared/contexts/app';
import {
  getAnalyticsPageGroup,
  rememberAnalyticsEntryPage,
  trackAnalyticsEvent,
} from '@/shared/lib/analytics';
import { cn } from '@/shared/lib/utils';
import {
  estimateVideoBudget,
  type CreditPlan,
} from '@/shared/lib/video-budget';
import {
  normalizeVideoDraft,
  readVideoDraft,
  VIDEO_DRAFT_KEY,
  type VideoDraft,
} from '@/shared/lib/video-draft';

const ImageUploader = dynamic(
  () =>
    import('@/shared/blocks/common/image-uploader').then(
      (module) => module.ImageUploader
    ),
  { ssr: false }
);

const VideoModelPicker = dynamic(
  () =>
    import('./video-model-picker').then((module) => module.VideoModelPicker),
  { ssr: false }
);

interface VideoGeneratorProps {
  maxSizeMB?: number;
  srOnlyTitle?: string;
  defaultModel?: VideoProductModel;
  variant?: 'page' | 'embedded' | 'hero';
  emptyPreview?: {
    src: string;
    video?: string;
    alt: string;
    label: string;
    caption: string;
  };
}

interface GeneratedVideo {
  id: string;
  url: string;
  model?: string;
  prompt?: string;
}

interface BackendTask {
  id: string;
  status: string;
  model: string;
  prompt: string | null;
  taskInfo: string | null;
}

interface GenerationAnalyticsContext {
  page_group: ReturnType<typeof getAnalyticsPageGroup>;
  content_locale: string;
  model: VideoProductModel;
  generation_mode: VideoScene;
  resolution: string;
  duration_seconds: number;
  aspect_ratio: string;
  audio_enabled: boolean;
  credits_charged: number;
  started_at: number;
}

const POLL_INTERVAL = 10_000;
const GENERATION_TIMEOUT = 20 * 60 * 1000;
const MAX_PROMPT_LENGTH = 4_000;

function parseJson(value: string | null): any {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractVideoUrls(result: any): string[] {
  if (!result) return [];

  const candidates = [
    result.videos,
    result.video,
    result.output,
    result.data,
    result.resultUrls,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (typeof candidate === 'string') return [candidate];
    if (Array.isArray(candidate)) {
      const urls = candidate
        .map((item: any) =>
          typeof item === 'string'
            ? item
            : (item?.url ?? item?.uri ?? item?.videoUrl ?? item?.src)
        )
        .filter(Boolean);
      if (urls.length > 0) return urls;
    }
    if (typeof candidate === 'object') {
      const url =
        candidate.url ?? candidate.uri ?? candidate.videoUrl ?? candidate.src;
      if (typeof url === 'string') return [url];
    }
  }

  return [];
}

function NativeSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="text-director-paper-muted mb-1.5 block text-[10px] font-bold tracking-[0.12em] uppercase">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-director-rule-light text-director-paper-text focus-visible:outline-director-focus h-11 w-full max-w-full min-w-0 rounded-md border bg-transparent px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {children}
      </select>
    </label>
  );
}

export function SeedanceGeneratorPanel({
  maxSizeMB = 30,
  defaultModel = 'seedance-2.5',
  variant = 'embedded',
  emptyPreview,
}: VideoGeneratorProps) {
  const t = useTranslations('ai.video.generator');
  const locale = useLocale();
  const priceTranslations = useTranslations('pages.pricing');
  const starterPlan = (
    priceTranslations.raw('page.sections.pricing.items') as CreditPlan[]
  ).find((plan) => plan.product_id === 'pack_starter');
  const defaultConfig = getVideoModelConfig(defaultModel);
  const [scene, setScene] = useState<VideoScene>('text-to-video');
  const [model, setModel] = useState<VideoProductModel>(defaultModel);
  const [resolution, setResolution] = useState(defaultConfig.defaultResolution);
  const [duration, setDuration] = useState(defaultConfig.defaultDuration);
  const [aspectRatio, setAspectRatio] = useState(
    defaultConfig.defaultAspectRatio
  );
  const [generateAudio, setGenerateAudio] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [promptExtend, setPromptExtend] = useState(true);
  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
  const [referenceItems, setReferenceItems] = useState<ImageUploaderValue[]>(
    []
  );
  const [referenceUrls, setReferenceUrls] = useState<string[]>([]);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [generationStartedAt, setGenerationStartedAt] = useState<number | null>(
    null
  );
  const [taskStatus, setTaskStatus] = useState<AITaskStatus | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const generationAnalyticsRef = useRef<GenerationAnalyticsContext | null>(
    null
  );

  const {
    user,
    isCheckSign,
    isShowSignModal,
    setIsShowSignModal,
    fetchUserCredits,
  } = useAppContext();
  const router = useRouter();

  const modelConfig = useMemo(() => getVideoModelConfig(model), [model]);
  const promptLength = prompt.trim().length;
  const costCredits = useMemo(
    () =>
      calculateVideoCredits({
        model,
        resolution,
        duration,
        generateAudio,
      }),
    [duration, generateAudio, model, resolution]
  );
  const remainingCredits = user?.credits?.remainingCredits ?? 0;
  const isUploading = referenceItems.some(
    (item) => item.status === 'uploading'
  );
  const hasUploadError = referenceItems.some((item) => item.status === 'error');
  const requiresImage = scene !== 'text-to-video';
  const supportsAudio = modelConfig.audio === 'toggle';
  const showAspectRatio = !(requiresImage && modelConfig.aspectFromImage);
  const maxReferenceImages =
    scene === 'image-to-video' && model.startsWith('seedance-')
      ? 2
      : modelConfig.maxImages;
  const canGenerate =
    promptLength > 0 &&
    promptLength <= MAX_PROMPT_LENGTH &&
    !isUploading &&
    (!requiresImage || referenceUrls.length > 0) &&
    !isGenerating;

  const handleModelChange = useCallback(
    (nextModel: VideoProductModel) => {
      const nextConfig = getVideoModelConfig(nextModel);
      const nextScene = nextConfig.scenes.includes(scene)
        ? scene
        : nextConfig.scenes[0];

      setModel(nextModel);
      setScene(nextScene);
      setResolution(nextConfig.defaultResolution);
      setDuration(nextConfig.defaultDuration);
      setAspectRatio(nextConfig.defaultAspectRatio);
      setGenerateAudio(nextConfig.audio === 'toggle');
      setIsModelPickerOpen(false);

      if (
        !nextConfig.scenes.includes(scene) ||
        referenceUrls.length >
          (nextScene === 'image-to-video' && nextModel.startsWith('seedance-')
            ? 2
            : nextConfig.maxImages)
      ) {
        setReferenceItems([]);
        setReferenceUrls([]);
        setPresetPreviews([]);
      }
    },
    [referenceUrls.length, scene]
  );

  const [presetPreviews, setPresetPreviews] = useState<string[]>([]);
  const [uploaderVersion, setUploaderVersion] = useState(0);
  const [lastSubmittedDraft, setLastSubmittedDraft] =
    useState<VideoDraft | null>(null);
  const generatingRef = useRef(false);
  generatingRef.current = isGenerating;
  const promptStartedRef = useRef(false);
  const applyDraft = useCallback((draft: VideoDraft) => {
    setModel(draft.model);
    setScene(draft.scene);
    setPrompt(draft.prompt);
    setResolution(draft.resolution);
    setDuration(draft.duration);
    setAspectRatio(draft.aspectRatio);
    setGenerateAudio(draft.generateAudio);
    setNegativePrompt(draft.negativePrompt);
    setPromptExtend(draft.promptExtend);
    setReferenceUrls(draft.referenceUrls);
    setPresetPreviews(draft.referenceUrls);
    setReferenceItems(
      draft.referenceUrls.map((url, i) => ({
        id: `restored-${i}`,
        url,
        preview: url,
        status: 'uploaded',
      }))
    );
    setUploaderVersion((v) => v + 1);
  }, []);
  const applySample = useCallback(
    (id: unknown) => {
      if (!isSampleVideoId(id) || generatingRef.current) return;
      const sample = getSampleVideo(id, locale);
      const draft = normalizeVideoDraft({
        model: sample.model,
        scene: sample.mode === 'image' ? 'image-to-video' : 'text-to-video',
        prompt: sample.prompt,
        resolution: sample.resolution,
        duration: sample.duration,
        aspectRatio: '16:9',
        generateAudio: true,
        referenceUrls: sample.referenceImage
          ? [new URL(sample.referenceImage, 'https://seedanceai.dev').href]
          : [],
      });
      if (draft) {
        applyDraft(draft);
        trackAnalyticsEvent('sample_applied', {
          sample_id: id,
          page_group: getAnalyticsPageGroup(),
          content_locale: locale,
        });
        window.requestAnimationFrame(() =>
          document
            .getElementById('seedance-prompt')
            ?.focus({ preventScroll: true })
        );
      }
    },
    [applyDraft, locale]
  );
  useEffect(() => {
    rememberAnalyticsEntryPage();
    let restored: VideoDraft | null = null;
    try {
      restored = readVideoDraft(
        window.sessionStorage,
        window.location.pathname + window.location.search
      );
    } catch {
      /* Storage can be disabled. */
    }
    const query = new URLSearchParams(window.location.search);
    const requestedModel = query.get('model');
    if (restored) applyDraft(restored);
    else if (isSampleVideoId(query.get('sample')))
      applySample(query.get('sample'));
    else if (requestedModel && isVideoProductModel(requestedModel)) {
      const draft = normalizeVideoDraft({ model: requestedModel });
      if (draft) applyDraft(draft);
    }
    const onSample = (event: Event) =>
      applySample((event as CustomEvent).detail);
    window.addEventListener('seedance:sample', onSample);
    const panel = document.getElementById('seedance-generator');
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        trackAnalyticsEvent('generator_open', {
          page_group: getAnalyticsPageGroup(),
          content_locale: locale,
        });
        observer.disconnect();
      }
    });
    if (panel) observer.observe(panel);
    return () => {
      window.removeEventListener('seedance:sample', onSample);
      observer.disconnect();
    };
  }, [applyDraft, applySample, locale]);
  const currentDraft = (): VideoDraft => ({
    model,
    scene,
    prompt,
    resolution,
    duration,
    aspectRatio,
    generateAudio,
    referenceUrls,
    negativePrompt,
    promptExtend,
  });
  const draftRef = useRef<VideoDraft | null>(null);
  draftRef.current = currentDraft();
  const saveLoginDraft = useCallback(() => {
    try {
      window.sessionStorage.setItem(
        VIDEO_DRAFT_KEY,
        JSON.stringify({
          savedAt: Date.now(),
          path: window.location.pathname + window.location.search,
          draft: draftRef.current,
        })
      );
    } catch {
      /* Generation and sign-in remain usable without browser storage. */
    }
  }, []);
  // Also preserve edits when sign-in is opened from the site header.
  useEffect(() => {
    if (isShowSignModal && !user) saveLoginDraft();
  }, [isShowSignModal, user, saveLoginDraft]);
  const starterEstimate = starterPlan
    ? estimateVideoBudget(starterPlan, costCredits)
    : null;

  const statusLabel = useMemo(() => {
    switch (taskStatus) {
      case AITaskStatus.PENDING:
        return t('status.queued');
      case AITaskStatus.PROCESSING:
        return t('status.generating');
      case AITaskStatus.SUCCESS:
        return t('status.complete');
      case AITaskStatus.FAILED:
        return t('status.failed');
      default:
        return t('status.ready');
    }
  }, [t, taskStatus]);

  const handleReferencesChange = useCallback((items: ImageUploaderValue[]) => {
    setReferenceItems(items);
    setReferenceUrls(
      items
        .filter((item) => item.status === 'uploaded' && item.url)
        .map((item) => item.url as string)
    );
  }, []);

  const finishTask = useCallback(() => {
    setIsGenerating(false);
    setTaskId(null);
    setGenerationStartedAt(null);
    generationAnalyticsRef.current = null;
  }, []);

  const trackGenerationOutcome = useCallback(
    (
      eventName: 'generate_success' | 'generate_failure',
      details: Record<string, string | number | boolean>
    ) => {
      const analyticsContext = generationAnalyticsRef.current;
      if (!analyticsContext) return;

      const { started_at, ...parameters } = analyticsContext;
      const elapsedSeconds = Math.max(
        0,
        Math.round((Date.now() - started_at) / 1000)
      );
      const latencyBucket =
        elapsedSeconds < 60
          ? 'lt_1m'
          : elapsedSeconds < 180
            ? '1_3m'
            : elapsedSeconds < 600
              ? '3_10m'
              : 'gte_10m';
      trackAnalyticsEvent(eventName, {
        ...parameters,
        latency_bucket: latencyBucket,
        ...details,
      });
      generationAnalyticsRef.current = null;
    },
    []
  );

  const pollTask = useCallback(
    async (id: string) => {
      if (
        generationStartedAt &&
        Date.now() - generationStartedAt > GENERATION_TIMEOUT
      ) {
        toast.error(t('errors.timeout'));
        finishTask();
        return true;
      }

      try {
        const response = await fetch('/api/ai/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: id }),
        });
        const payload = await response.json();
        if (!response.ok || payload.code !== 0) {
          throw new Error(payload.message || t('errors.query'));
        }

        const task = payload.data as BackendTask;
        const currentStatus = task.status as AITaskStatus;
        const taskInfo = parseJson(task.taskInfo);
        const videoUrls = extractVideoUrls(taskInfo);
        setTaskStatus(currentStatus);

        if (currentStatus === AITaskStatus.PENDING) {
          setProgress((value) => Math.max(value, 22));
          return false;
        }

        if (currentStatus === AITaskStatus.PROCESSING) {
          setProgress((value) => Math.min(Math.max(value + 6, 35), 88));
          return false;
        }

        if (currentStatus === AITaskStatus.SUCCESS) {
          if (videoUrls.length === 0) {
            trackGenerationOutcome('generate_failure', {
              failure_stage: 'empty_output',
            });
            toast.error(t('errors.empty_result'));
          } else {
            trackGenerationOutcome('generate_success', {
              output_count: videoUrls.length,
            });
            setGeneratedVideos(
              videoUrls.map((url, index) => ({
                id: `${task.id}-${index}`,
                url,
                model: task.model,
                prompt: task.prompt ?? undefined,
              }))
            );
          }
          setProgress(100);
          finishTask();
          await fetchUserCredits();
          return true;
        }

        if (currentStatus === AITaskStatus.FAILED) {
          trackGenerationOutcome('generate_failure', {
            failure_stage: 'provider_failed',
            refund_status: 'provider_failure_confirmed',
          });
          toast.error(taskInfo?.errorMessage || t('errors.failed'));
          setProgress(0);
          finishTask();
          await fetchUserCredits();
          return true;
        }

        return false;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t('errors.query');
        toast.error(message);
        finishTask();
        return true;
      }
    },
    [
      fetchUserCredits,
      finishTask,
      generationStartedAt,
      t,
      trackGenerationOutcome,
    ]
  );

  useEffect(() => {
    if (!taskId || !isGenerating) return;

    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      const completed = await pollTask(taskId);
      if (completed) cancelled = true;
    };

    void tick();
    const interval = window.setInterval(() => void tick(), POLL_INTERVAL);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [isGenerating, pollTask, taskId]);

  const handleGenerate = async () => {
    if (!user) {
      saveLoginDraft();
      setIsShowSignModal(true);
      return;
    }
    if (!canGenerate) {
      toast.error(
        requiresImage && referenceUrls.length === 0
          ? t('errors.reference')
          : t('errors.prompt')
      );
      return;
    }

    rememberAnalyticsEntryPage();
    trackAnalyticsEvent('generate_intent', {
      page_group: getAnalyticsPageGroup(),
      content_locale: locale,
      model,
      generation_mode: scene,
      resolution,
      duration_seconds: duration,
      aspect_ratio: aspectRatio,
      audio_enabled: supportsAudio && generateAudio,
      eligibility:
        remainingCredits < costCredits ? 'insufficient_credits' : 'eligible',
    });

    if (remainingCredits < costCredits) {
      toast.error(
        t('errors.credits_short', {
          cost: costCredits,
          balance: remainingCredits,
        }),
        {
          action: {
            label: t('errors.credits_action'),
            onClick: () => router.push('/pricing'),
          },
        }
      );
      return;
    }

    setLastSubmittedDraft(currentDraft());
    setIsGenerating(true);
    setTaskStatus(AITaskStatus.PENDING);
    setProgress(14);
    setGeneratedVideos([]);
    setGenerationStartedAt(Date.now());

    const analyticsContext: GenerationAnalyticsContext = {
      page_group: getAnalyticsPageGroup(),
      content_locale: locale,
      model,
      generation_mode: scene,
      resolution,
      duration_seconds: duration,
      aspect_ratio: aspectRatio,
      audio_enabled: supportsAudio && generateAudio,
      credits_charged: costCredits,
      started_at: Date.now(),
    };
    generationAnalyticsRef.current = analyticsContext;
    const { started_at, ...analyticsParameters } = analyticsContext;

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaType: AIMediaType.VIDEO,
          scene,
          model,
          prompt: prompt.trim(),
          options: {
            resolution,
            duration,
            aspect_ratio: aspectRatio,
            generate_audio: supportsAudio && generateAudio,
            ...(model === 'wan-2.7' && {
              negative_prompt: negativePrompt.trim(),
              prompt_extend: promptExtend,
            }),
            ...(requiresImage && { image_input: referenceUrls }),
          },
        }),
      });
      const payload = await response.json();
      if (!response.ok || payload.code !== 0) {
        throw new Error(payload.message || t('errors.start'));
      }

      if (!payload.data?.id) {
        throw new Error(t('errors.start'));
      }

      setTaskId(payload.data.id);
      setProgress(24);
      trackAnalyticsEvent('generate_start', analyticsParameters);
      await fetchUserCredits();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('errors.start');
      toast.error(message);
      trackGenerationOutcome('generate_failure', {
        failure_reason: 'request_failed',
      });
      setProgress(0);
      finishTask();
    }
  };

  const handleDownload = async (video: GeneratedVideo) => {
    try {
      setDownloadingId(video.id);
      const response = await fetch(
        `/api/proxy/file?url=${encodeURIComponent(video.url)}`
      );
      if (!response.ok) throw new Error(t('errors.download'));
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = `${model}-${video.id}.mp4`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 200);
    } catch {
      toast.error(t('errors.download'));
    } finally {
      setDownloadingId(null);
    }
  };

  const allSceneOptions: Array<{
    value: VideoScene;
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      value: 'text-to-video',
      label: t('tabs.text-to-video'),
      shortLabel: t('tabs.text-short'),
      icon: Clapperboard,
    },
    {
      value: 'image-to-video',
      label: t('tabs.image-to-video'),
      shortLabel: t('tabs.image-short'),
      icon: ImageIcon,
    },
    {
      value: 'reference-to-video',
      label: t('tabs.reference-to-video'),
      shortLabel: t('tabs.reference-short'),
      icon: Upload,
    },
  ];
  const sceneOptions = allSceneOptions.filter((option) =>
    modelConfig.scenes.includes(option.value)
  );
  const isHero = variant === 'hero';

  const billingSummary = starterEstimate && (
    <p className="border-director-rule-light text-director-paper-muted border-t px-4 py-3 text-xs leading-5 sm:px-5">
      {t('cost_estimate', {
        cost: starterEstimate.dollarsPerVideo.toFixed(2),
        payment: starterEstimate.payment.toFixed(2),
        count: starterEstimate.completeVideos,
      })}{' '}
      <Link
        href="/pricing#video-budget"
        className="text-director-orange-text font-semibold underline underline-offset-4"
      >
        {t('links.pricing')}
      </Link>
    </p>
  );

  return (
    <div
      id="seedance-generator"
      className={cn(
        'border-director-rule-light bg-director-paper text-director-paper-text w-full max-w-full min-w-0 scroll-mt-24 overflow-hidden rounded-lg border',
        variant === 'page' && 'mx-auto max-w-7xl',
        isHero && 'studio-workspace'
      )}
    >
      {!isHero && (
        <div className="border-director-rule-light flex min-h-13 min-w-0 items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
          <div className="flex min-w-0 shrink-0 items-center gap-3">
            <span className="bg-director-paper-text text-director-paper rounded-sm px-2 py-1 font-mono text-[10px] font-bold">
              TAKE 01
            </span>
            <span className="truncate text-sm font-bold">
              {modelConfig.label}
            </span>
          </div>
          <div className="text-director-paper-muted min-w-0 text-right text-xs">
            <span className="block truncate">
              {user
                ? t('credits_remaining', { credits: remainingCredits })
                : t('new_user_credits')}
            </span>
            <span className="text-director-orange-text mt-0.5 block font-mono text-[10px] font-bold tracking-[0.06em] uppercase">
              {t('generate_with_cost', { credits: costCredits })}
            </span>
          </div>
        </div>
      )}

      <div
        className={cn(
          'grid min-w-0',
          isHero
            ? generatedVideos[0] || isGenerating
              ? 'lg:grid-cols-2'
              : 'grid-cols-1'
            : 'lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.48fr)]'
        )}
      >
        <div className={cn('min-w-0 p-4 sm:p-6', isHero && 'studio-form')}>
          <div className={cn(isHero && 'studio-form-modes')}>
            <div className="mb-4">
              <span className="sr-only">{t('form.model')}</span>
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={isModelPickerOpen}
                onClick={() => setIsModelPickerOpen(true)}
                className="border-director-rule-light bg-director-paper-2 hover:bg-director-paper-3 focus-visible:outline-director-focus flex min-h-12 w-full items-center justify-between gap-4 rounded-md border px-3.5 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <strong
                      className={cn(
                        'text-sm',
                        isHero ? 'text-xs leading-tight' : 'truncate'
                      )}
                    >
                      {modelConfig.label}
                    </strong>
                    {modelConfig.badge && !isHero && (
                      <span className="border-director-orange/25 bg-director-orange/10 text-director-orange-ink border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.08em] uppercase">
                        {t(`badges.${modelConfig.badge}`)}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      'text-director-paper-muted mt-0.5 block truncate text-xs',
                      isHero && 'hidden'
                    )}
                  >
                    {modelConfig.family} ·{' '}
                    {t(`models.${modelConfig.uiKey}.summary`)}
                  </span>
                </span>
                <ChevronsUpDown className="text-director-paper-muted size-4 shrink-0" />
              </button>

              {isModelPickerOpen && (
                <VideoModelPicker
                  model={model}
                  open={isModelPickerOpen}
                  onOpenChange={setIsModelPickerOpen}
                  onSelect={handleModelChange}
                />
              )}
            </div>

            <div
              role="group"
              aria-label={t('workflow_label')}
              className={cn(
                'border-director-rule-light mb-4 grid border-b',
                sceneOptions.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
              )}
            >
              {sceneOptions.map((option) => {
                const Icon = option.icon;
                const active = scene === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setScene(option.value);
                      setReferenceItems([]);
                      setReferenceUrls([]);
                      setPresetPreviews([]);
                    }}
                    className={cn(
                      'focus-visible:outline-director-focus -mb-px flex min-h-12 items-center justify-center gap-2 border-b-2 px-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px]',
                      active
                        ? 'border-director-orange text-director-paper-text'
                        : 'text-director-paper-muted hover:text-director-paper-text border-transparent'
                    )}
                  >
                    <Icon className="size-3.5" />
                    <span className={isHero ? 'inline' : 'sm:hidden'}>
                      {option.shortLabel}
                    </span>
                    <span
                      className={cn(
                        'hidden min-w-0 truncate',
                        !isHero && 'sm:inline'
                      )}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {requiresImage && (
            <div className={cn('mb-5', isHero && 'studio-form-inputs')}>
              <ImageUploader
                key={uploaderVersion}
                defaultPreviews={presetPreviews}
                title={
                  scene === 'image-to-video'
                    ? t('form.start_frame')
                    : t('form.reference_images')
                }
                allowMultiple={true}
                maxImages={maxReferenceImages}
                maxSizeMB={maxSizeMB}
                onChange={handleReferencesChange}
                emptyHint={
                  scene === 'image-to-video'
                    ? t('form.start_frame_hint')
                    : t('form.reference_images_hint', {
                        count: maxReferenceImages,
                      })
                }
                tone="paper"
                labels={{
                  dropToUpload: t('form.upload_labels.drop_to_upload'),
                  upload: t('form.upload_labels.upload'),
                  maxFileSize: t('form.upload_labels.max_file_size', {
                    size: maxSizeMB,
                  }),
                  uploading: t('form.upload_labels.uploading'),
                  failed: t('form.upload_labels.failed'),
                  replaceImage: t('form.upload_labels.replace_image'),
                  removeImage: t('form.upload_labels.remove_image'),
                  referenceImageAlt: t(
                    'form.upload_labels.reference_image_alt'
                  ),
                }}
              />
              {hasUploadError && (
                <p className="mt-2 text-xs text-red-700">
                  {t('form.some_images_failed_to_upload')}
                </p>
              )}
            </div>
          )}

          <div className={cn('mb-5', isHero && 'studio-form-prompt')}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <label
                htmlFor="seedance-prompt"
                className="text-[11px] font-bold tracking-[0.12em] uppercase"
              >
                {t('form.shot_direction')}
              </label>
              <Link
                href="/seedance-2-5-prompt-guide"
                className="text-director-orange-ink decoration-director-orange focus-visible:outline-director-focus text-xs font-semibold underline decoration-2 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {t('form.prompt_guide')} ↗
              </Link>
            </div>
            <Textarea
              id="seedance-prompt"
              value={prompt}
              onChange={(event) => {
                setPrompt(event.target.value);
                if (event.target.value.trim() && !promptStartedRef.current) {
                  promptStartedRef.current = true;
                  trackAnalyticsEvent('prompt_started', {
                    page_group: getAnalyticsPageGroup(),
                    content_locale: locale,
                    model,
                  });
                }
              }}
              placeholder={t('form.prompt_placeholder')}
              className={cn(
                'border-director-rule-light text-director-paper-text placeholder:text-director-paper-muted focus-visible:border-director-focus focus-visible:ring-director-focus/20 resize-y rounded-md bg-transparent px-4 py-3 text-[15px] leading-6',
                isHero ? 'min-h-28 sm:min-h-32' : 'min-h-32'
              )}
            />
            <div className="text-director-paper-muted mt-1.5 flex justify-between text-[11px]">
              <span>{t('form.timecode_hint')}</span>
              <span
                className={cn(
                  promptLength > MAX_PROMPT_LENGTH && 'text-red-700'
                )}
              >
                {promptLength}/{MAX_PROMPT_LENGTH}
              </span>
            </div>
          </div>

          <div
            className={cn(
              'grid min-w-0 grid-cols-2 gap-3 [&>*]:min-w-0',
              isHero && 'studio-form-settings',
              showAspectRatio && 'grid-cols-3'
            )}
          >
            <NativeSelect
              label={t('form.resolution')}
              value={resolution}
              onChange={setResolution}
            >
              {modelConfig.resolutions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </NativeSelect>
            <NativeSelect
              label={t('form.duration')}
              value={String(duration)}
              onChange={(value) => setDuration(Number(value))}
            >
              {modelConfig.durations.map((value) => (
                <option key={value} value={value}>
                  {value}s
                </option>
              ))}
            </NativeSelect>
            {showAspectRatio && (
              <NativeSelect
                label={t('form.aspect_ratio')}
                value={aspectRatio}
                onChange={setAspectRatio}
              >
                {modelConfig.aspectRatios.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </NativeSelect>
            )}
          </div>

          {model === 'wan-2.7' && (
            <details
              className={cn(
                'group border-director-rule-light mt-4 border-t pt-3',
                isHero && 'studio-form-advanced'
              )}
            >
              <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold marker:content-none">
                <span className="flex items-center gap-2">
                  <Settings2 className="text-director-paper-muted size-4" />
                  {t('advanced.title')}
                </span>
                <ChevronDown className="text-director-paper-muted size-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="grid gap-3 pt-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <label className="block">
                  <span className="text-director-paper-muted mb-1.5 block text-[10px] font-bold tracking-[0.12em] uppercase">
                    {t('advanced.negative_prompt')}
                  </span>
                  <input
                    value={negativePrompt}
                    maxLength={500}
                    onChange={(event) => setNegativePrompt(event.target.value)}
                    placeholder={t('advanced.negative_prompt_placeholder')}
                    className="border-director-rule-light focus-visible:outline-director-focus h-11 w-full rounded-md border bg-transparent px-3 text-sm outline-2 outline-transparent"
                  />
                </label>
                <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={promptExtend}
                    onChange={(event) => setPromptExtend(event.target.checked)}
                    className="accent-director-orange size-4"
                  />
                  {t('advanced.prompt_extend')}
                </label>
              </div>
            </details>
          )}

          <div
            className={cn(
              'border-director-rule-light mt-4 flex flex-col gap-3 border-t pt-4',
              isHero && 'studio-form-submit'
            )}
          >
            <div className="max-w-md">
              {supportsAudio ? (
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={generateAudio}
                    onChange={(event) => setGenerateAudio(event.target.checked)}
                    className="accent-director-orange size-4"
                  />
                  {t('form.generate_audio')}
                </label>
              ) : (
                <p className="text-director-paper-muted text-sm font-semibold">
                  {t('form.audio_not_exposed')}
                </p>
              )}
              <p className="text-director-paper-muted mt-2 text-xs">
                {t('generation_cost', { credits: costCredits })}
              </p>
            </div>

            {isCheckSign ? (
              <Button disabled className="h-12 w-full rounded-md shadow-none">
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t('checking_account')}
              </Button>
            ) : user ? (
              <Button
                type="button"
                disabled={!canGenerate}
                onClick={handleGenerate}
                className="bg-director-orange text-director-orange-ink hover:bg-director-orange-hover focus-visible:outline-director-focus h-12 w-full rounded-md px-5 font-extrabold shadow-none focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Clapperboard className="mr-2 size-4" />
                )}
                {isGenerating
                  ? t('generating')
                  : t('generate_with_cost', { credits: costCredits })}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  if (canGenerate) {
                    rememberAnalyticsEntryPage();
                    trackAnalyticsEvent('generate_intent', {
                      page_group: getAnalyticsPageGroup(),
                      content_locale: locale,
                      model,
                      generation_mode: scene,
                      resolution,
                      duration_seconds: duration,
                      aspect_ratio: aspectRatio,
                      audio_enabled: supportsAudio && generateAudio,
                      eligibility: 'anonymous',
                    });
                  }
                  saveLoginDraft();
                  setIsShowSignModal(true);
                }}
                className="bg-director-orange text-director-orange-ink hover:bg-director-orange-hover focus-visible:outline-director-focus h-12 w-full rounded-md px-5 font-extrabold shadow-none focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {t('sign_in_to_generate')}
              </Button>
            )}
          </div>
          {isHero && (
            <div className="studio-form-billing text-director-paper-muted [&>p]:border-0 [&>p]:p-0">
              {billingSummary}
            </div>
          )}
        </div>

        <div
          aria-live={isGenerating || generatedVideos[0] ? 'polite' : 'off'}
          aria-busy={isGenerating}
          className={cn(
            'bg-director-carbon text-director-ink-text flex flex-col lg:min-h-full',
            isHero && !generatedVideos[0] && !isGenerating
              ? 'hidden'
              : 'min-h-[340px] p-4 sm:p-6'
          )}
        >
          <div
            className={cn(
              'text-director-ink-muted flex items-center justify-between text-[10px] font-bold tracking-[0.13em] uppercase',
              isHero && !generatedVideos[0] && !isGenerating && 'sr-only'
            )}
          >
            <span>
              {t(
                isHero && !generatedVideos[0] && !isGenerating
                  ? 'sample_monitor'
                  : 'output_monitor'
              )}
            </span>
            <span>{showAspectRatio ? aspectRatio : t('source_aspect')}</span>
          </div>

          <div
            className={cn(
              'flex flex-1 items-center justify-center overflow-hidden',
              !(isHero && !generatedVideos[0] && !isGenerating) && 'mt-4',
              !(isHero && !generatedVideos[0] && !isGenerating) &&
                'border-director-rule-dark bg-director-ink min-h-56 border'
            )}
          >
            {generatedVideos[0] ? (
              <video
                src={generatedVideos[0].url}
                controls
                playsInline
                preload="metadata"
                className="h-full max-h-[540px] w-full object-contain"
              />
            ) : isGenerating ? (
              <div className="w-full px-8 text-center">
                <Loader2 className="text-director-amber mx-auto size-8 animate-spin" />
                <p className="mt-4 text-sm font-bold">{statusLabel}</p>
                <Progress value={progress} className="mt-4 h-1.5" />
                <p className="text-director-ink-muted mt-3 text-xs leading-5">
                  {t('generation_wait')}
                </p>
              </div>
            ) : emptyPreview ? (
              <figure className="flex h-full min-h-56 w-full flex-col overflow-hidden">
                <div className="relative min-h-44 flex-1">
                  {emptyPreview.video ? (
                    <video
                      src={emptyPreview.video}
                      poster={emptyPreview.src}
                      controls
                      playsInline
                      preload="none"
                      aria-label={emptyPreview.alt}
                      className="aspect-video h-full w-full object-contain"
                    />
                  ) : (
                    <Image
                      src={emptyPreview.src}
                      alt={emptyPreview.alt}
                      fill
                      sizes={
                        isHero
                          ? '(min-width: 1280px) 34vw, (min-width: 1024px) 38vw, 100vw'
                          : '(min-width: 1024px) 24vw, 100vw'
                      }
                      className="object-cover"
                    />
                  )}
                </div>
                <figcaption className="border-director-rule-dark bg-director-ink border-t p-4 text-left">
                  <span className="text-director-amber font-mono text-[9px] font-bold tracking-[0.08em] uppercase">
                    {emptyPreview.label}
                  </span>
                  <p className="text-director-ink-muted mt-2 max-w-sm text-xs leading-5">
                    {emptyPreview.caption}
                  </p>
                </figcaption>
              </figure>
            ) : (
              <div className="max-w-64 px-5 text-center">
                <span className="border-director-amber/30 bg-director-amber/8 mx-auto flex size-11 items-center justify-center border">
                  <Clapperboard className="text-director-amber size-6" />
                </span>
                <p className="mt-4 text-sm font-bold">{modelConfig.label}</p>
                <p className="text-director-ink-muted mt-2 text-xs leading-5">
                  {t('empty_monitor')}
                </p>
                <p className="text-director-ink-text mt-3 font-mono text-[10px] tracking-[0.08em] uppercase">
                  {resolution} · {duration}s ·{' '}
                  {showAspectRatio ? aspectRatio : t('source_aspect')}
                </p>
              </div>
            )}
          </div>

          {(!isHero || generatedVideos[0] || isGenerating) && (
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-xs">
              <div>
                <span className="block font-bold">
                  {resolution} · {duration}s
                </span>
                <span className="text-director-ink-muted mt-1 block">
                  {t('launch_output')}
                </span>
              </div>
              <div>
                <span className="block font-bold">
                  {supportsAudio
                    ? generateAudio
                      ? t('audio_on')
                      : t('audio_off')
                    : t('audio_model_default')}
                </span>
                <span className="text-director-ink-muted mt-1 block">
                  {t('model_audio')}
                </span>
              </div>
              <div className="col-span-2 border-t border-white/10 pt-3">
                <span className="text-director-amber font-mono text-[10px] tracking-[0.1em] uppercase">
                  {t('generate_with_cost', { credits: costCredits })}
                </span>
              </div>
            </div>
          )}

          {generatedVideos[0] && (
            <>
              {lastSubmittedDraft && (
                <button
                  type="button"
                  className="mt-4 min-h-11 rounded-md border border-white/30 px-3 text-sm font-semibold"
                  onClick={() => {
                    applyDraft(lastSubmittedDraft);
                    document.getElementById('seedance-prompt')?.focus();
                    trackAnalyticsEvent('settings_reused', {
                      page_group: getAnalyticsPageGroup(),
                      content_locale: locale,
                      model: lastSubmittedDraft.model,
                    });
                  }}
                >
                  {t('reuse_settings')}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDownload(generatedVideos[0])}
                className="focus-visible:outline-director-amber mt-4 flex h-11 items-center justify-center gap-2 rounded-md border border-white/15 text-sm font-bold transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {downloadingId === generatedVideos[0].id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                {t('download')}
              </button>

              <nav
                aria-label={t('next_after_generation.label')}
                className="border-director-rule-dark mt-4 border-t pt-4"
              >
                <p className="text-director-amber font-mono text-[10px] font-bold tracking-[0.1em] uppercase">
                  {t('next_after_generation.label')}
                </p>
                <div className="mt-3 grid gap-2">
                  {[
                    {
                      key: 'guide',
                      href: model.startsWith('seedance-')
                        ? '/seedance-2-5-prompt-guide'
                        : '/#current-models',
                    },
                    {
                      key: 'compare',
                      href: '/seedance-2-5-vs-2-0',
                    },
                    { key: 'pricing', href: '/pricing' },
                  ].map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      className="focus-visible:outline-director-amber flex min-h-10 items-center justify-between gap-3 border border-white/12 px-3 py-2 text-xs font-semibold transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      <span>{t(`next_after_generation.${item.key}`)}</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  ))}
                </div>
              </nav>
            </>
          )}
        </div>
      </div>

      {!isHero && billingSummary}
      {!isHero && (
        <div className="border-director-rule-light text-director-paper-muted flex flex-col gap-2 border-t px-4 py-3 text-[11px] leading-5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <span className="flex items-center gap-2">
            <Check className="text-director-sage size-3.5" />
            {t('refund_note')}
          </span>
          <span>{t('independent_note')}</span>
        </div>
      )}
    </div>
  );
}

export function VideoGenerator(props: VideoGeneratorProps) {
  const t = useTranslations('ai.video.generator');

  return (
    <section
      id="create"
      className="bg-director-ink text-director-ink-text px-4 pt-24 pb-32 md:px-8 md:pt-28 md:pb-40"
    >
      <div className="mx-auto mb-10 max-w-7xl">
        <span className="text-director-orange text-xs font-bold tracking-[0.14em] uppercase">
          {t('page_eyebrow')}
        </span>
        <h1 className="mt-4 max-w-[16ch] text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.94] font-semibold tracking-[-0.035em]">
          {t('page_title')}
        </h1>
        <p className="text-director-ink-muted mt-5 max-w-2xl text-base leading-7 sm:text-lg">
          {t('page_description')}
        </p>
      </div>
      <SeedanceGeneratorPanel {...props} variant="page" />
      <nav
        aria-labelledby="generator-next-step-title"
        className="border-director-rule-dark mx-auto mt-8 max-w-7xl border-t pt-6"
      >
        <p className="text-director-orange font-mono text-[10px] font-bold tracking-[0.14em] uppercase">
          {t('links_eyebrow')}
        </p>
        <h2
          id="generator-next-step-title"
          className="mt-2 text-2xl font-semibold tracking-tight text-white"
        >
          {t('links_title')}
        </h2>
        <div className="mt-5 grid gap-px border border-white/12 bg-white/12 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { key: 'free', href: '/seedance-2-5-free' },
            { key: 'compare', href: '/seedance-2-5-vs-2-0' },
            { key: 'prompts', href: '/seedance-2-5-prompt-guide' },
            { key: 'api', href: '/seedance-2-5-api' },
            { key: 'pricing', href: '/pricing' },
          ].map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="focus-visible:outline-director-focus bg-director-ink hover:bg-director-carbon min-w-0 p-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <strong className="block text-sm text-white">
                {t(`links.${item.key}`)}
              </strong>
              <span className="text-director-ink-muted mt-2 block text-xs leading-5">
                {t(`link_descriptions.${item.key}`)}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </section>
  );
}
