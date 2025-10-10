'use client';

import { Button } from '@/components/ui/button';
import { StickyNote } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center gap-8 px-4 py-24 md:py-32">
          <div className="flex items-center gap-3">
            <StickyNote className="h-12 w-12 md:h-16 md:w-16" />
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Test
            </h1>
          </div>
          
          <p className="max-w-[600px] text-center text-lg text-muted-foreground md:text-xl">
            {/*Your personal meetings app. Capture your thoughts, organize your ideas, 
            and keep everything in sync across all your devices.*/}
            Test
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            <Link href="/sign-up">
              <Button size="lg" className="text-base">
                Get Started
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="text-base">
                Sign In
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025  All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
