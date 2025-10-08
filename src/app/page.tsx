'use client';

import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { StickyNote } from 'lucide-react';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      redirect('/dashboard');
    }
  }, [isSignedIn, isLoaded]);

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center gap-8 px-4 py-24 md:py-32">
          <div className="flex items-center gap-3">
            <StickyNote className="h-12 w-12 md:h-16 md:w-16" />
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              TypeMeet
            </h1>
          </div>
          
          <p className="max-w-[600px] text-center text-lg text-muted-foreground md:text-xl">
            Your personal meetings app. Capture your thoughts, organize your ideas, 
            and keep everything in sync across all your devices.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            <Link href="/sign-up">
              <Button size="lg" className="text-base">
                Get Started Free
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="text-base">
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/50 py-16 md:py-24">
          <div className="container px-4">
            <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
              Why TypeMeet?
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <StickyNote className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Simple & Clean</h3>
                <p className="text-muted-foreground">
                  A distraction-free interface that lets you focus on what matters most.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <StickyNote className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Always Synced</h3>
                <p className="text-muted-foreground">
                  Your meetings are automatically saved and synced across all devices.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <StickyNote className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Secure & Private</h3>
                <p className="text-muted-foreground">
                  Your data is encrypted and secure. Only you have access to your meetings.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 TypeMeet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
