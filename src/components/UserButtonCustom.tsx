'use client'
import { useOrganization, UserButton } from '@clerk/nextjs'
import { Settings } from 'lucide-react'

export default function Home() {
  const { membership } = useOrganization()
  
  const isAdmin = membership?.role === 'org:admin'
  /* For page user management > userProfileUrl="/user-profile"*/
  return (
    <UserButton 
      showName={true}
      userProfileMode="modal"
      appearance={{
        elements: {
          avatarBox: "h-10 w-10",
          userButtonBox : {
						color: "black"
					},
        }
    }}>
      {isAdmin && (
        <UserButton.MenuItems>
          <UserButton.Link
            label="Workspace Settings"
            labelIcon={<Settings className="h-4 w-4" />}
            href="/settings/workspace"
          />
        </UserButton.MenuItems>
      )}

    </UserButton>
  )
}