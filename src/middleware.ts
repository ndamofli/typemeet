import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/*const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);*/

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/meetings(.*)',
  '/settings(.*)',
])

const isAdminRoute = createRouteMatcher([
  '/settings/workspace(.*)',
])

// API routes handle their own authentication
const isApiRoute = createRouteMatcher([
  '/api(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId, has } = await auth()

  if( !orgId && req.url.includes('/tasks?') ){
    return NextResponse.redirect(new URL('/setup', req.url))
  }

  const reqProtected = isProtectedRoute(req)
  const reqAdmin = isAdminRoute(req)

  // Check if user is trying to access admin routes
  if (reqAdmin && userId && orgId) {
    if (!has({ role: 'org:admin' })) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  if (userId && orgId && !reqProtected) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (reqProtected) {
    await auth.protect()
  }
  // Let API routes handle their own auth and return JSON responses
  if (isApiRoute(req)) {
    return
  }
})
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
/*export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}*/