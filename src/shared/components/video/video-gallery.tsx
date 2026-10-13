'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/shared/components/ui/button';

import VideoCard, { GeneratedVideo } from './video-card';

interface VideoGalleryProps {
  onVideoSelect?: (video: GeneratedVideo) => void;
}

export default function VideoGallery({ onVideoSelect }: VideoGalleryProps) {
  const t = useTranslations('video.text_to_video.gallery');
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchVideos = async (pageToFetch: number) => {
    try {
      if (pageToFetch === 1) setLoading(true);
      
      const response = await fetch('/api/video/my-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: pageToFetch, limit: 12 }),
      });

      const result = await response.json();
      if (result.success && result.data) {
        if (pageToFetch === 1) {
          setVideos(result.data.videos);
        } else {
          setVideos((prev) => [...prev, ...result.data.videos]);
        }
        setHasMore(result.data.hasNextPage);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(1);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchVideos(nextPage);
  };

  const handleVideoDeleted = (videoId: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
  };

  if (loading && page === 1) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
        <h3 className="text-xl font-medium text-white mb-2">{t('empty_title')}</h3>
        <p className="text-white/60">{t('empty_subtitle')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{t('title')}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onVideoSelect={onVideoSelect}
            onVideoDeleted={handleVideoDeleted}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            className="text-white border-white/20 hover:bg-white/10"
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
