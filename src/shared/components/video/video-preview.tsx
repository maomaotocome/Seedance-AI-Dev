'use client';

import { Download, ExternalLink, Play } from 'lucide-react';

import { cn, downloadVideo } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';

import { GeneratedVideo } from './video-card';

interface VideoPreviewProps {
  video: GeneratedVideo | null;
  isGenerating: boolean;
  generationProgress?: string;
  onPromptSelect?: (prompt: string) => void;
}

export default function VideoPreview({
  video,
  isGenerating,
  generationProgress,
}: VideoPreviewProps) {
  const handleDownload = async () => {
    if (video?.videoUrl) {
      try {
        const timestamp = new Date(video.createdAt).toISOString().slice(0, 10);
        const videoName = `${video.model}-${timestamp}-${video.id.slice(0, 8)}`;
        await downloadVideo(videoName, video.videoUrl);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  const handleOpenDirect = () => {
    if (video?.videoUrl) {
      window.open(video.videoUrl, '_blank');
    }
  };

  return (
    <div className="h-full space-y-6 overflow-x-hidden overflow-y-auto scrollbar-hide backdrop-blur-xl bg-black/20 dark:bg-white/10 border border-white/20 rounded-2xl px-6 py-4 shadow-2xl">
      {video || isGenerating ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Generated Video</h3>
            {video?.status === 'completed' && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={handleOpenDirect}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Direct
                </Button>
              </div>
            )}
          </div>

          <div className="aspect-video bg-black rounded-xl overflow-hidden relative flex items-center justify-center">
            {video?.status === 'failed' ? (
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400 text-2xl">
                  ⚠
                </div>
                <p className="text-red-400 text-lg font-medium">Generation failed</p>
                <p className="text-white/60 text-sm">Please try again with a different prompt</p>
              </div>
            ) : isGenerating ||
              video?.status === 'generating' ||
              video?.status === 'uploading' ||
              video?.status === 'pending' ? (
              <div className="text-center p-4">
                <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white text-lg font-medium">Generating your video...</p>
                <p className="text-white/60 text-sm">{generationProgress || 'This may take a few moments'}</p>
              </div>
            ) : video?.status === 'completed' && video.videoUrl ? (
              <video
                key={video.videoUrl}
                className="w-full h-full object-contain"
                controls
                poster={video.thumbnailUrl}
                playsInline
              >
                <source src={video.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="text-center">
                 <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-white/60" />
                  </div>
                  <p className="text-white/60">Your video will appear here</p>
              </div>
            )}
          </div>

          {video && (
            <div className="mt-4 space-y-2">
              <p className="text-white/80 text-sm line-clamp-2">{video.prompt}</p>
              <div className="flex items-center gap-4 text-white/60 text-xs">
                <span>Model: {video.model}</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-center p-12">
          <Play className="w-16 h-16 text-white/10 mb-6" />
          <h3 className="text-2xl font-bold text-white mb-2">Ready to create?</h3>
          <p className="text-white/60">Enter a prompt on the left to start generating your AI video.</p>
        </div>
      )}
    </div>
  );
}
