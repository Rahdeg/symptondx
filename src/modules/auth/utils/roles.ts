import { auth } from "@clerk/nextjs/server";
import { Roles } from "../../../../types/globals";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth();
  return (
    (sessionClaims as unknown as { metadata?: { role?: Roles } })?.metadata
      ?.role === role
  );
};

export const getRoleFromClaims = async (): Promise<Roles | null> => {
  const { sessionClaims } = await auth();
  return (
    (sessionClaims as unknown as { metadata?: { role?: Roles } })?.metadata
      ?.role || null
  );
};

export const getOnboardingStatus = async (): Promise<boolean> => {
  const { sessionClaims, userId } = await auth();

  // First try to get from session claims
  const metadataOnboardingComplete = (
    sessionClaims as unknown as {
      metadata?: { onboardingComplete?: boolean };
    }
  )?.metadata?.onboardingComplete;

  if (metadataOnboardingComplete !== undefined) {
    return metadataOnboardingComplete === true;
  }

  // Fallback to database if metadata is not available
  if (userId) {
    try {
      const [user] = await db
        .select({
          onboardingComplete: users.onboardingComplete,
        })
        .from(users)
        .where(eq(users.clerkId, userId))
        .limit(1);

      return user?.onboardingComplete === true;
    } catch (error) {
      console.error("Error checking onboarding status from database:", error);
      return false;
    }
  }

  return false;
};

export const getOnboardingStatusWithFallback = async (): Promise<{
  onboardingComplete: boolean;
  role: string | null;
  source: "metadata" | "database" | "error";
}> => {
  const { sessionClaims, userId } = await auth();

  // First try to get from session claims
  const publicMetadata = sessionClaims?.publicMetadata as {
    onboardingComplete?: boolean;
    role?: string;
  };

  if (publicMetadata?.onboardingComplete !== undefined) {
    return {
      onboardingComplete: publicMetadata.onboardingComplete,
      role: publicMetadata.role || null,
      source: "metadata",
    };
  }

  // Fallback to database if metadata is not available
  if (userId) {
    try {
      const [user] = await db
        .select({
          onboardingComplete: users.onboardingComplete,
          role: users.role,
        })
        .from(users)
        .where(eq(users.clerkId, userId))
        .limit(1);

      return {
        onboardingComplete: user?.onboardingComplete === true,
        role: user?.role || null,
        source: "database",
      };
    } catch (error) {
      console.error("Error checking onboarding status from database:", error);
      return {
        onboardingComplete: false,
        role: null,
        source: "error",
      };
    }
  }

  return {
    onboardingComplete: false,
    role: null,
    source: "error",
  };
};
