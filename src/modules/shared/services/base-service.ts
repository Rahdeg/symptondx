import { db } from "@/db";
import { users, patients, doctors, admins } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";

export type UserRole = "patient" | "doctor" | "admin";

export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean | null;
  onboardingComplete: boolean | null;
}

export interface PatientProfile extends UserProfile {
  patient: {
    id: string;
    dateOfBirth: Date | null;
    gender: string | null;
    phoneNumber: string | null;
    address: string | null;
    emergencyContact: string | null;
    emergencyPhone: string | null;
    medicalHistory: string[] | null;
    allergies: string[] | null;
    currentMedications: string[] | null;
  };
}

export interface DoctorProfile extends UserProfile {
  doctor: {
    id: string;
    licenseNumber: string;
    specialization: string | null;
    yearsOfExperience: number | null;
    phoneNumber: string | null;
    qualifications: string | null;
    hospitalAffiliations: string | null;
    isVerified: boolean | null;
  };
}

export interface AdminProfile extends UserProfile {
  admin: {
    id: string;
    organizationName: string;
    jobTitle: string;
    phoneNumber: string;
    department: string | null;
    managementLevel: string;
    systemPermissions: string[] | null;
    preferredNotifications: string[] | null;
    isActive: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };
}

/**
 * Base service class providing common operations for all modules
 * Following Single Responsibility Principle and Dependency Inversion Principle
 */
export class BaseService {
  protected db = db;

  /**
   * Get user by Clerk ID - eliminates DRY violation
   */
  async getUserByClerkId(clerkId: string): Promise<UserProfile> {
    const [user] = await this.db
      .select({
        id: users.id,
        clerkId: users.clerkId,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
        onboardingComplete: users.onboardingComplete,
      })
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }

  /**
   * Get patient profile with user data
   */
  async getPatientProfile(clerkId: string): Promise<PatientProfile> {
    const user = await this.getUserByClerkId(clerkId);

    if (user.role !== "patient") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "This resource is only available to patients",
      });
    }

    const [patientData] = await this.db
      .select()
      .from(patients)
      .where(eq(patients.userId, user.id))
      .limit(1);

    if (!patientData) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Patient profile not found",
      });
    }

    return {
      ...user,
      patient: patientData,
    };
  }

  /**
   * Get doctor profile with user data
   */
  async getDoctorProfile(clerkId: string): Promise<DoctorProfile> {
    const user = await this.getUserByClerkId(clerkId);

    if (user.role !== "doctor") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "This resource is only available to doctors",
      });
    }

    const [doctorData] = await this.db
      .select()
      .from(doctors)
      .where(eq(doctors.userId, user.id))
      .limit(1);

    if (!doctorData) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Doctor profile not found",
      });
    }

    return {
      ...user,
      doctor: doctorData,
    };
  }

  /**
   * Get admin profile with user data
   */
  async getAdminProfile(clerkId: string): Promise<AdminProfile> {
    const user = await this.getUserByClerkId(clerkId);

    if (user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "This resource is only available to administrators",
      });
    }

    const [adminData] = await this.db
      .select()
      .from(admins)
      .where(eq(admins.userId, user.id))
      .limit(1);

    if (!adminData) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Admin profile not found",
      });
    }

    return {
      ...user,
      admin: adminData,
    };
  }

  /**
   * Update Clerk metadata - eliminates DRY violation
   */
  async updateClerkMetadata(
    clerkId: string,
    metadata: {
      role?: UserRole;
      onboardingComplete?: boolean;
      onboardingStep?: string;
    }
  ): Promise<void> {
    try {
      const clerk = await clerkClient();
      await clerk.users.updateUser(clerkId, {
        publicMetadata: metadata,
      });
    } catch (error) {
      console.error("Failed to update Clerk metadata:", error);
      // Don't throw error here as the main operation should succeed
    }
  }

  /**
   * Validate user exists and has required role
   */
  async validateUserRole(
    clerkId: string,
    requiredRole: UserRole
  ): Promise<UserProfile> {
    const user = await this.getUserByClerkId(clerkId);

    if (user.role !== requiredRole) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `This resource is only available to ${requiredRole}s`,
      });
    }

    return user;
  }

  /**
   * Check if user has completed onboarding
   */
  async validateOnboardingComplete(clerkId: string): Promise<UserProfile> {
    const user = await this.getUserByClerkId(clerkId);

    if (!user.onboardingComplete) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You must complete onboarding before accessing this resource",
      });
    }

    return user;
  }

  /**
   * Create standardized success response
   */
  createSuccessResponse<T>(
    data: T,
    message?: string
  ): { success: true; data: T; message?: string } {
    return {
      success: true,
      data,
      ...(message && { message }),
    };
  }

  /**
   * Handle database errors consistently
   */
  protected handleDatabaseError(error: unknown, operation: string): never {
    console.error(`Database error during ${operation}:`, error);

    if (error instanceof Error) {
      if (
        error.message.includes("duplicate") ||
        error.message.includes("unique")
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Resource already exists",
        });
      }

      if (
        error.message.includes("foreign key") ||
        error.message.includes("references")
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid reference to related resource",
        });
      }
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to ${operation}`,
    });
  }
}

/**
 * Singleton instance for use across the application
 */
export const baseService = new BaseService();
