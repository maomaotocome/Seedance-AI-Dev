'use client';

import { WandSparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useUrlParams } from '@/app/[locale]/(landing)/video/hooks/useUrlParams';
import { useVideoPolling } from '@/app/[locale]/(landing)/video/hooks/useVideoPolling';

import { GeneratedVideo } from './video-card';
import VideoGallery from './video-gallery';
import VideoGenerationForm from './video-generation-form';
import VideoPreview from './video-preview';
import {
  clearVideoSession,
  loadVideoSession,
  saveVideoSession,
} from '@/shared/lib/video-session';
import { formatApiErrorMessage } from '@/shared/lib/utils';

interface VideoGeneratorProps {
  initialVideo?: GeneratedVideo | null;
  isNewGeneration?: boolean;
}

export default function VideoGenerator({
  initialVideo,
  isNewGeneration = false,
}: VideoGeneratorProps) {
  const [currentVideo, setCurrentVideo] = useState<GeneratedVideo | null>(
    initialVideo || null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const hasAutoTriggered = useRef(false);
  const hasRecoveredSession = useRef(false);

  const { removeParam } = useUrlParams();

  const mapVideoData = (
    data: Omit<Partial<GeneratedVideo>, 'status' | 'parameters' | 'createdAt'> & {
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

  const { startPolling, stopPolling } = useVideoPolling({
    onCompleted: (completedVideo) => {
      setCurrentVideo(completedVideo);
      setIsGenerating(false);
      setGenerationProgress('');
      toast.success('Video generation completed!');
    },
    onFailed: () => {
      setCurrentVideo((prev) => (prev ? { ...prev, status: 'failed' } : null));
      setIsGenerating(false);
      setGenerationProgress('');
    },
    onProgressUpdate: (message) => {
      setGenerationProgress(message);
    },
  });

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

  useEffect(() => {
    if (initialVideo && !hasAutoTriggered.current) {
      hasAutoTriggered.current = true;

      if (isNewGeneration) {
        removeParam('type');
      }

      if (
        initialVideo.status === 'generating' ||
        initialVideo.status === 'uploading'
      ) {
        setIsGenerating(true);
        startPolling(initialVideo.id);
      } else if (initialVideo.status === 'pending' && isNewGeneration) {
        handleVideoGeneration({
          prompt: initialVideo.prompt,
          model: initialVideo.model,
          parameters: initialVideo.parameters,
        }, initialVideo.id);
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
    existingVideoId?: string
  ) => {
    setIsGenerating(true);
    let shouldKeepGenerating = false;

    const newVideo: GeneratedVideo = {
      id: existingVideoId || Date.now().toString(),
      prompt: formData.prompt,
      model: formData.model,
      parameters: formData.parameters,
      status: 'generating',
      createdAt: new Date(),
    };

    setCurrentVideo(newVideo);

    try {
      let response: Response;

      if (formData.startImage) {
        const apiFormData = new FormData();
        apiFormData.append('prompt', formData.prompt);
        apiFormData.append('model', formData.model);
        apiFormData.append('parameters', JSON.stringify(formData.parameters));
        apiFormData.append('startImage', formData.startImage);
        if (existingVideoId) apiFormData.append('videoId', existingVideoId);

        response = await fetch('/api/video/ai', {
          method: 'POST',
          body: apiFormData,
        });
      } else {
        response = await fetch('/api/video/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: formData.prompt,
            model: formData.model,
            parameters: formData.parameters,
            ...(existingVideoId && { videoId: existingVideoId }),
          }),
        });
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          formatApiErrorMessage(result, 'Failed to generate video')
        );
      }

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
        setCurrentVideo(resolvedVideo);
        setGenerationProgress('');
        setIsGenerating(false);
        return;
      }

      throw new Error(`Unexpected status: ${result.data.status}`);
    } catch (error) {
      console.error('Video generation error:', error);
      setCurrentVideo((prev) => prev ? { ...prev, status: 'failed' } : null);
      toast.error(error instanceof Error ? error.message : 'Generation failed');
      setIsGenerating(false);
      setGenerationProgress('');
    } finally {
      if (!shouldKeepGenerating) {
        setIsGenerating(false);
      }
    }
  };

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-8">
      <div className="flex items-center gap-2 text-xl font-bold text-white">
        <WandSparkles className="w-6 h-6 text-purple-400" />
        AI Video Generator
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px]">
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
              : undefined
          }
        />

        <VideoPreview
          video={currentVideo}
          isGenerating={isGenerating}
          generationProgress={generationProgress}
        />
      </div>

      <VideoGallery onVideoSelect={setCurrentVideo} />
    </div>
  );
}
