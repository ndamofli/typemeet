import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
		<ClerkProvider
			taskUrls={{
				'choose-organization': '/onboarding/choose-organization',
			}}
			appearance={{
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
