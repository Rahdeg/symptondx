import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);
const isWebhookRoute = createRouteMatcher(["/api/users/webhook"]);
const isTRPCRoute = createRouteMatcher(["/api/trpc(.*)"]);
const isMLRoute = createRouteMatcher(["/api/ml(.*)"]);
const isInngestRoute = createRouteMatcher(["/api/inngest(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Skip Clerk middleware for webhook routes
  if (isWebhookRoute(req)) {
    return NextResponse.next();
  }

  // Skip Clerk middleware for ML API routes
  if (isMLRoute(req)) {
    return NextResponse.next();
  }

  // Skip Clerk middleware for Inngest routes
  if (isInngestRoute(req)) {
    return NextResponse.next();
  }

  // Skip onboarding redirect for tRPC API calls
  if (isTRPCRoute(req)) {
    return NextResponse.next();
  }

  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // For users visiting /onboarding, check if they should be redirected
  if (userId && isOnboardingRoute(req)) {
    // Check if user has already completed onboarding
    const publicMetadata = sessionClaims?.publicMetadata as {
      onboardingComplete?: boolean;
      role?: string;
    };

    let onboardingComplete = publicMetadata?.onboardingComplete;
    let userRole = publicMetadata?.role;

    // If metadata not available, check database
    if (onboardingComplete === undefined || userRole === undefined) {
      try {
        const [user] = await db
          .select({
            onboardingComplete: users.onboardingComplete,
            role: users.role,
          })
          .from(users)
          .where(eq(users.clerkId, userId))
          .limit(1);

        onboardingComplete = user?.onboardingComplete ?? false;
        userRole = user?.role ?? "patient";
      } catch (error) {
        console.error("Database check failed in onboarding route:", error);
        onboardingComplete = false;
        userRole = "patient";
      }
    }

    // If onboarding is complete, redirect to appropriate dashboard
    if (onboardingComplete) {
      const roleDashboardMap: Record<string, string> = {
        patient: "/dashboard/patient",
        doctor: "/dashboard/doctor",
        admin: "/dashboard/admin",
      };

      const redirectUrl = roleDashboardMap[userRole] || "/";
      const targetUrl = new URL(redirectUrl, req.url);
      return NextResponse.redirect(targetUrl);
    }

    // If onboarding is not complete, allow access to onboarding
    return NextResponse.next();
  }

  // If the user isn't signed in and the route is private, redirect to sign-in
  if (!userId && !isPublicRoute(req))
    return redirectToSignIn({ returnBackUrl: req.url });

  // If the user is not logged in but on a public route, let them continue
  if (!userId && isPublicRoute(req)) return NextResponse.next();

  // Check user onboarding status and role for access control
  if (userId) {
    let onboardingComplete: boolean;
    let userRole: string;

    // Try to get metadata from session claims first (fastest)
    const publicMetadata = sessionClaims?.publicMetadata as {
      onboardingComplete?: boolean;
      role?: string;
    };

    if (
      publicMetadata?.onboardingComplete !== undefined &&
      publicMetadata?.role !== undefined
    ) {
      // Metadata available in session claims
      onboardingComplete = publicMetadata.onboardingComplete;
      userRole = publicMetadata.role;
    } else {
      // Fetch metadata from Clerk API (most reliable)
      try {
        const clerk = await clerkClient();
        const clerkUser = await clerk.users.getUser(userId);
        const clerkMetadata = clerkUser.publicMetadata as {
          onboardingComplete?: boolean;
          role?: string;
        };

        if (
          clerkMetadata?.onboardingComplete !== undefined &&
          clerkMetadata?.role !== undefined
        ) {
          onboardingComplete = clerkMetadata.onboardingComplete;
          userRole = clerkMetadata.role;
        } else {
          // Fallback to database
          const [user] = await db
            .select({
              onboardingComplete: users.onboardingComplete,
              role: users.role,
            })
            .from(users)
            .where(eq(users.clerkId, userId))
            .limit(1);

          onboardingComplete = user?.onboardingComplete ?? false;
          userRole = user?.role ?? "patient";
        }
      } catch (error) {
        console.error("Failed to fetch user metadata:", error);
        onboardingComplete = false;
        userRole = "patient";
      }
    }

    // Redirect to onboarding if not complete
    if (!onboardingComplete) {
      const onboardingUrl = new URL("/onboarding", req.url);
      return NextResponse.redirect(onboardingUrl);
    }

    // Check role-based access for dashboard routes
    const pathname = req.nextUrl.pathname;
    if (pathname.startsWith("/dashboard/")) {
      const requestedRole = pathname.split("/")[2]; // Extract role from /dashboard/{role}

      if (requestedRole && requestedRole !== userRole) {
        // Redirect to the correct dashboard based on user's actual role
        const roleDashboardMap: Record<string, string> = {
          doctor: "/dashboard/doctor",
          admin: "/dashboard/admin",
          patient: "/dashboard/patient",
        };

        const correctDashboard =
          roleDashboardMap[userRole] || "/dashboard/patient";
        const correctUrl = new URL(correctDashboard, req.url);
        return NextResponse.redirect(correctUrl);
      }
    }
  }

  // If the user is logged in and the route is protected, let them view.
  if (userId && !isPublicRoute(req)) return NextResponse.next();

  // Default: let the request continue
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
