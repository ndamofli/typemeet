'use client'

import { useState, useEffect } from 'react'
import { useOrganization, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
//import { useRouter } from 'next/navigation'
import {
  createInvitation,
  revokeInvitation,
  removeMember,
  renameOrganization,
} from '@/lib/actions/organization.actions'
import { UserMinus, Mail, Settings2 } from 'lucide-react'

export default function OrganizationManagementPage() {
  //const router = useRouter()
  const { organization, memberships, invitations, membership } = useOrganization({
    memberships: {
      infinite: true,
    },
    invitations: {
      infinite: true,
    },
  })
  const { user } = useUser()

  // Invitation form state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'org:member' | 'org:admin'>('org:member')
  const [isInviting, setIsInviting] = useState(false)

  // Rename organization state
  const [orgName, setOrgName] = useState('')
  const [isRenaming, setIsRenaming] = useState(false)

  // Delete member dialog state
  const [deleteMemberDialog, setDeleteMemberDialog] = useState<{
    open: boolean
    member: { id: string; email: string; name: string } | null
  }>({
    open: false,
    member: null,
  })
  const [deleteMemberEmail, setDeleteMemberEmail] = useState('')
  const [isDeletingMember, setIsDeletingMember] = useState(false)

  // Delete organization dialog state
  // const [deleteOrgDialog, setDeleteOrgDialog] = useState(false)
  // const [deleteOrgName, setDeleteOrgName] = useState('')
  // const [isDeletingOrg, setIsDeletingOrg] = useState(false)

  // Set initial org name when organization loads
  useEffect(() => {
    if (organization?.name) {
      setOrgName(organization.name)
    }
  }, [organization?.name])

  // Check if user is admin
  const isAdmin = membership?.role === 'org:admin'

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Access Denied</h2>
          <p className="text-red-600 mt-1">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setIsInviting(true)
    const result = await createInvitation(inviteEmail, inviteRole)
    setIsInviting(false)

    if (result.success) {
      toast.success(result.message)
      setInviteEmail('')
      invitations?.revalidate()
    } else {
      toast.error(result.message)
    }
  }

  const handleRevokeInvitation = async (invitationId: string) => {
    const result = await revokeInvitation(invitationId)
    if (result.success) {
      toast.success(result.message)
      invitations?.revalidate()
    } else {
      toast.error(result.message)
    }
  }

  const handleDeleteMember = async () => {
    if (!deleteMemberDialog.member) return
    if (deleteMemberEmail !== deleteMemberDialog.member.email) {
      toast.error('Email does not match')
      return
    }

    setIsDeletingMember(true)
    const result = await removeMember(deleteMemberDialog.member.id)
    setIsDeletingMember(false)

    if (result.success) {
      toast.success(result.message)
      setDeleteMemberDialog({ open: false, member: null })
      setDeleteMemberEmail('')
      memberships?.revalidate()
    } else {
      toast.error(result.message)
    }
  }

  const handleRenameOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgName.trim()) return
    if (orgName === organization?.name) return

    setIsRenaming(true)
    const result = await renameOrganization(orgName)
    setIsRenaming(false)

    if (result.success) {
      toast.success(result.message)
      organization?.reload()
    } else {
      toast.error(result.message)
    }
  }
/*
  const handleDeleteOrganization = async () => {
    if (deleteOrgName !== organization?.name) {
      toast.error('Workspace name does not match')
      return
    }

    // Check if there are other members
    const otherMembers = memberships?.data?.filter(
      (m) => m.publicUserData?.userId !== user?.id
    )

    if (otherMembers && otherMembers.length > 0) {
      toast.error('Remove all members before deleting the workspace')
      return
    }

    setIsDeletingOrg(true)
    const result = await deleteOrganization()
    setIsDeletingOrg(false)

    if (result.success) {
      toast.success(result.message)
      setDeleteOrgDialog(false)
      setDeleteOrgName('')
      if (result.redirect) {
        router.push(result.redirect)
      }
    } else {
      toast.error(result.message)
    }
  }
*/
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Settings2 className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Workspace Settings</h1>
      </div>

      {/* Members Section */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <UserMinus className="h-5 w-5" />
          <h2 className="text-2xl font-semibold">Members</h2>
        </div>

        <div className="bg-white border rounded-lg p-6">
          {memberships?.data && memberships.data.length > 0 ? (
            <ul className="space-y-2">
              {memberships.data.map((member) => {
                const isCurrentUser = member.publicUserData?.userId === user?.id
                return (
                  <li
                    key={member.id}
                    className="flex items-center justify-between py-3 border-b last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {member.publicUserData?.firstName} {member.publicUserData?.lastName}
                        {isCurrentUser && ' (You)'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {member.publicUserData?.identifier} • Role: {member.role}
                      </p>
                    </div>
                    {!isCurrentUser && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setDeleteMemberDialog({
                            open: true,
                            member: {
                              id: member.publicUserData?.userId || '',
                              email: member.publicUserData?.identifier || '',
                              name: `${member.publicUserData?.firstName} ${member.publicUserData?.lastName}`,
                            },
                          })
                        }
                      >
                        Remove
                      </Button>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-gray-500">No members found</p>
          )}
        </div>
      </section>
      
      {/* Invitations Section */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5" />
          <h2 className="text-2xl font-semibold">Invitations</h2>
        </div>

        <div className="bg-white border rounded-lg p-6 mb-4">
          <h3 className="text-lg font-medium mb-4">Create New Invitation</h3>
          <form onSubmit={handleCreateInvitation} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'org:member' | 'org:admin')}
              className="px-3 py-2 border rounded-md"
            >
              <option value="org:member">Member</option>
              <option value="org:admin">Admin</option>
            </select>
            <Button type="submit" disabled={isInviting}>
              {isInviting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </form>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Pending Invitations</h3>
          {invitations?.data && invitations.data.length > 0 ? (
            <ul className="space-y-2">
              {invitations.data.map((invitation) => (
                <li
                  key={invitation.id}
                  className="flex items-center justify-between py-3 border-b last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{invitation.emailAddress}</p>
                    <p className="text-sm text-gray-500">
                      Role: {invitation.role} • Created:{' '}
                      {new Date(invitation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRevokeInvitation(invitation.id)}
                  >
                    Revoke
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No pending invitations</p>
          )}
        </div>
      </section>

      {/* Rename Organization Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Rename Workspace</h2>
        <div className="bg-white border rounded-lg p-6">
          <form onSubmit={handleRenameOrganization} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="orgName" className="mb-2 block">
                Workspace Name
              </Label>
              <Input
                id="orgName"
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={isRenaming || orgName === organization?.name}>
                {isRenaming ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Delete Organization Section
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-red-600">Danger Zone</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-2 text-red-800">Delete Workspace</h3>
          <p className="text-sm text-red-600 mb-4">
            Once you delete a workspace, there is no going back. Please be certain.
          </p>
          <Button variant="destructive" onClick={() => setDeleteOrgDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Workspace
          </Button>
        </div>
      </section> */}

      {/* Delete Member Dialog */}
      <Dialog
        open={deleteMemberDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteMemberDialog({ open: false, member: null })
            setDeleteMemberEmail('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Member</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Please type{' '}
              <strong>{deleteMemberDialog.member?.email}</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="confirmEmail" className="mb-2 block">
              Member Email
            </Label>
            <Input
              id="confirmEmail"
              type="text"
              value={deleteMemberEmail}
              onChange={(e) => setDeleteMemberEmail(e.target.value)}
              placeholder={deleteMemberDialog.member?.email}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteMemberDialog({ open: false, member: null })
                setDeleteMemberEmail('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMember}
              disabled={
                isDeletingMember || deleteMemberEmail !== deleteMemberDialog.member?.email
              }
            >
              {isDeletingMember ? 'Deleting...' : 'Delete Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Organization Dialog
      <Dialog open={deleteOrgDialog} onOpenChange={setDeleteOrgDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Please type <strong>{organization?.name}</strong> to
              confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="confirmOrgName" className="mb-2 block">
              Workspace Name
            </Label>
            <Input
              id="confirmOrgName"
              type="text"
              value={deleteOrgName}
              onChange={(e) => setDeleteOrgName(e.target.value)}
              placeholder={organization?.name}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOrgDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOrganization}
              disabled={isDeletingOrg || deleteOrgName !== organization?.name}
            >
              {isDeletingOrg ? 'Deleting...' : 'Delete Workspace'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  )
}

