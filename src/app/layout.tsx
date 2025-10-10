import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { dark } from "@clerk/themes";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Typemeet - Transform Your Team's Productivity",
	description:
		"An all-in-one platform for team collaboration, task management, and employee well-being. Features include live document sharing, video calls, AI-powered task management, and mental health monitoring.",
	keywords: [
		"productivity",
		"team collaboration",
		"task management",
		"employee well-being",
		"video calls",
		"document sharing",
		"AI management",
	],

	authors: [
		{
			name: "Typemeet",
		},
	],
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://www.typemeet.ai",
		title: "Typemeet - Transform Your Team's Productivity",
		description:
			"All-in-one platform for team collaboration and productivity",
		siteName: "Typemeet",
	},
	twitter: {
		card: "summary_large_image",
		title: "Typemeet - Transform Your Team's Productivity",
		description:
			"All-in-one platform for team collaboration and productivity",
	},
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
	const { userId, orgId, orgRole } = await auth()
		
	let canDeleteAccount = true;
	let isAdmin = false;

	if (userId && orgId) {
		try {
			
			isAdmin = orgRole === 'org:admin'

			if (isAdmin) {
				// Get all organization members
				const memberships = await (await clerkClient()).organizations.getOrganizationMembershipList({
					organizationId: orgId,
				})
				
				// Check if there are other members
				const otherMembers = memberships.data.filter(
					(m) => m.publicUserData?.userId !== userId
				)

				const invitations  = await (await clerkClient()).organizations.getOrganizationInvitationList({
					organizationId: orgId,
					status: ['pending'],
				})
				
				if (otherMembers && otherMembers.length > 0) {
					canDeleteAccount = false;
				}

				if (invitations.data.length > 0) {
					canDeleteAccount = false;
				}
			}
		} catch (error) {
			console.error('Error fetching organization data:', error)
		}
	}

  return (
		<ClerkProvider
		  afterSignOutUrl ="/sign-in"
			taskUrls={{
				'choose-organization': '/setup',
			}}
			localization={{ 
				userProfile: {
					start:{
						dangerSection:{
							title: canDeleteAccount ? "Delete account" : "You have to remove your workspace members, pending invitations and subscription before you can delete your account.",
						},
					},
				},
			}}
			appearance={{
				elements: {
					profileSection__danger : {
						display: canDeleteAccount ? "flex" : "block",
					},
					profileSectionContent__danger : {
						display: canDeleteAccount ? "block" : "none",
					},
					profileSectionTitleText__danger : { 
						color: canDeleteAccount ? "rgb(255, 255, 255)" : "rgb(239, 68, 68)",
					},
				},
				layout: {
					unsafe_disableDevelopmentModeWarnings: true,
				},
        baseTheme: dark,
				variables: {
					colorPrimary: "white",
					colorText: "white",
				},
			}}
		>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <main>{children}</main>
					<Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
