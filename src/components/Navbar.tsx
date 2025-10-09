'use client'

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { StickyNote } from 'lucide-react'
//const { isAuthenticated, userId, orgId } = await auth()
//const canCreate = has?.({ permission: 'org:tasks:create' })

//const { has } = await auth()

// Check if the user is authorized
//const canManage = has({ permission: 'org:team_settings:manage' })


export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity"
          >
            <StickyNote className="h-6 w-6" />
            <span>TypeMeet</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <UserButton 
              showName={true}
              userProfileUrl="/user-profile"
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10"
                }
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  )
}

