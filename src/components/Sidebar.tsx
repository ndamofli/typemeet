'use client'

import { cn } from '@/lib/utils'
import { ChevronRightIcon, ChevronLeftIcon, InboxIcon, Plus } from 'lucide-react'
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { OrganizationSwitcher, useUser } from '@clerk/nextjs'
import { Button } from './ui/button'

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const { user } = useUser()
  const router = useRouter()
  
  const ownerId = user?.id


  // Navigate to /dashboard when ownerId changes
  React.useEffect(() => {
    if (ownerId) {
      router.push('/dashboard')
    }
  }, [ownerId, router])

  return (
    <div
      className={cn(
        'h-screen border-r border-gray-200 bg-gradient-to-b from-blue-50 via-purple-50/80 to-blue-50 p-4 dark:border-gray-800 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-blue-950/20',
        'flex flex-col transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64',
      )}
    >
      <nav className="flex-grow space-y-2">
        <div className="flex items-center justify-between gap-2">

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-white/75 dark:hover:bg-gray-800/50"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4" />
            )}
          </button>
          <div
            className={cn(
              'transition-all duration-300',
              isCollapsed ? 'w-0 overflow-hidden' : 'w-auto',
            )}
          >
          </div>
        </div>



        <div
          className={cn(
            'pt-4 transition-all duration-300',
            isCollapsed ? 'w-0 overflow-hidden' : 'w-auto',
          )}
        >
          <div className="flex items-center justify-between px-3 pb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
           <Button
                onClick={() => router.push('/meetings/new')}
                size="lg"
                className="gap-2"
              >
                <Plus className="h-5 w-5" />
                Create Meeting
              </Button>
          </div>

          <div className="flex items-center justify-between px-3 pb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <OrganizationSwitcher />
          </div>

        </div>
      </nav>

    </div>
  )
}