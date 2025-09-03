import { db } from "@/db";
import { users } from "@/db/schema";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { onboardingStepSchema, completeOnboardingSchema } from "../schema";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";

export const onboardingRouter = createTRPCRouter({
  // Get current onboarding status
  getOnboardingStatus: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await db
      .select({
        id: users.id,
        role: users.role,
        onboardingComplete: users.onboardingComplete,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.clerkId, ctx.clerkUserId!))
      .limit(1);

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return {
      isComplete: user.onboardingComplete,
      currentRole: user.role,
      hasName: !!user.name,
      hasEmail: !!user.email,
    };
  }),

  // Update onboarding step
  updateOnboardingStep: protectedProcedure
    .input(onboardingStepSchema)
    .mutation(async ({ input, ctx }) => {
      // Update user role
      await db
        .update(users)
        .set({
          role: input.role,
        })
        .where(eq(users.clerkId, ctx.clerkUserId!));

      // Update Clerk metadata
      const clerk = await clerkClient();
      await clerk.users.updateUser(ctx.clerkUserId!, {
        publicMetadata: {
          role: input.role,
          onboardingStep: input.step,
        },
      });

      return { success: true, step: input.step };
    }),

  // Complete onboarding
  completeOnboarding: protectedProcedure
    .input(completeOnboardingSchema)
    .mutation(async ({ input, ctx }) => {
      // Update user onboarding status
      await db
        .update(users)
        .set({
          onboardingComplete: true,
          role: input.role,
        })
        .where(eq(users.clerkId, ctx.clerkUserId!));

      // Update Clerk metadata
      const clerk = await clerkClient();
      await clerk.users.updateUser(ctx.clerkUserId!, {
        publicMetadata: {
          onboardingComplete: true,
          role: input.role,
        },
      });

      return { success: true, role: input.role };
    }),

  // Reset onboarding (for development/testing)
  resetOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    // Reset user onboarding status
    await db
      .update(users)
      .set({
        onboardingComplete: false,
        role: "patient", // Default role
      })
      .where(eq(users.clerkId, ctx.clerkUserId!));

    // Update Clerk metadata
    const clerk = await clerkClient();
    await clerk.users.updateUser(ctx.clerkUserId!, {
      publicMetadata: {
        onboardingComplete: false,
        role: "patient",
      },
    });

    return { success: true };
  }),
});
