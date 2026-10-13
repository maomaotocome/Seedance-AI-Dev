import { headers } from 'next/headers';

import { getAuth } from '@/core/auth';
import { redirect } from '@/core/i18n/navigation';
import { GeneratedVideo } from '@/shared/components/video/video-card';
import VideoGenerator from '@/shared/components/video/video-generator';
import { getVideo } from '@/shared/services/video';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    id?: string;
    type?: string;
  }>;
}

export default async function TextToVideoPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id;

  if (!userId) {
    redirect({ href: '/sign-in?callbackUrl=/video', locale });
  }

  const query = await searchParams;
  let initialVideo: GeneratedVideo | null = null;
  const isNewGeneration = query.type === 'new';

  if (query.id) {
    try {
      const result = await getVideo(query.id);

      if (result.success && result.data) {
        if (result.data.userId === userId) {
          const parsedParameters =
            typeof result.data.parameters === 'string'
              ? JSON.parse(result.data.parameters)
              : result.data.parameters || {};

          initialVideo = {
            id: result.data.id,
            prompt: result.data.prompt,
            model: result.data.model,
            parameters: parsedParameters,
            videoUrl:
              result.data.videoUrl || result.data.originalVideoUrl || undefined,
            thumbnailUrl: result.data.firstFrameImageUrl || undefined,
            startImageUrl: result.data.startImageUrl || undefined,
            status: result.data.status as any,
            createdAt: result.data.createdAt
              ? new Date(result.data.createdAt)
              : new Date(),
          };
        }
      }
    } catch (error) {
      console.error('Error loading video details:', error);
    }
  }

  return (
    <div className="container mx-auto px-4 pt-28 pb-10 lg:pt-32">
      <VideoGenerator
        initialVideo={initialVideo}
        isNewGeneration={isNewGeneration}
      />
    </div>
  );
}
