"use client"
import { FormEventHandler, useState } from "react"
import { UserMembershipParams } from "@/lib/organizations"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from "sonner"
import { useOrganizationList, useUser } from '@clerk/nextjs';
import { PlusCircle, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { isValidEmail } from "@/lib/utils";


export default function CustomCreateOrganizationForm() {
  const router = useRouter();
  const { isLoaded, createOrganization, setActive, userMemberships } =
    useOrganizationList(UserMembershipParams)
  const [isSubmitting, setSubmitting] = useState(false)
  const { user } = useUser()
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedMembers, setInvitedMembers] = useState<string[]>([]);

  const handleInvite = () => {
    if (inviteEmail === user?.emailAddresses[0].emailAddress) {
      toast.error("You cannot invite yourself");
      return;
    }
    if (!isValidEmail(inviteEmail)) {
      toast.error("Invalid email address");
      return;
    }
    if (!inviteEmail.trim()) return;
    if (inviteEmail && !invitedMembers.includes(inviteEmail)) {
      setInvitedMembers([...invitedMembers, inviteEmail]);
      setInviteEmail('');
    }
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (!isLoaded) {
      return null
    }
    setSubmitting(true)

    const submittedData = Object.fromEntries(
      new FormData(e.currentTarget).entries()
    ) as { organizationName: string | undefined; asActive?: "on" }

    if (!submittedData.organizationName) {
      return
    }

    try {
      const organization = await createOrganization({
        name: submittedData.organizationName,
      })
      void userMemberships?.revalidate()
      await setActive({ organization })
      if (invitedMembers.length > 0) {
        //await promise.all does not work here, so we need to use a for loop
        for (const user of invitedMembers) {
          console.log("Inviting user to organization", user)
          await organization.inviteMember({
            emailAddress: user,
            role: "org:member"
          });
        }
        setInvitedMembers([]);
      }
      toast.success(`${invitedMembers.length} invitation${invitedMembers.length > 1 ? 's' : ''} sent successfully!`)
      router.push('/dashboard/');
    } finally {
      if (e.target instanceof HTMLFormElement) {
        e.target.reset()
      }
      setSubmitting(false)
      toast.success('Workspace  created successfully!')
      router.push('/dashboard/');
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-2xl h-screen flex flex-col justify-center items-center">
      <h1 className="text-2xl font-bold mb-2">Create your Workspace</h1>
      <p className="text-gray-600 mb-6">
        Create a workspace for your meetings. You can invite your team to join you.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        <div>
          <label
            htmlFor="orgName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Workspace name
          </label>
          <Input
            id="orgName"
            type="text"
            name="organizationName"
            placeholder="Enter a name for your workspace"
            disabled={isSubmitting}
            className="w-full"
            required
          />
        </div>


        <div>
          <label
            htmlFor="inviteEmail"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Invite members (optional)
          </label>
          <div className="flex space-x-2">
            <Input
              id="inviteEmail"
              name="inviteEmail"
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => {
                  if (e.key === "Enter") {
                      e.preventDefault();
                      handleInvite();
                  }
              }}
              className="flex-grow"
            />
            <Button type="button" onClick={handleInvite} disabled={isSubmitting}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Invite
            </Button>
          </div>
        </div>

        {invitedMembers.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Invited members:
            </h3>
            <ul className="list-disc">
              {invitedMembers.map((email, index) => (
                <li className="flex items-center justify-between py-2" key={index}>{email}
                  <Button type="button" onClick={() => setInvitedMembers(invitedMembers.filter((_, i) => i !== index))} disabled={isSubmitting}>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button type="submit" className="w-full"  disabled={isSubmitting || !isLoaded}>
          Create workspace {isSubmitting && "(Submitting)"}
        </Button>
      </form>
    </div>
  )
}