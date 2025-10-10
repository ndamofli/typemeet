'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Meeting } from '@/types/database'
import { Plus, Loader2 } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMeetings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/meetings')
      const data = await response.json()

      if (!response.ok) {
        if (data.requiresAuth) {
          router.push('/sign-in')
          return
        }
        throw new Error(data.error || 'Failed to fetch meetings')
      }

      setMeetings(data.meetings || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meetings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeetings()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">My Meetings</h1>
          <p className="text-muted-foreground mt-2">
            Capture your meetings
          </p>
        </div>
        <Button
          onClick={() => router.push('/meetings/new')}
          size="lg"
          className="gap-2"
        >
          <Plus className="h-5 w-5" />
          New Meeting
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {meetings.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center py-12">
            <CardTitle>No meetings yet</CardTitle>
            <CardDescription className="mt-2">
              Get started by creating your first meeting
            </CardDescription>
            <div className="mt-6">
              <Button
                onClick={() => router.push('/meetings/new')}
                size="lg"
                className="gap-2"
              >
                <Plus className="h-5 w-5" />
                Create Your First Meeting
              </Button>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => (
            <Card
              key={meeting.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/meetings/${meeting.id}`)}
            >
              <CardHeader>
                <CardTitle className="line-clamp-1">{meeting.title}</CardTitle>
                <CardDescription>{formatDate(meeting.created_at)}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {meeting.content}
                </p>
                {meeting.tags && meeting.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {meeting.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
