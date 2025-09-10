import { BaseService } from "../../shared/services/base-service";
import {
  doctors,
  users,
  diagnosisSessions,
  doctorReviews,
  notifications,
  patients,
} from "@/db/schema";
import { eq, desc, and, count, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export interface DiagnosisReviewInput {
  diagnosisSessionId: string;
  doctorDiagnosis: string;
  confidence: number;
  recommendedTreatment?: string;
  notes?: string;
}

export interface DoctorDashboardStats {
  totalSessions: number;
  pendingReviews: number;
  completedReviews: number;
}

export interface DoctorReviewMetrics {
  totalCases: number;
  completedReviews: number;
  pendingReviews: number;
  completionRate: number;
}

/**
 * Doctor service handling all doctor-specific operations
 * Following Single Responsibility Principle
 */
export class DoctorService extends BaseService {
  /**
   * Get available doctors for patient selection
   */
  async getAvailableDoctors(options: {
    specialization?: string;
    limit?: number;
  }) {
    try {
      const { specialization, limit = 20 } = options;
      const conditions = [eq(doctors.isVerified, true)];

      if (specialization) {
        conditions.push(eq(doctors.specialization, specialization));
      }

      const whereCondition =
        conditions.length > 1 ? and(...conditions) : conditions[0];

      const availableDoctors = await this.db
        .select({
          id: doctors.id,
          licenseNumber: doctors.licenseNumber,
          specialization: doctors.specialization,
          yearsOfExperience: doctors.yearsOfExperience,
          qualifications: doctors.qualifications,
          hospitalAffiliations: doctors.hospitalAffiliations,
          name: users.name,
          email: users.email,
        })
        .from(doctors)
        .innerJoin(users, eq(doctors.userId, users.id))
        .where(whereCondition)
        .limit(limit);

      return this.createSuccessResponse(availableDoctors);
    } catch (error) {
      this.handleDatabaseError(error, "get available doctors");
    }
  }

  /**
   * Get doctor specializations
   */
  async getSpecializations() {
    try {
      const specializations = await this.db
        .selectDistinct({ specialization: doctors.specialization })
        .from(doctors)
        .where(eq(doctors.isVerified, true));

      const uniqueSpecializations = specializations
        .map((s) => s.specialization)
        .filter(Boolean)
        .sort();

      return this.createSuccessResponse(uniqueSpecializations);
    } catch (error) {
      this.handleDatabaseError(error, "get specializations");
    }
  }

  /**
   * Assign doctor to a diagnosis session
   */
  async assignDoctorToSession(sessionId: string, doctorId: string) {
    try {
      // Verify the doctor exists and is verified
      const [doctorData] = await this.db
        .select({ id: doctors.id, isVerified: doctors.isVerified })
        .from(doctors)
        .where(eq(doctors.id, doctorId))
        .limit(1);

      if (!doctorData || !doctorData.isVerified) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doctor not found or not verified",
        });
      }

      // Update the diagnosis session with the selected doctor
      const [updatedSession] = await this.db
        .update(diagnosisSessions)
        .set({
          doctorId: doctorId,
          status: "pending", // Change status to pending for doctor review
          requiresDoctorReview: true,
        })
        .where(eq(diagnosisSessions.id, sessionId))
        .returning();

      // Get doctor's user ID for notification
      const [doctorUser] = await this.db
        .select({ userId: users.id })
        .from(doctors)
        .innerJoin(users, eq(doctors.userId, users.id))
        .where(eq(doctors.id, doctorId))
        .limit(1);

      // Create notification for the doctor
      if (doctorUser) {
        await this.db.insert(notifications).values({
          userId: doctorUser.userId,
          type: "doctor_review_needed",
          title: "New Case Assignment",
          message: "You have been assigned a new diagnosis case for review",
          data: {
            sessionId: sessionId,
            patientId: updatedSession.patientId,
          },
        });
      }

      return this.createSuccessResponse(updatedSession);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.handleDatabaseError(error, "assign doctor to session");
    }
  }

  /**
   * Get doctor dashboard statistics
   */
  async getDashboardStats(clerkId: string): Promise<DoctorDashboardStats> {
    try {
      const doctorProfile = await this.getDoctorProfile(clerkId);
      const doctorId = doctorProfile.doctor.id;

      // Get total assigned sessions
      const [sessionCount] = await this.db
        .select({ count: count() })
        .from(diagnosisSessions)
        .where(eq(diagnosisSessions.doctorId, doctorId));

      // Get pending reviews - sessions assigned to this doctor that need review
      const [pendingCount] = await this.db
        .select({ count: count() })
        .from(diagnosisSessions)
        .where(
          and(
            eq(diagnosisSessions.doctorId, doctorId),
            eq(diagnosisSessions.status, "pending"),
            eq(diagnosisSessions.requiresDoctorReview, true)
          )
        );

      // Get completed reviews
      const [completedCount] = await this.db
        .select({ count: count() })
        .from(doctorReviews)
        .where(eq(doctorReviews.doctorId, doctorId));

      return {
        totalSessions: sessionCount.count,
        pendingReviews: pendingCount.count,
        completedReviews: completedCount.count,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.handleDatabaseError(error, "get doctor dashboard stats");
    }
  }

  /**
   * Get assigned diagnosis sessions for review
   */
  async getAssignedSessions(
    clerkId: string,
    options: {
      page: number;
      limit: number;
      status?:
        | "pending"
        | "in_progress"
        | "completed"
        | "reviewed"
        | "cancelled";
    }
  ) {
    try {
      const doctorProfile = await this.getDoctorProfile(clerkId);
      const doctorId = doctorProfile.doctor.id;

      const { page, limit, status } = options;
      const offset = (page - 1) * limit;
      const conditions = [eq(diagnosisSessions.doctorId, doctorId)];

      if (status) {
        conditions.push(eq(diagnosisSessions.status, status));
      }

      const whereCondition =
        conditions.length > 1 ? and(...conditions) : conditions[0];

      const sessionsList = await this.db
        .select({
          id: diagnosisSessions.id,
          chiefComplaint: diagnosisSessions.chiefComplaint,
          additionalInfo: diagnosisSessions.additionalInfo,
          status: diagnosisSessions.status,
          finalDiagnosis: diagnosisSessions.finalDiagnosis,
          confidence_score: diagnosisSessions.confidence_score,
          urgencyLevel: diagnosisSessions.urgencyLevel,
          isEmergency: diagnosisSessions.isEmergency,
          requiresDoctorReview: diagnosisSessions.requiresDoctorReview,
          createdAt: diagnosisSessions.createdAt,
        })
        .from(diagnosisSessions)
        .where(whereCondition)
        .orderBy(desc(diagnosisSessions.createdAt))
        .limit(limit)
        .offset(offset);

      const [totalCount] = await this.db
        .select({ count: count() })
        .from(diagnosisSessions)
        .where(whereCondition);

      return {
        sessions: sessionsList,
        totalCount: totalCount.count,
        totalPages: Math.ceil(totalCount.count / limit),
        currentPage: page,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.handleDatabaseError(error, "get assigned sessions");
    }
  }

  /**
   * Submit diagnosis review
   */
  async submitDiagnosisReview(clerkId: string, input: DiagnosisReviewInput) {
    try {
      const doctorProfile = await this.getDoctorProfile(clerkId);
      const doctorId = doctorProfile.doctor.id;

      // Get the diagnosis session to find the patient
      const [sessionData] = await this.db
        .select({
          patientId: diagnosisSessions.patientId,
          chiefComplaint: diagnosisSessions.chiefComplaint,
        })
        .from(diagnosisSessions)
        .where(eq(diagnosisSessions.id, input.diagnosisSessionId))
        .limit(1);

      if (!sessionData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Diagnosis session not found",
        });
      }

      // Get patient's user ID for notification
      const [patientUser] = await this.db
        .select({ userId: users.id })
        .from(patients)
        .innerJoin(users, eq(patients.userId, users.id))
        .where(eq(patients.id, sessionData.patientId))
        .limit(1);

      // Create doctor review
      const [review] = await this.db
        .insert(doctorReviews)
        .values({
          sessionId: input.diagnosisSessionId,
          doctorId: doctorId,
          finalDiagnosis: input.doctorDiagnosis,
          confidence: Math.floor(input.confidence * 10), // Convert to 1-10 scale
          notes: input.notes,
          agreesWithML: true, // We'll determine this based on confidence
          recommendedActions: input.recommendedTreatment
            ? [input.recommendedTreatment]
            : [],
        })
        .returning();

      // Update the diagnosis session
      await this.db
        .update(diagnosisSessions)
        .set({
          status: "reviewed",
          finalDiagnosis: input.doctorDiagnosis,
          doctorNotes: input.notes,
          confidence_score: input.confidence.toString(),
          completedAt: new Date(),
        })
        .where(eq(diagnosisSessions.id, input.diagnosisSessionId));

      // Update patient's medical history with the new diagnosis
      await this.updatePatientMedicalHistory(
        sessionData.patientId,
        input.doctorDiagnosis
      );

      // Create notification for the patient
      if (patientUser) {
        await this.db.insert(notifications).values({
          userId: patientUser.userId,
          type: "doctor_review_complete",
          title: "✅ Doctor Review Complete",
          message: `Your diagnosis for "${sessionData.chiefComplaint}" has been reviewed by a doctor. Final diagnosis: ${input.doctorDiagnosis}`,
          data: {
            sessionId: input.diagnosisSessionId,
            diagnosis: input.doctorDiagnosis,
            doctorId: doctorId,
            confidence: input.confidence,
          },
          isRead: false,
        });
      }

      return this.createSuccessResponse(review);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.handleDatabaseError(error, "submit diagnosis review");
    }
  }

  /**
   * Update doctor profile
   */
  async updateProfile(
    clerkId: string,
    updateData: {
      name?: string;
      specialization?: string;
      phoneNumber?: string;
      yearsOfExperience?: number;
    }
  ) {
    try {
      const doctorProfile = await this.getDoctorProfile(clerkId);
      const doctorId = doctorProfile.doctor.id;

      // Update user name if provided
      if (updateData.name) {
        await this.db
          .update(users)
          .set({ name: updateData.name })
          .where(eq(users.clerkId, clerkId));
      }

      // Update doctor fields
      const doctorUpdate: Record<string, unknown> = {};
      if (updateData.specialization)
        doctorUpdate.specialization = updateData.specialization;
      if (updateData.phoneNumber)
        doctorUpdate.phoneNumber = updateData.phoneNumber;
      if (updateData.yearsOfExperience !== undefined)
        doctorUpdate.yearsOfExperience = updateData.yearsOfExperience;

      if (Object.keys(doctorUpdate).length > 0) {
        doctorUpdate.updatedAt = new Date();

        const [updatedDoctor] = await this.db
          .update(doctors)
          .set(doctorUpdate)
          .where(eq(doctors.id, doctorId))
          .returning();

        return this.createSuccessResponse(updatedDoctor);
      }

      return this.createSuccessResponse(null, "No changes to update");
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.handleDatabaseError(error, "update doctor profile");
    }
  }

  /**
   * Get urgent cases for doctor dashboard
   */
  async getUrgentCases(clerkId: string) {
    try {
      const doctorProfile = await this.getDoctorProfile(clerkId);
      const doctorId = doctorProfile.doctor.id;

      const urgentCases = await this.db
        .select({
          id: diagnosisSessions.id,
          chiefComplaint: diagnosisSessions.chiefComplaint,
          additionalInfo: diagnosisSessions.additionalInfo,
          status: diagnosisSessions.status,
          urgencyLevel: diagnosisSessions.urgencyLevel,
          isEmergency: diagnosisSessions.isEmergency,
          createdAt: diagnosisSessions.createdAt,
          patientName: users.name,
          patientAge: patients.dateOfBirth,
          patientGender: patients.gender,
        })
        .from(diagnosisSessions)
        .leftJoin(patients, eq(diagnosisSessions.patientId, patients.id))
        .leftJoin(users, eq(patients.userId, users.id))
        .where(
          and(
            eq(diagnosisSessions.doctorId, doctorId),
            eq(diagnosisSessions.status, "pending")
          )
        )
        .orderBy(
          desc(diagnosisSessions.isEmergency),
          desc(diagnosisSessions.urgencyLevel),
          desc(diagnosisSessions.createdAt)
        )
        .limit(10);

      return this.createSuccessResponse(urgentCases);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.handleDatabaseError(error, "get urgent cases");
    }
  }

  /**
   * Get review metrics for doctor
   */
  async getReviewMetrics(
    clerkId: string,
    period: "today" | "week" | "month" = "week"
  ): Promise<DoctorReviewMetrics> {
    try {
      const doctorProfile = await this.getDoctorProfile(clerkId);
      const doctorId = doctorProfile.doctor.id;

      // Calculate date range based on period
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // Get total cases assigned to this doctor in the period
      const [totalCasesResult] = await this.db
        .select({ count: count() })
        .from(diagnosisSessions)
        .where(
          and(
            eq(diagnosisSessions.doctorId, doctorId),
            gte(diagnosisSessions.createdAt, startDate)
          )
        );

      // Get completed reviews
      const [completedReviewsResult] = await this.db
        .select({ count: count() })
        .from(doctorReviews)
        .innerJoin(
          diagnosisSessions,
          eq(doctorReviews.sessionId, diagnosisSessions.id)
        )
        .where(
          and(
            eq(doctorReviews.doctorId, doctorId),
            gte(diagnosisSessions.createdAt, startDate)
          )
        );

      // Get pending reviews
      const [pendingReviewsResult] = await this.db
        .select({ count: count() })
        .from(diagnosisSessions)
        .where(
          and(
            eq(diagnosisSessions.doctorId, doctorId),
            eq(diagnosisSessions.status, "pending"),
            eq(diagnosisSessions.requiresDoctorReview, true),
            gte(diagnosisSessions.createdAt, startDate)
          )
        );

      const totalCases = totalCasesResult?.count || 0;
      const completedReviews = completedReviewsResult?.count || 0;
      const pendingReviews = pendingReviewsResult?.count || 0;

      return {
        totalCases,
        completedReviews,
        pendingReviews,
        completionRate:
          totalCases > 0 ? (completedReviews / totalCases) * 100 : 0,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.handleDatabaseError(error, "get review metrics");
    }
  }

  /**
   * Private helper to update patient medical history
   */
  private async updatePatientMedicalHistory(
    patientId: string,
    newDiagnosis: string
  ) {
    try {
      const [patientData] = await this.db
        .select({
          medicalHistory: patients.medicalHistory,
        })
        .from(patients)
        .where(eq(patients.id, patientId))
        .limit(1);

      if (patientData) {
        const currentHistory = patientData.medicalHistory || [];
        const diagnosisWithDate = `${newDiagnosis} (${new Date().toLocaleDateString()})`;

        // Add the new diagnosis to medical history if it's not already there
        if (!currentHistory.includes(diagnosisWithDate)) {
          await this.db
            .update(patients)
            .set({
              medicalHistory: [...currentHistory, diagnosisWithDate],
              updatedAt: new Date(),
            })
            .where(eq(patients.id, patientId));
        }
      }
    } catch (error) {
      console.error("Failed to update patient medical history:", error);
      // Don't throw error here as the main operation should succeed
    }
  }
}

/**
 * Singleton instance for use across the application
 */
export const doctorService = new DoctorService();
