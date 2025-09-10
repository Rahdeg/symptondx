import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { onboardingStepSchema, completeOnboardingSchema } from "../schema";
import { baseService } from "../../shared/services/base-service";
import { userService } from "../../auth/services/user-service";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const onboardingRouter = createTRPCRouter({
  // Get current onboarding status
  getOnboardingStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await baseService.getUserByClerkId(ctx.clerkUserId!);
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
      // Update user role in database
      await db
        .update(users)
        .set({
          role: input.role,
        })
        .where(eq(users.clerkId, ctx.clerkUserId!));

      // Update Clerk metadata
      await baseService.updateClerkMetadata(ctx.clerkUserId!, {
        role: input.role,
        onboardingStep: input.step.toString(),
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
      await baseService.updateClerkMetadata(ctx.clerkUserId!, {
        onboardingComplete: true,
        role: input.role,
      });

      return { success: true, role: input.role };
    }),

  // Reset onboarding (for development/testing)
  resetOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    return userService.resetOnboarding(ctx.clerkUserId!);
  }),
});
