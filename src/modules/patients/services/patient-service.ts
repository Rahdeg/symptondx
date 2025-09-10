import { BaseService } from "../../shared/services/base-service";
import {
  patients,
  users,
  diagnosisSessions,
  doctors,
  doctorReviews,
} from "@/db/schema";
import { eq, desc, and, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export interface SymptomInput {
  symptoms: string[];
  duration: string;
  severity: "mild" | "moderate" | "severe";
  additionalNotes?: string;
}

export interface PatientDashboardStats {
  totalSessions: number;
  completedSessions: number;
  pendingReviews: number;
}

/**
 * Patient service handling all patient-specific operations
 * Following Single Responsibility Principle
 */
export class PatientService extends BaseService {
  /**
   * Get patient dashboard statistics
   */
  async getDashboardStats(clerkId: string): Promise<PatientDashboardStats> {
    try {
      const patientProfile = await this.getPatientProfile(clerkId);
      const patientId = patientProfile.patient.id;

      // Get total diagnosis sessions
      const [sessionCount] = await this.db
        .select({ count: count() })
        .from(diagnosisSessions)
        .where(eq(diagnosisSessions.patientId, patientId));

      // Get completed sessions
      const [completedCount] = await this.db
        .select({ count: count() })
        .from(diagnosisSessions)
        .where(
          and(
            eq(diagnosisSessions.patientId, patientId),
            eq(diagnosisSessions.status, "completed")
          )
        );

      // Get pending doctor reviews - sessions that have a doctor assigned but haven't been reviewed yet
      const [reviewCount] = await this.db
        .select({ count: count() })
        .from(diagnosisSessions)
        .where(
          and(
            eq(diagnosisSessions.patientId, patientId),
            eq(diagnosisSessions.status, "pending"),
            eq(diagnosisSessions.requiresDoctorReview, true)
          )
        );

      return {
        totalSessions: sessionCount.count,
        completedSessions: completedCount.count,
        pendingReviews: reviewCount.count,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.handleDatabaseError(error, "get patient dashboard stats");
    }
  }

  /**
   * Get patient diagnosis sessions with pagination
   */
  async getDiagnosisSessions(
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
      const patientProfile = await this.getPatientProfile(clerkId);
      const patientId = patientProfile.patient.id;

      const { page, limit, status } = options;
      const offset = (page - 1) * limit;
      const conditions = [eq(diagnosisSessions.patientId, patientId)];

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
      this.handleDatabaseError(error, "get diagnosis sessions");
    }
  }

  /**
   * Start new diagnosis session
   */
  async startDiagnosisSession(clerkId: string, input: SymptomInput) {
    try {
      const patientProfile = await this.getPatientProfile(clerkId);
      const patientId = patientProfile.patient.id;

      const session = await this.db
        .insert(diagnosisSessions)
        .values({
          patientId: patientId,
          chiefComplaint: input.symptoms.join(", "),
          additionalInfo: `Duration: ${input.duration}, Severity: ${
            input.severity
          }${input.additionalNotes ? `, Notes: ${input.additionalNotes}` : ""}`,
          status: "pending",
          urgencyLevel: input.severity === "severe" ? "high" : "medium",
        })
        .returning();

      return this.createSuccessResponse(session[0]);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.handleDatabaseError(error, "start diagnosis session");
    }
  }

  /**
   * Update patient profile
   */
  async updateProfile(
    clerkId: string,
    updateData: {
      name?: string;
      phoneNumber?: string;
      address?: string;
      medicalHistory?: string[];
      currentMedications?: string[];
      allergies?: string[];
    }
  ) {
    try {
      const patientProfile = await this.getPatientProfile(clerkId);
      const patientId = patientProfile.patient.id;

      // Update user name if provided
      if (updateData.name) {
        await this.db
          .update(users)
          .set({ name: updateData.name })
          .where(eq(users.clerkId, clerkId));
      }

      // Update patient fields
      const patientUpdate: Record<string, unknown> = {};
      if (updateData.phoneNumber)
        patientUpdate.phoneNumber = updateData.phoneNumber;
      if (updateData.address) patientUpdate.address = updateData.address;
      if (updateData.medicalHistory)
        patientUpdate.medicalHistory = updateData.medicalHistory;
      if (updateData.currentMedications)
        patientUpdate.currentMedications = updateData.currentMedications;
      if (updateData.allergies) patientUpdate.allergies = updateData.allergies;

      if (Object.keys(patientUpdate).length > 0) {
        patientUpdate.updatedAt = new Date();

        const [updatedPatient] = await this.db
          .update(patients)
          .set(patientUpdate)
          .where(eq(patients.id, patientId))
          .returning();

        return this.createSuccessResponse(updatedPatient);
      }

      return this.createSuccessResponse(null, "No changes to update");
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.handleDatabaseError(error, "update patient profile");
    }
  }

  /**
   * Get pending doctor reviews for patient
   */
  async getPendingDoctorReviews(clerkId: string) {
    try {
      const patientProfile = await this.getPatientProfile(clerkId);
      const patientId = patientProfile.patient.id;

      const pendingReviews = await this.db
        .select({
          id: diagnosisSessions.id,
          chiefComplaint: diagnosisSessions.chiefComplaint,
          additionalInfo: diagnosisSessions.additionalInfo,
          status: diagnosisSessions.status,
          urgencyLevel: diagnosisSessions.urgencyLevel,
          isEmergency: diagnosisSessions.isEmergency,
          createdAt: diagnosisSessions.createdAt,
          doctorName: users.name,
          doctorSpecialization: doctors.specialization,
        })
        .from(diagnosisSessions)
        .leftJoin(doctors, eq(diagnosisSessions.doctorId, doctors.id))
        .leftJoin(users, eq(doctors.userId, users.id))
        .where(
          and(
            eq(diagnosisSessions.patientId, patientId),
            eq(diagnosisSessions.requiresDoctorReview, true),
            eq(diagnosisSessions.status, "pending")
          )
        )
        .orderBy(desc(diagnosisSessions.createdAt));

      return this.createSuccessResponse(pendingReviews);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.handleDatabaseError(error, "get pending doctor reviews");
    }
  }

  /**
   * Get doctor review history for patient
   */
  async getDoctorReviewHistory(
    clerkId: string,
    options: {
      page: number;
      limit: number;
    }
  ) {
    try {
      const patientProfile = await this.getPatientProfile(clerkId);
      const patientId = patientProfile.patient.id;

      const { page, limit } = options;
      const offset = (page - 1) * limit;

      // First get the diagnosis sessions
      const sessions = await this.db
        .select({
          sessionId: diagnosisSessions.id,
          chiefComplaint: diagnosisSessions.chiefComplaint,
          finalDiagnosis: diagnosisSessions.finalDiagnosis,
          doctorNotes: diagnosisSessions.doctorNotes,
          confidence_score: diagnosisSessions.confidence_score,
          status: diagnosisSessions.status,
          completedAt: diagnosisSessions.completedAt,
          doctorId: diagnosisSessions.doctorId,
        })
        .from(diagnosisSessions)
        .where(
          and(
            eq(diagnosisSessions.patientId, patientId),
            eq(diagnosisSessions.status, "reviewed")
          )
        )
        .orderBy(desc(diagnosisSessions.completedAt))
        .limit(limit)
        .offset(offset);

      // Then get doctor info and reviews for each session
      const reviewHistory = await Promise.all(
        sessions.map(async (session) => {
          let doctorInfo = null;
          let doctorReview = null;

          // Get doctor info if doctorId exists
          if (session.doctorId) {
            const [doctorData] = await this.db
              .select({
                doctorName: users.name,
                doctorSpecialization: doctors.specialization,
              })
              .from(doctors)
              .leftJoin(users, eq(doctors.userId, users.id))
              .where(eq(doctors.id, session.doctorId))
              .limit(1);
            doctorInfo = doctorData;
          }

          // Get doctor review
          const [reviewData] = await this.db
            .select({
              finalDiagnosis: doctorReviews.finalDiagnosis,
              confidence: doctorReviews.confidence,
              notes: doctorReviews.notes,
              agreesWithML: doctorReviews.agreesWithML,
              recommendedActions: doctorReviews.recommendedActions,
              createdAt: doctorReviews.createdAt,
            })
            .from(doctorReviews)
            .where(eq(doctorReviews.sessionId, session.sessionId))
            .limit(1);
          doctorReview = reviewData;

          return {
            sessionId: session.sessionId,
            chiefComplaint: session.chiefComplaint,
            finalDiagnosis: session.finalDiagnosis,
            doctorNotes: session.doctorNotes,
            confidence_score: session.confidence_score,
            status: session.status,
            completedAt: session.completedAt,
            doctorName: doctorInfo?.doctorName || null,
            doctorSpecialization: doctorInfo?.doctorSpecialization || null,
            doctorReview: doctorReview || null,
          };
        })
      );

      return this.createSuccessResponse(reviewHistory);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.handleDatabaseError(error, "get doctor review history");
    }
  }

  /**
   * Get detailed case status for patient
   */
  async getCaseStatus(clerkId: string, sessionId: string) {
    try {
      const patientProfile = await this.getPatientProfile(clerkId);
      const patientId = patientProfile.patient.id;

      const caseDetails = await this.db
        .select({
          id: diagnosisSessions.id,
          status: diagnosisSessions.status,
          chiefComplaint: diagnosisSessions.chiefComplaint,
          additionalInfo: diagnosisSessions.additionalInfo,
          finalDiagnosis: diagnosisSessions.finalDiagnosis,
          doctorNotes: diagnosisSessions.doctorNotes,
          confidence_score: diagnosisSessions.confidence_score,
          urgencyLevel: diagnosisSessions.urgencyLevel,
          isEmergency: diagnosisSessions.isEmergency,
          requiresDoctorReview: diagnosisSessions.requiresDoctorReview,
          createdAt: diagnosisSessions.createdAt,
          updatedAt: diagnosisSessions.updatedAt,
          completedAt: diagnosisSessions.completedAt,
          doctorName: users.name,
          doctorSpecialization: doctors.specialization,
          doctorEmail: users.email,
        })
        .from(diagnosisSessions)
        .leftJoin(doctors, eq(diagnosisSessions.doctorId, doctors.id))
        .leftJoin(users, eq(doctors.userId, users.id))
        .where(
          and(
            eq(diagnosisSessions.id, sessionId),
            eq(diagnosisSessions.patientId, patientId)
          )
        )
        .limit(1);

      if (!caseDetails.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Case not found",
        });
      }

      return this.createSuccessResponse(caseDetails[0]);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.handleDatabaseError(error, "get case status");
    }
  }
}

/**
 * Singleton instance for use across the application
 */
export const patientService = new PatientService();
