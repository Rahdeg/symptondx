import { BaseService } from "../../shared/services/base-service";
import { users, patients, doctors, admins } from "@/db/schema";
import { eq, desc, count, and, like, or, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";
import { notificationService } from "@/lib/notification-service";

export interface CreatePatientInput {
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalHistory?: string[];
  currentMedications?: string[];
  allergies?: string[];
}

export interface CreateDoctorInput {
  licenseNumber: string;
  specialization: string;
  yearsOfExperience: number;
  phoneNumber: string;
  qualifications: string;
  hospitalAffiliations?: string;
}

export interface CreateAdminInput {
  organizationName: string;
  jobTitle: string;
  phoneNumber: string;
  department?: string;
  managementLevel: "senior" | "mid" | "junior" | "executive";
  systemPermissions?: string[];
  preferredNotifications?: string[];
}

/**
 * User service handling all user-related operations
 * Following Single Responsibility Principle
 */
export class UserService extends BaseService {
  /**
   * Create patient profile during onboarding
   */
  async createPatient(clerkId: string, input: CreatePatientInput) {
    try {
      const currentUser = await this.getUserByClerkId(clerkId);

      // Validate user state
      if (currentUser.onboardingComplete) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User has already completed onboarding",
        });
      }

      // Check if patient profile already exists
      const existingPatient = await this.db
        .select({ id: patients.id })
        .from(patients)
        .where(eq(patients.userId, currentUser.id))
        .limit(1);

      if (existingPatient.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Patient profile already exists for this user",
        });
      }

      // Create patient profile
      const [patient] = await this.db
        .insert(patients)
        .values({
          userId: currentUser.id,
          dateOfBirth: new Date(input.dateOfBirth),
          gender: input.gender,
          phoneNumber: input.phoneNumber,
          address: input.address,
          emergencyContact: input.emergencyContact,
          emergencyPhone: input.emergencyPhone,
          medicalHistory: input.medicalHistory || [],
          currentMedications: input.currentMedications || [],
          allergies: input.allergies || [],
        })
        .returning();

      // Update user onboarding status
      await this.db
        .update(users)
        .set({
          onboardingComplete: true,
          role: "patient",
        })
        .where(eq(users.clerkId, clerkId));

      // Update Clerk metadata
      await this.updateClerkMetadata(clerkId, {
        onboardingComplete: true,
        role: "patient",
      });

      // Send notification to admins
      await this.notifyAdminsOfNewMember(
        currentUser.name || "Unknown Patient",
        currentUser.email,
        "patient"
      );

      return this.createSuccessResponse(patient);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.handleDatabaseError(error, "create patient");
    }
  }

  /**
   * Create doctor profile during onboarding
   */
  async createDoctor(clerkId: string, input: CreateDoctorInput) {
    try {
      const currentUser = await this.getUserByClerkId(clerkId);

      // Validate user state
      if (currentUser.onboardingComplete) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User has already completed onboarding",
        });
      }

      // Check if doctor profile already exists
      const existingDoctor = await this.db
        .select({ id: doctors.id })
        .from(doctors)
        .where(eq(doctors.userId, currentUser.id))
        .limit(1);

      if (existingDoctor.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Doctor profile already exists for this user",
        });
      }

      // Create doctor profile
      const [doctor] = await this.db
        .insert(doctors)
        .values({
          userId: currentUser.id,
          licenseNumber: input.licenseNumber,
          specialization: input.specialization,
          yearsOfExperience: input.yearsOfExperience,
          phoneNumber: input.phoneNumber,
          qualifications: input.qualifications,
          hospitalAffiliations: input.hospitalAffiliations,
          isVerified: false, // Requires manual verification
        })
        .returning();

      // Update user onboarding status
      await this.db
        .update(users)
        .set({
          onboardingComplete: true,
          role: "doctor",
        })
        .where(eq(users.clerkId, clerkId));

      // Update Clerk metadata
      await this.updateClerkMetadata(clerkId, {
        onboardingComplete: true,
        role: "doctor",
      });

      // Send notifications to admins
      await this.notifyAdminsOfNewMember(
        currentUser.name || "Unknown Doctor",
        currentUser.email,
        "doctor"
      );

      await notificationService.createDoctorVerificationNeededNotification(
        currentUser.name || "Unknown Doctor",
        currentUser.email,
        input.licenseNumber,
        doctor.id
      );

      return this.createSuccessResponse(doctor);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.handleDatabaseError(error, "create doctor");
    }
  }

  /**
   * Create admin profile
   */
  async createAdmin(clerkId: string, input: CreateAdminInput) {
    try {
      const currentUser = await this.getUserByClerkId(clerkId);

      // Check if admin profile already exists
      const existingAdmin = await this.db
        .select()
        .from(admins)
        .where(eq(admins.userId, currentUser.id))
        .limit(1);

      if (existingAdmin.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Admin profile already exists",
        });
      }

      // Create admin profile
      const [admin] = await this.db
        .insert(admins)
        .values({
          userId: currentUser.id,
          organizationName: input.organizationName,
          jobTitle: input.jobTitle,
          phoneNumber: input.phoneNumber,
          department: input.department,
          managementLevel: input.managementLevel,
          systemPermissions: input.systemPermissions || [],
          preferredNotifications: input.preferredNotifications || [],
        })
        .returning();

      return this.createSuccessResponse(admin);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.handleDatabaseError(error, "create admin");
    }
  }

  /**
   * Get paginated users with filtering (admin only)
   */
  async getUsers(options: {
    limit: number;
    offset: number;
    search?: string;
    role?: "patient" | "doctor" | "admin";
    isActive?: boolean;
  }) {
    try {
      const { limit, offset, search, role, isActive } = options;
      const whereConditions = [];

      if (search) {
        whereConditions.push(
          or(like(users.name, `%${search}%`), like(users.email, `%${search}%`))
        );
      }

      if (role) {
        whereConditions.push(eq(users.role, role));
      }

      if (isActive !== undefined) {
        whereConditions.push(eq(users.isActive, isActive));
      }

      const [userList, totalCount] = await Promise.all([
        this.db
          .select({
            id: users.id,
            clerkId: users.clerkId,
            email: users.email,
            name: users.name,
            role: users.role,
            isActive: users.isActive,
            onboardingComplete: users.onboardingComplete,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
          })
          .from(users)
          .where(
            whereConditions.length > 0 ? and(...whereConditions) : undefined
          )
          .limit(limit)
          .offset(offset)
          .orderBy(desc(users.createdAt)),

        this.db
          .select({ count: count() })
          .from(users)
          .where(
            whereConditions.length > 0 ? and(...whereConditions) : undefined
          ),
      ]);

      return {
        users: userList,
        total: totalCount[0]?.count || 0,
        hasMore: offset + limit < (totalCount[0]?.count || 0),
      };
    } catch (error) {
      this.handleDatabaseError(error, "get users");
    }
  }

  /**
   * Update user (admin only)
   */
  async updateUser(
    userId: string,
    updateData: {
      name?: string;
      email?: string;
      role?: "patient" | "doctor" | "admin";
      isActive?: boolean;
    }
  ) {
    try {
      // Update user in database
      const [updatedUser] = await this.db
        .update(users)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Update Clerk metadata if role changed
      if (updateData.role) {
        await this.updateClerkMetadata(updatedUser.clerkId, {
          role: updateData.role,
          onboardingComplete: updatedUser.onboardingComplete || false,
        });
      }

      return this.createSuccessResponse(updatedUser);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.handleDatabaseError(error, "update user");
    }
  }

  /**
   * Delete user and associated Clerk account (admin only)
   */
  async deleteUser(userId: string) {
    try {
      // Get user first to get clerkId
      const [user] = await this.db
        .select({ clerkId: users.clerkId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Delete from database (cascading deletes will handle related records)
      await this.db.delete(users).where(eq(users.id, userId));

      // Delete from Clerk
      try {
        const clerk = await clerkClient();
        await clerk.users.deleteUser(user.clerkId);
      } catch (error) {
        console.error("Failed to delete from Clerk:", error);
        // Continue anyway, database record is deleted
      }

      return this.createSuccessResponse(null, "User deleted successfully");
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.handleDatabaseError(error, "delete user");
    }
  }

  /**
   * Bulk user actions (admin only)
   */
  async bulkUserAction(
    userIds: string[],
    action: "activate" | "deactivate" | "delete"
  ) {
    try {
      switch (action) {
        case "activate":
          await this.db
            .update(users)
            .set({ isActive: true, updatedAt: new Date() })
            .where(inArray(users.id, userIds));
          break;

        case "deactivate":
          await this.db
            .update(users)
            .set({ isActive: false, updatedAt: new Date() })
            .where(inArray(users.id, userIds));
          break;

        case "delete":
          // Get clerk IDs first
          const usersToDelete = await this.db
            .select({ clerkId: users.clerkId })
            .from(users)
            .where(inArray(users.id, userIds));

          // Delete from database
          await this.db.delete(users).where(inArray(users.id, userIds));

          // Delete from Clerk
          const clerk = await clerkClient();
          for (const user of usersToDelete) {
            try {
              await clerk.users.deleteUser(user.clerkId);
            } catch (error) {
              console.error(
                `Failed to delete user ${user.clerkId} from Clerk:`,
                error
              );
            }
          }
          break;

        default:
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid action",
          });
      }

      return this.createSuccessResponse(
        null,
        `${action} completed for ${userIds.length} users`
      );
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.handleDatabaseError(error, `bulk ${action}`);
    }
  }

  /**
   * Reset user onboarding (development/testing only)
   */
  async resetOnboarding(clerkId: string) {
    try {
      // Reset user onboarding status
      await this.db
        .update(users)
        .set({
          onboardingComplete: false,
          role: "patient", // Default role
        })
        .where(eq(users.clerkId, clerkId));

      // Update Clerk metadata
      await this.updateClerkMetadata(clerkId, {
        onboardingComplete: false,
        role: "patient",
      });

      return this.createSuccessResponse(null, "Onboarding reset successfully");
    } catch (error) {
      this.handleDatabaseError(error, "reset onboarding");
    }
  }

  /**
   * Notify admins of new member joining
   */
  private async notifyAdminsOfNewMember(
    memberName: string,
    memberEmail: string,
    memberRole: "patient" | "doctor"
  ) {
    try {
      await notificationService.createNewMemberJoinedNotification(
        memberName,
        memberEmail,
        memberRole
      );
    } catch (error) {
      console.error("Failed to send new member notification:", error);
      // Don't throw error here as main operation should succeed
    }
  }
}

/**
 * Singleton instance for use across the application
 */
export const userService = new UserService();
