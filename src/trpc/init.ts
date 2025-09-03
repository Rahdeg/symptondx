import superjson from "superjson";
import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { cache } from "react";

export const createTRPCContext = cache(async () => {
  const { userId } = await auth();
  return { clerkUserId: userId };
});

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
type Context = {
  clerkUserId: string | null;
};

const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async function isAuthed(
  opts
) {
  const { ctx } = opts;

  if (!ctx.clerkUserId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, ctx.clerkUserId))
    .limit(1);

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  // if (!user.onboardingComplete) {
  //   throw new TRPCError({
  //     code: "FORBIDDEN",
  //     message: "You must complete onboarding before accessing this resource",
  //   });
  // }

  return opts.next({
    ctx: {
      ...ctx,
      user,
    },
  });
});

// Role-specific procedures
export const patientProcedure = protectedProcedure.use(async function isPatient(
  opts
) {
  const { ctx } = opts;

  if (ctx.user.role !== "patient") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This resource is only available to patients",
    });
  }

  return opts.next({ ctx });
});

export const doctorProcedure = protectedProcedure.use(async function isDoctor(
  opts
) {
  const { ctx } = opts;

  if (ctx.user.role !== "doctor") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This resource is only available to doctors",
    });
  }

  return opts.next({ ctx });
});

export const adminProcedure = protectedProcedure.use(async function isAdmin(
  opts
) {
  const { ctx } = opts;

  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This resource is only available to administrators",
    });
  }

  return opts.next({ ctx });
});
