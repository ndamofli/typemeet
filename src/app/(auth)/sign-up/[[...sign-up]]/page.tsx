'use client';
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() { 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-royal-50 to-royal-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-royal-800 mb-2">Join Typemeet</h1>
          <p className="text-royal-600">Start your journey into productivity</p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl border-0 rounded-2xl",
              headerTitle: "text-royal-800",
              headerSubtitle: "text-royal-600",
              socialButtonsIconButton: "border-royal-200 hover:border-royal-300",
              formButtonPrimary: "bg-royal-600 hover:bg-royal-700 text-sm normal-case",
              formFieldInput: "border-royal-200 focus:border-royal-500 focus:ring-royal-500/20",
              footerActionLink: "text-royal-600 hover:text-royal-700",
            },
          }}
        />
      </div>
    </div>
  )
}
