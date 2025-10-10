'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

/**
 * Helper function to check if the current user has org:admin role
 */
async function checkOrgAdmin() {
  const { userId, orgId, has } = await auth()
  
  if (!userId || !orgId) {
    throw new Error('Unauthorized: Not authenticated')
  }

  if (!has({ role: 'org:admin' })) {
    throw new Error('Unauthorized: Admin access required')
  }

  return { userId, orgId }
}

/**
 * Create a new invitation for the organization
 */
export async function createInvitation(email: string, role: 'org:member' | 'org:admin') {
  try {
    const { orgId } = await checkOrgAdmin()
    const client = await clerkClient()
    
    await client.organizations.createOrganizationInvitation({
      organizationId: orgId,
      emailAddress: email,
      role: role,
    })

    revalidatePath('/settings/workspace')
    return { success: true, message: 'Invitation sent successfully' }
  } catch (error) {
    console.error('Error creating invitation:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to create invitation' 
    }
  }
}

/**
 * Revoke a pending invitation
 */
export async function revokeInvitation(invitationId: string) {
  try {
    const { orgId } = await checkOrgAdmin()
    const client = await clerkClient()
    
    await client.organizations.revokeOrganizationInvitation({
      organizationId: orgId,
      invitationId: invitationId,
    })

    revalidatePath('/settings/workspace')
    return { success: true, message: 'Invitation revoked successfully' }
  } catch (error) {
    console.error('Error revoking invitation:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to revoke invitation' 
    }
  }
}

/**
 * Remove a member from the organization
 */
export async function removeMember(membershipId: string) {
  try {
    const { orgId, userId } = await checkOrgAdmin()
    const client = await clerkClient()
    
    // Check if trying to remove self
    if (membershipId === userId) {
      return { 
        success: false, 
        message: 'Cannot remove yourself from the workspace' 
      }
    }

    await client.organizations.deleteOrganizationMembership({
      organizationId: orgId,
      userId: membershipId,
    })

    // Delete the user from Clerk altogether
    await client.users.deleteUser(membershipId)

    revalidatePath('/settings/workspace')
    return { success: true, message: 'Member removed successfully' }
  } catch (error) {
    console.error('Error removing member:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to remove member' 
    }
  }
}

/**
 * Rename the organization
 */
export async function renameOrganization(newName: string) {
  try {
    const { orgId } = await checkOrgAdmin()
    const client = await clerkClient()
    
    if (!newName.trim()) {
      return { success: false, message: 'Workspace name cannot be empty' }
    }

    await client.organizations.updateOrganization(orgId, {
      name: newName,
    })

    revalidatePath('/settings/workspace')
    return { success: true, message: 'Workspace renamed successfully' }
  } catch (error) {
    console.error('Error renaming workspace:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to rename workspace' 
    }
  }
}

/**
 * Delete the organization (checks for remaining members first)

export async function deleteOrganization() {
  try {
    const { orgId, userId } = await checkOrgAdmin()
    const client = await clerkClient()
    
    // Get all members
    const memberships = await client.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    })

    // Check if there are other members besides the current user
    const otherMembers = memberships.data.filter(
      (m) => m.publicUserData?.userId !== userId
    )

    if (otherMembers.length > 0) {
      return { 
        success: false, 
        message: 'Remove all members before deleting the workspace' 
      }
    }

    await client.organizations.deleteOrganization(orgId)

    revalidatePath('/settings/workspace')
    //return { success: true, message: 'Organization deleted successfully', redirect: '/onboarding/choose-organization' }
    return { success: true, message: 'Organization deleted successfully', redirect: '/' }
  } catch (error) {
    console.error('Error deleting workspace:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to delete workspace' 
    }
  }
} */

/**
 * Get organization data including members and invitations
 */
export async function getOrganizationData() {
  try {
    const { orgId } = await checkOrgAdmin()
    const client = await clerkClient()
    
    const [organization, memberships, invitations] = await Promise.all([
      client.organizations.getOrganization({ organizationId: orgId }),
      client.organizations.getOrganizationMembershipList({ organizationId: orgId }),
      client.organizations.getOrganizationInvitationList({ 
        organizationId: orgId,
        status: ['pending'],
      }),
    ])

    return {
      success: true,
      data: {
        organization,
        memberships: memberships.data,
        invitations: invitations.data,
      }
    }
  } catch (error) {
    console.error('Error fetching workspace data:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to fetch workspace data' 
    }
  }
}

