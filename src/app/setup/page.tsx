"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useOrganizationList, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const { isLoaded, createOrganization, setActive } = useOrganizationList();
  const { user, isLoaded: userLoaded } = useUser();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const createWorkspace = async () => {
      if (!isLoaded || !userLoaded || !user || isCreating) {
        return;
      }

      setIsCreating(true);

      try {
        // Generate organization name
        let orgName = '';
        
        if (user.firstName) {
          // Use first name if available
          orgName = `${user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)}'s Workspace`;
        } else {
          // Use email prefix if first name is not available
          const email = user.emailAddresses[0]?.emailAddress;
          if (email) {
            const emailPrefix = email.split('@')[0];
            orgName = `${emailPrefix}'s Workspace`;
          } else {
            // Fallback if no email is available
            orgName = 'My Workspace';
          }
        }

        // Create the organization
        const organization = await createOrganization({
          name: orgName,
        });

        toast.success('Workspace created successfully!');
        // Set the created organization as active
        await setActive({ organization });
        router.push('/dashboard');
      } catch (error) {
        console.error('Error creating workspace:', error);
        toast.error('Failed to create workspace. Please try again.');
        setIsCreating(false);
      }
    };

    createWorkspace();
  }, [isLoaded, userLoaded, user, createOrganization, setActive, router, isCreating]);

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-2xl h-screen flex flex-col justify-center items-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h1 className="text-2xl font-bold">Setting up your workspace...</h1>
        <p className="text-gray-600 text-center">
          Please wait while we create your workspace.
        </p>
      </div>
    </div>
  );
}
