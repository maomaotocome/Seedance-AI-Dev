import { getSignUser } from '@/shared/models/user'
import { getVideo } from '@/shared/services/video'
import { redirect } from 'next/navigation'
import VideoGenerator from './video-generator'
import { GeneratedVideo } from '@/shared/components/blocks/video-card'

interface PageProps {
  searchParams: Promise<{
    id?: string
    type?: string
  }>
}

export default async function TextToVideoPage({ searchParams }: PageProps) {
  const user = await getSignUser()

  // 如果用户未登录，重定向到首页
  if (!user?.id) {
    redirect('/sign-in')
  }

  // Await searchParams before using it
  const params = await searchParams
  let initialVideo: GeneratedVideo | null = null
  const isNewGeneration = params.type === 'new'

  // 如果有视频ID，获取视频详情
  if (params.id) {
    try {
      console.log(`Loading video details for ID: ${params.id}`)

      const result = await getVideo(params.id)

      if (result.success && result.data) {
        // 检查视频是否属于当前用户
        if (result.data.userId !== user.id) {
          console.warn(
            `Access denied: User ${user.id} tried to access video ${params.id} owned by ${result.data.userId}`
          )
        } else {
          // 转换数据格式以匹配前端期望的接口
          const parsedParameters = result.data.parameters
            ? typeof result.data.parameters === 'string'
              ? JSON.parse(result.data.parameters)
              : result.data.parameters
            : {}

          initialVideo = {
            id: result.data.id,
            prompt: result.data.prompt,
            model: result.data.model,
            parameters: parsedParameters,
            videoUrl:
              result.data.videoUrl ||
              result.data.originalVideoUrl ||
              undefined,
            thumbnailUrl: result.data.firstFrameImageUrl || undefined,
            startImageUrl: result.data.startImageUrl || undefined,
            status: result.data.status as
              | 'pending'
              | 'generating'
              | 'uploading'
              | 'completed'
              | 'failed',
            createdAt: result.data.createdAt
              ? new Date(result.data.createdAt)
              : new Date(),
          }

          console.log(`Successfully loaded video: ${result.data.id}`)
        }
      } else {
        console.warn(`Video not found: ${params.id}`)
      }
    } catch (error) {
      console.error('Error loading video details:', error)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <VideoGenerator
        initialVideo={initialVideo}
        isNewGeneration={isNewGeneration}
      />
    </div>
  )
}
