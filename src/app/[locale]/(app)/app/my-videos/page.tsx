'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/core/auth/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Video, ChevronLeft, ChevronRight } from 'lucide-react'
import VideoCard, {
  GeneratedVideo,
  GeneratedVideoStatus,
} from '@/shared/components/blocks/video-card'
import { Button } from '@/shared/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'

interface MyVideosResponse {
  videos: GeneratedVideo[]
  totalCount: number
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export default function MyVideosPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [videos, setVideos] = useState<GeneratedVideo[]>([])
  const [totalVideos, setTotalVideos] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPrevPage, setHasPrevPage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  const videosPerPage = 8

  // 重定向未登录用户
  useEffect(() => {
    if (isPending) return // 还在加载中
    if (!session) {
      router.push('/sign-in')
      return
    }
  }, [isPending, session, router])

  // 获取视频数据
  const fetchVideos = async (page: number = currentPage) => {
    if (!session?.user) return

    try {
      setLoading(true)
      setError(null)

      console.log(`Loading videos for page: ${page}`)

      const response = await fetch('/api/video/my-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page,
          limit: videosPerPage,
        }),
      })

      const result = await response.json()

      if (!response.ok || result.code !== 0) {
        throw new Error(result.message || 'Failed to load videos')
      }

      const data: MyVideosResponse = result.data
      setVideos(data.videos)
      setTotalVideos(data.totalCount)
      setTotalPages(data.totalPages)
      setHasNextPage(data.hasNextPage)
      setHasPrevPage(data.hasPrevPage)

      console.log(
        `Successfully loaded ${data.videos.length} videos out of ${data.totalCount} total`
      )
    } catch (error) {
      console.error('Error loading videos:', error)
      setError(error instanceof Error ? error.message : 'Failed to load videos')
      toast.error('Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  // 初始加载和页面变化时重新加载
  useEffect(() => {
    if (session?.user) {
      fetchVideos(currentPage)
    }
  }, [session, currentPage])

  // 处理视频删除成功后的回调
  const handleVideoDeleted = (videoId: string) => {
    // 从当前列表中移除被删除的视频
    setVideos((prev) => prev.filter((video) => video.id !== videoId))
    setTotalVideos((prev) => prev - 1)

    // 如果当前页面没有视频了，且不是第一页，则跳转到上一页
    const remainingVideos = videos.filter(
      (video) => video.id !== videoId
    ).length
    if (remainingVideos === 0 && currentPage > 1) {
      router.push(`/app/my-videos?page=${currentPage - 1}`)
    } else {
      // 重新计算分页信息
      const newTotalVideos = totalVideos - 1
      const newTotalPages = Math.ceil(newTotalVideos / videosPerPage)
      setTotalPages(newTotalPages)
      setHasNextPage(currentPage < newTotalPages)
      setHasPrevPage(currentPage > 1)
    }
  }

  // 如果还在加载认证状态，显示加载中
  if (isPending) {
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Video className="w-8 h-8 text-white/60" />
            </div>
            <p className="text-white/80 text-lg font-medium">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // 如果用户未登录，不渲染内容（会被重定向）
  if (!session?.user) {
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="text-lg font-bold text-white mb-2">
            <Video className="w-4 h-4 inline mr-2" />
            My Videos
          </div>
          <p className="text-white/60 text-sm">
            Manage and view all your generated videos
            {!error && totalVideos > 0 && (
              <span className="ml-2">({totalVideos} total)</span>
            )}
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Video className="w-8 h-8 text-white/60" />
            </div>
            <p className="text-white/80 text-lg font-medium">
              Loading videos...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-2xl">⚠</span>
            </div>
            <p className="text-red-400 text-lg font-medium mb-2">
              Failed to load videos
            </p>
            <p className="text-white/60 text-sm mb-4">{error}</p>
            <Button
              onClick={() => fetchVideos(currentPage)}
              // className="h-9 px-6 bg-transparent border-white/20 text-white hover:bg-white/10 border shadow-sm duration-200"
            >
              Try Again
            </Button>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-white/60" />
            </div>
            <p className="text-white/80 text-lg font-medium mb-2">
              No videos yet
            </p>
            <p className="text-white/60 text-sm mb-4">
              Start creating your first AI-generated video
            </p>
            <Link href="/app/video-generator">
              <Button 
                // className="h-9 px-6 bg-transparent border-white/20 text-white hover:bg-white/10 border shadow-sm duration-200"
              >
                Create Video
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Videos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-4">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  enableNavigation={true}
                  onVideoDeleted={handleVideoDeleted}
                />
              ))}
            </div>

            {/* Pagination */}
            {(hasNextPage || hasPrevPage) && (
              <div className="flex items-center justify-center gap-4">
                {hasPrevPage ? (
                  <Link href={`/app/my-videos?page=${currentPage - 1}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled
                    className="text-white hover:bg-white/10 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                )}

                <span className="text-white/80 text-sm">
                  Page {currentPage} of {totalPages}
                </span>

                {hasNextPage ? (
                  <Link href={`/app/my-videos?page=${currentPage + 1}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled
                    className="text-white hover:bg-white/10 disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
