'use client';

import { useEffect, useRef, useState } from 'react';
import { WandSparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { GeneratedVideo } from '@/shared/components/blocks/video-card';
import { formatApiErrorMessage } from '@/shared/lib/utils';
import {
  clearVideoSession,
  loadVideoSession,
  saveVideoSession,
} from '@/shared/lib/video-session';

import { useUrlParams } from './hooks/useUrlParams';
import { useVideoPolling } from './hooks/useVideoPolling';
import VideoGenerationForm from './video-generation-form';
import VideoPreview from './video-preview';

interface TextToVideoGeneratorProps {
  initialVideo?: GeneratedVideo | null;
  isNewGeneration?: boolean;
}

export default function TextToVideoGenerator({
  initialVideo,
  isNewGeneration = false,
}: TextToVideoGeneratorProps) {
  const t = useTranslations('video.hero_input');
  const [currentVideo, setCurrentVideo] = useState<GeneratedVideo | null>(
    initialVideo || null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const hasAutoTriggered = useRef(false);
  const hasRecoveredSession = useRef(false);
  const [formPrompt, setFormPrompt] = useState('');

  const { removeParam } = useUrlParams();

  const mapVideoData = (
    data: Omit<
      Partial<GeneratedVideo>,
      'status' | 'parameters' | 'createdAt'
    > & {
      id?: string;
      prompt?: string;
      model?: string;
      parameters?: Record<string, any> | string;
      status?: string;
      videoUrl?: string;
      output?: string;
      originalVideoUrl?: string;
      thumbnailUrl?: string;
      startImageUrl?: string;
      createdAt?: string | Date;
    },
    fallback: GeneratedVideo
  ): GeneratedVideo => ({
    ...fallback,
    id: data.id || fallback.id,
    prompt: data.prompt || fallback.prompt,
    model: data.model || fallback.model,
    parameters:
      typeof data.parameters === 'string'
        ? JSON.parse(data.parameters)
        : data.parameters || fallback.parameters,
    videoUrl:
      data.output ||
      data.videoUrl ||
      data.originalVideoUrl ||
      fallback.videoUrl,
    thumbnailUrl: data.thumbnailUrl || fallback.thumbnailUrl,
    startImageUrl: data.startImageUrl || fallback.startImageUrl,
    status:
      ((data.status === 'succeeded' ? 'completed' : data.status) as
        | GeneratedVideo['status']
        | undefined) || fallback.status,
    createdAt: data.createdAt ? new Date(data.createdAt) : fallback.createdAt,
  });

  // 使用轮询 hook
  const { startPolling, stopPolling } = useVideoPolling({
    onCompleted: (completedVideo) => {
      setCurrentVideo(completedVideo);
      setIsGenerating(false);
      setGenerationProgress('');
    },
    onFailed: (error) => {
      setCurrentVideo((prev) => (prev ? { ...prev, status: 'failed' } : null));
      setIsGenerating(false);
      setGenerationProgress('');
    },
    onProgressUpdate: (message) => {
      setGenerationProgress(message);
    },
  });

  // 当initialVideo变化时更新currentVideo
  useEffect(() => {
    if (initialVideo) {
      setCurrentVideo(initialVideo);
    }
  }, [initialVideo]);

  useEffect(() => {
    if (!currentVideo) {
      return;
    }

    if (currentVideo.status === 'failed') {
      clearVideoSession();
      return;
    }

    saveVideoSession(currentVideo.id, currentVideo.status);
  }, [currentVideo]);

  // Clear formPrompt after it's been used
  useEffect(() => {
    if (formPrompt) {
      // Clear after a short delay to ensure the form has processed it
      const timer = setTimeout(() => {
        setFormPrompt('');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [formPrompt]);

  useEffect(() => {
    if (initialVideo || hasRecoveredSession.current) {
      return;
    }

    hasRecoveredSession.current = true;
    const storedSession = loadVideoSession();

    if (!storedSession?.id) {
      return;
    }

    let cancelled = false;

    const restoreVideo = async () => {
      try {
        const response = await fetch('/api/video/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ videoId: storedSession.id }),
        });

        const result = await response.json();

        if (!response.ok || !result.success || !result.data) {
          clearVideoSession();
          return;
        }

        const restoredVideo = mapVideoData(result.data, {
          id: storedSession.id,
          prompt: '',
          model: '',
          parameters: {},
          status: 'pending',
          createdAt: new Date(),
        });

        if (cancelled) {
          return;
        }

        if (restoredVideo.status === 'failed') {
          setCurrentVideo(restoredVideo);
          clearVideoSession();
          return;
        }

        setCurrentVideo(restoredVideo);

        if (
          restoredVideo.status === 'pending' ||
          restoredVideo.status === 'generating' ||
          restoredVideo.status === 'uploading'
        ) {
          setIsGenerating(true);
          setGenerationProgress(
            restoredVideo.status === 'uploading'
              ? 'Finalizing your video...'
              : 'Restoring your last generation...'
          );
          startPolling(restoredVideo.id);
        }
      } catch (error) {
        console.error('Failed to restore last video session:', error);
      }
    };

    restoreVideo();

    return () => {
      cancelled = true;
    };
  }, [initialVideo, startPolling]);

  // 智能状态检测和处理
  useEffect(() => {
    if (initialVideo && !hasAutoTriggered.current) {
      hasAutoTriggered.current = true;

      // 检查是否需要触发新生成
      const shouldGenerate =
        isNewGeneration || initialVideo.status === 'pending';

      // 立即移除 type=new 参数（如果存在）
      if (isNewGeneration) {
        removeParam('type');
      }

      // 根据视频状态决定行为
      console.log('Processing initial video:', {
        id: initialVideo.id,
        status: initialVideo.status,
        isNewGeneration,
        shouldGenerate,
      });

      switch (initialVideo.status) {
        case 'generating':
        case 'uploading':
          console.log(
            'Video is generating, starting polling...',
            initialVideo.id
          );
          setCurrentVideo(initialVideo);
          setIsGenerating(true);
          startPolling(initialVideo.id);
          break;

        case 'completed':
          console.log('Video is already completed:', initialVideo.id);
          setCurrentVideo(initialVideo);
          break;

        case 'failed':
          console.log('Video generation failed:', initialVideo.id);
          setCurrentVideo(initialVideo);
          break;

        case 'pending':
        default:
          if (shouldGenerate) {
            console.log('Starting new video generation:', initialVideo.id);
            handleVideoGeneration(
              {
                prompt: initialVideo.prompt,
                model: initialVideo.model,
                parameters: initialVideo.parameters,
              },
              initialVideo.id
            );
          } else {
            console.log(
              'Setting initial video without generation:',
              initialVideo.id
            );
            setCurrentVideo(initialVideo);
          }
      }
    }
  }, [initialVideo, isNewGeneration]);

  const handleVideoGeneration = async (
    formData: {
      prompt: string;
      model: string;
      parameters: Record<string, any>;
      startImage?: File;
    },
    existingVideoId?: string // 可选的现有视频ID
  ) => {
    setIsGenerating(true);
    let shouldKeepGenerating = false;

    const newVideo: GeneratedVideo = {
      id: existingVideoId || Date.now().toString(), // 使用现有ID或生成新ID
      prompt: formData.prompt,
      model: formData.model,
      parameters: formData.parameters,
      status: 'generating',
      videoUrl: undefined,
      thumbnailUrl: undefined,
      createdAt: new Date(),
    };

    setCurrentVideo(newVideo);

    try {
      console.log('Starting video generation with:', formData);
      setGenerationProgress('Starting video generation...');

      // Call the video generation API (now with polling built-in)
      let response: Response;

      if (formData.startImage) {
        // 有图片时使用 FormData
        const apiFormData = new FormData();
        apiFormData.append('prompt', formData.prompt);
        apiFormData.append('model', formData.model);
        apiFormData.append('parameters', JSON.stringify(formData.parameters));
        apiFormData.append('startImage', formData.startImage);
        if (existingVideoId) {
          apiFormData.append('videoId', existingVideoId);
        }

        response = await fetch('/api/video/ai', {
          method: 'POST',
          body: apiFormData,
        });
      } else {
        // 无图片时使用 JSON
        response = await fetch('/api/video/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: formData.prompt,
            model: formData.model,
            parameters: formData.parameters,
            ...(existingVideoId && { videoId: existingVideoId }),
          }),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          formatApiErrorMessage(result, 'Failed to generate video')
        );
      }

      if (!result.success) {
        throw new Error(
          formatApiErrorMessage(result, 'Video generation failed')
        );
      }

      console.log('Video generation result:', result.data);
      const resolvedVideo = mapVideoData(result.data, newVideo);

      if (
        resolvedVideo.status === 'pending' ||
        resolvedVideo.status === 'generating' ||
        resolvedVideo.status === 'uploading'
      ) {
        shouldKeepGenerating = true;
        setCurrentVideo(resolvedVideo);
        setGenerationProgress(
          resolvedVideo.status === 'uploading'
            ? 'Finalizing your video...'
            : 'Video is being generated...'
        );
        startPolling(resolvedVideo.id);
        return;
      }

      if (resolvedVideo.status === 'completed' && resolvedVideo.videoUrl) {
        setGenerationProgress('Video generation completed!');
        const completedVideo: GeneratedVideo = {
          ...resolvedVideo,
          status: 'completed',
          thumbnailUrl: resolvedVideo.thumbnailUrl || '/imgs/placeholder.svg',
        };

        console.log('Setting completed video:', {
          id: completedVideo.id,
          status: completedVideo.status,
          videoUrl: completedVideo.videoUrl,
          hasVideoUrl: !!completedVideo.videoUrl,
        });

        setCurrentVideo(completedVideo);

        console.log('Video generation completed:', completedVideo.videoUrl);
        console.log('Current video updated to completed state');
      } else {
        // This should not happen with the new polling API, but handle it just in case
        throw new Error(
          result.data.error || `Unexpected status: ${result.data.status}`
        );
      }
    } catch (error) {
      console.error('Video generation error:', error);

      const failedVideo: GeneratedVideo = {
        ...newVideo,
        status: 'failed',
      };

      setCurrentVideo(failedVideo);

      // You might want to show a toast notification here
      toast.error(
        error instanceof Error ? error.message : 'Video generation failed'
      );
    } finally {
      if (!shouldKeepGenerating) {
        setIsGenerating(false);
        setGenerationProgress('');
      }
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setFormPrompt(prompt);
  };

  // 组件卸载时清理轮询（由 useVideoPolling hook 处理）
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-2 text-lg font-bold text-white">
        <WandSparkles className="mr-2 inline h-4 w-4" />
        {t('magic_title')}
      </div>

      <div className="grid h-[calc(100vh-100px)] grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left Column - Generation Form */}
        <VideoGenerationForm
          onGenerate={handleVideoGeneration}
          isGenerating={isGenerating}
          initialData={
            currentVideo
              ? {
                  prompt: currentVideo.prompt,
                  model: currentVideo.model,
                  parameters: currentVideo.parameters,
                  startImageUrl: currentVideo.startImageUrl,
                }
              : formPrompt
                ? {
                    prompt: formPrompt,
                  }
                : undefined
          }
        />

        {/* Right Column - Preview */}
        <VideoPreview
          video={currentVideo}
          isGenerating={isGenerating}
          generationProgress={generationProgress}
          onPromptSelect={handlePromptSelect}
        />
      </div>

      {/* Video Gallery */}
      {/* <div className="mt-4">
        <VideoGallery
          onVideoSelect={setCurrentVideo}
          refreshTrigger={refreshTrigger}
        />
      </div> */}
    </div>
  );
}
