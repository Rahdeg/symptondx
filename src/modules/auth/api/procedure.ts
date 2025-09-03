import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  completeAdminOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx;

    // Update user role and onboarding status
    await db
      .update(users)
      .set({
        role: "admin",
        onboardingComplete: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Update Clerk metadata
    const clerk = await clerkClient();
    await clerk.users.updateUser(user.clerkId, {
      publicMetadata: {
        onboardingComplete: true,
        role: "admin",
      },
    });

    return { success: true };
  }),

  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),

  // Sync Clerk metadata with database (for existing users)
  syncMetadata: protectedProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx;

    try {
      // Update Clerk metadata to match database state
      const clerk = await clerkClient();
      await clerk.users.updateUser(user.clerkId, {
        publicMetadata: {
          onboardingComplete: user.onboardingComplete,
          role: user.role,
        },
      });

      return { success: true, message: "Metadata synced successfully" };
    } catch (error) {
      console.error("Error syncing metadata:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to sync metadata",
      });
    }
  }),
});
