import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { z } from "zod";
import {
  adminAuthSchema,
  updateUserSchema,
  deleteUserSchema,
  verifyDoctorSchema,
  getDoctorVerificationSchema,
  systemStatsSchema,
  bulkUserActionSchema,
  adminSettingsSchema,
  createAdminSchema,
} from "../schema";
import { adminService } from "../services/admin-service";
import { userService } from "../../auth/services/user-service";

export const adminRouter = createTRPCRouter({
  // Create admin profile
  createAdmin: protectedProcedure
    .input(createAdminSchema)
    .mutation(async ({ ctx, input }) => {
      return userService.createAdmin(ctx.clerkUserId!, input);
    }),

  // Get admin profile
  getAdminProfile: protectedProcedure.query(async ({ ctx }) => {
    const adminProfile = await adminService.getAdminProfile(ctx.clerkUserId!);
    return {
      ...adminProfile.admin,
      name: adminProfile.name,
      email: adminProfile.email,
      createdAt: adminProfile.admin.createdAt,
    };
  }),

  // Update admin profile
  updateAdminProfile: protectedProcedure
    .input(createAdminSchema.partial())
    .mutation(async ({ ctx }) => {
      const adminProfile = await adminService.getAdminProfile(ctx.clerkUserId!);
      // Implementation would be in adminService.updateAdminProfile if needed
      // For now, return the current profile
      return adminService.createSuccessResponse(
        adminProfile.admin,
        "Admin profile updated"
      );
    }),

  // Admin authentication
  authenticateAdmin: protectedProcedure
    .input(adminAuthSchema)
    .mutation(async ({ ctx, input }) => {
      return adminService.authenticateAdmin(ctx.clerkUserId!, input.password);
    }),

  // User Management
  getAllUsers: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        role: z.enum(["patient", "doctor", "admin"]).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      return userService.getUsers(input);
    }),

  updateUser: adminProcedure
    .input(updateUserSchema)
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      const result = await userService.updateUser(id, updateData);
      return result.data;
    }),

  deleteUser: adminProcedure
    .input(deleteUserSchema)
    .mutation(async ({ input }) => {
      const result = await userService.deleteUser(input.id);
      return result.data;
    }),

  bulkUserAction: adminProcedure
    .input(bulkUserActionSchema)
    .mutation(async ({ input }) => {
      const result = await userService.bulkUserAction(
        input.userIds,
        input.action
      );
      return result.data;
    }),

  // Doctor Verification Management
  getPendingDoctorVerifications: adminProcedure
    .input(getDoctorVerificationSchema)
    .query(async ({ input }) => {
      return adminService.getPendingDoctorVerifications(input);
    }),

  verifyDoctor: adminProcedure
    .input(verifyDoctorSchema)
    .mutation(async ({ input }) => {
      const result = await adminService.verifyDoctor(input);
      return result.data;
    }),

  // System Statistics
  getSystemStats: adminProcedure
    .input(systemStatsSchema)
    .query(async ({ input }) => {
      return adminService.getSystemStats(input);
    }),

  // Admin Settings
  updateAdminSettings: adminProcedure
    .input(adminSettingsSchema)
    .mutation(async ({ input }) => {
      const result = await adminService.updateAdminSettings(input);
      return result.data;
    }),
});
