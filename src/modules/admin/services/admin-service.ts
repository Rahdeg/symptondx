import { BaseService } from "../../shared/services/base-service";
import { users, doctors, diagnosisSessions, aiUsageLogs } from "@/db/schema";
import { eq, desc, count, sum, avg, and, gte, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { notificationService } from "@/lib/notification-service";

// Environment variable for admin password
const ADMIN_PASSWORD = process.env.ADMIN_ACCESS_PASSWORD!;

export interface DoctorVerificationInput {
  doctorId: string;
  isVerified: boolean;
  notes?: string;
}

export interface GetDoctorVerificationsInput {
  doctorId?: string;
  status?: "pending" | "verified" | "rejected";
  limit: number;
  offset: number;
}

export interface SystemStatsInput {
  dateFrom?: string;
  dateTo?: string;
}

export interface SystemStats {
  users: Record<string, number>;
  diagnoses: { total: number; completed: number };
  aiUsage: {
    totalCost: number;
    totalTokens: number;
    avgProcessingTime: number;
  };
  doctors: { verified: number; pending: number };
}

/**
 * Admin service handling all admin-specific operations
 * Following Single Responsibility Principle
 */
export class AdminService extends BaseService {
  /**
   * Authenticate admin with password
   */
  async authenticateAdmin(clerkId: string, password: string) {
    try {
      await this.validateUserRole(clerkId, "admin");

      // Verify admin password
      if (password !== ADMIN_PASSWORD) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid admin password.",
        });
      }

      return this.createSuccessResponse(
        null,
        "Admin authentication successful"
      );
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.handleDatabaseError(error, "authenticate admin");
    }
  }

  /**
   * Get pending doctor verifications
   */
  async getPendingDoctorVerifications(input: GetDoctorVerificationsInput) {
    try {
      const { limit, offset, status } = input;
      const whereConditions = [];

      if (status === "pending") {
        whereConditions.push(eq(doctors.isVerified, false));
      } else if (status === "verified") {
        whereConditions.push(eq(doctors.isVerified, true));
      }

      const [doctorList, totalCount] = await Promise.all([
        this.db
          .select({
            doctor: doctors,
            user: {
              id: users.id,
              name: users.name,
              email: users.email,
              createdAt: users.createdAt,
            },
          })
          .from(doctors)
          .leftJoin(users, eq(doctors.userId, users.id))
          .where(
            whereConditions.length > 0 ? and(...whereConditions) : undefined
          )
          .limit(limit)
          .offset(offset)
          .orderBy(desc(doctors.createdAt)),

        this.db
          .select({ count: count() })
          .from(doctors)
          .where(
            whereConditions.length > 0 ? and(...whereConditions) : undefined
          ),
      ]);

      return {
        doctors: doctorList,
        total: totalCount[0]?.count || 0,
        hasMore: offset + limit < (totalCount[0]?.count || 0),
      };
    } catch (error) {
      this.handleDatabaseError(error, "get pending doctor verifications");
    }
  }

  /**
   * Verify or reject a doctor
   */
  async verifyDoctor(input: DoctorVerificationInput) {
    try {
      const { doctorId, isVerified, notes } = input;

      // First get the doctor with user info for notification
      const [doctorWithUser] = await this.db
        .select({
          doctor: doctors,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(doctors)
        .leftJoin(users, eq(doctors.userId, users.id))
        .where(eq(doctors.id, doctorId))
        .limit(1);

      if (!doctorWithUser || !doctorWithUser.user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doctor or associated user not found",
        });
      }

      const [updatedDoctor] = await this.db
        .update(doctors)
        .set({
          isVerified,
          updatedAt: new Date(),
        })
        .where(eq(doctors.id, doctorId))
        .returning();

      if (!updatedDoctor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doctor not found",
        });
      }

      // Send notification to doctor about verification status
      try {
        await notificationService.createDoctorVerificationCompleteNotification(
          doctorWithUser.user.id,
          isVerified,
          notes
        );
      } catch (error) {
        console.error("Failed to send verification notification:", error);
        // Don't throw error here as verification should complete successfully
      }

      return this.createSuccessResponse(
        updatedDoctor,
        `Doctor ${isVerified ? "verified" : "rejected"} successfully`
      );
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.handleDatabaseError(error, "verify doctor");
    }
  }

  /**
   * Get system statistics
   */
  async getSystemStats(input: SystemStatsInput): Promise<SystemStats> {
    try {
      const { dateFrom, dateTo } = input;

      const userDateFilter = [];
      if (dateFrom)
        userDateFilter.push(gte(users.createdAt, new Date(dateFrom)));
      if (dateTo) userDateFilter.push(lte(users.createdAt, new Date(dateTo)));

      const diagnosisDateFilter = [];
      if (dateFrom)
        diagnosisDateFilter.push(
          gte(diagnosisSessions.createdAt, new Date(dateFrom))
        );
      if (dateTo)
        diagnosisDateFilter.push(
          lte(diagnosisSessions.createdAt, new Date(dateTo))
        );

      const aiDateFilter = [];
      if (dateFrom)
        aiDateFilter.push(gte(aiUsageLogs.createdAt, new Date(dateFrom)));
      if (dateTo)
        aiDateFilter.push(lte(aiUsageLogs.createdAt, new Date(dateTo)));

      const [userStats, diagnosisStats, aiUsageStats, doctorStats] =
        await Promise.all([
          // User statistics
          this.db
            .select({
              role: users.role,
              count: count(),
            })
            .from(users)
            .where(
              and(
                eq(users.isActive, true),
                ...(userDateFilter.length > 0 ? userDateFilter : [])
              )
            )
            .groupBy(users.role),

          // Diagnosis statistics
          this.db
            .select({
              total: count(),
              completed: count(eq(diagnosisSessions.status, "completed")),
            })
            .from(diagnosisSessions)
            .where(
              diagnosisDateFilter.length > 0
                ? and(...diagnosisDateFilter)
                : undefined
            ),

          // AI usage statistics
          this.db
            .select({
              totalCost: sum(aiUsageLogs.cost),
              totalTokens: sum(aiUsageLogs.tokensUsed),
              avgProcessingTime: avg(aiUsageLogs.processingTime),
            })
            .from(aiUsageLogs)
            .where(aiDateFilter.length > 0 ? and(...aiDateFilter) : undefined),

          // Doctor verification stats
          this.db
            .select({
              verified: count(eq(doctors.isVerified, true)),
              pending: count(eq(doctors.isVerified, false)),
            })
            .from(doctors),
        ]);

      return {
        users: userStats.reduce((acc, stat) => {
          acc[stat.role] = stat.count;
          return acc;
        }, {} as Record<string, number>),
        diagnoses: diagnosisStats[0] || { total: 0, completed: 0 },
        aiUsage: {
          totalCost: aiUsageStats[0]?.totalCost
            ? Number(aiUsageStats[0].totalCost)
            : 0,
          totalTokens: aiUsageStats[0]?.totalTokens
            ? Number(aiUsageStats[0].totalTokens)
            : 0,
          avgProcessingTime: aiUsageStats[0]?.avgProcessingTime
            ? Number(aiUsageStats[0].avgProcessingTime)
            : 0,
        },
        doctors: doctorStats[0] || { verified: 0, pending: 0 },
      };
    } catch (error) {
      this.handleDatabaseError(error, "get system stats");
    }
  }

  /**
   * Update admin settings (placeholder implementation)
   */
  async updateAdminSettings(settings: {
    adminPassword?: string;
    systemMaintenanceMode?: boolean;
    allowNewRegistrations?: boolean;
    maxDailyDiagnoses?: number;
  }) {
    try {
      // For now, this would update environment variables or a settings table
      // This is a placeholder implementation
      console.log("Admin settings update requested:", settings);

      return this.createSuccessResponse(
        null,
        "Admin settings updated successfully"
      );
    } catch (error) {
      this.handleDatabaseError(error, "update admin settings");
    }
  }

  /**
   * Get admin dashboard overview
   */
  async getAdminDashboardOverview() {
    try {
      const [
        totalUsers,
        activeUsers,
        totalDoctors,
        verifiedDoctors,
        totalSessions,
        pendingSessions,
      ] = await Promise.all([
        this.db.select({ count: count() }).from(users),
        this.db
          .select({ count: count() })
          .from(users)
          .where(eq(users.isActive, true)),
        this.db.select({ count: count() }).from(doctors),
        this.db
          .select({ count: count() })
          .from(doctors)
          .where(eq(doctors.isVerified, true)),
        this.db.select({ count: count() }).from(diagnosisSessions),
        this.db
          .select({ count: count() })
          .from(diagnosisSessions)
          .where(eq(diagnosisSessions.status, "pending")),
      ]);

      return this.createSuccessResponse({
        users: {
          total: totalUsers[0]?.count || 0,
          active: activeUsers[0]?.count || 0,
        },
        doctors: {
          total: totalDoctors[0]?.count || 0,
          verified: verifiedDoctors[0]?.count || 0,
          pending:
            (totalDoctors[0]?.count || 0) - (verifiedDoctors[0]?.count || 0),
        },
        sessions: {
          total: totalSessions[0]?.count || 0,
          pending: pendingSessions[0]?.count || 0,
        },
      });
    } catch (error) {
      this.handleDatabaseError(error, "get admin dashboard overview");
    }
  }

  /**
   * Get recent activities for admin dashboard
   */
  async getRecentActivities(limit: number = 10) {
    try {
      // Get recent user registrations
      const recentUsers = await this.db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(limit);

      // Get recent diagnosis sessions
      const recentSessions = await this.db
        .select({
          id: diagnosisSessions.id,
          chiefComplaint: diagnosisSessions.chiefComplaint,
          status: diagnosisSessions.status,
          urgencyLevel: diagnosisSessions.urgencyLevel,
          isEmergency: diagnosisSessions.isEmergency,
          createdAt: diagnosisSessions.createdAt,
        })
        .from(diagnosisSessions)
        .orderBy(desc(diagnosisSessions.createdAt))
        .limit(limit);

      return this.createSuccessResponse({
        recentUsers,
        recentSessions,
      });
    } catch (error) {
      this.handleDatabaseError(error, "get recent activities");
    }
  }

  /**
   * Get system health metrics
   */
  async getSystemHealthMetrics() {
    try {
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [
        sessionsLast24Hours,
        sessionsLast7Days,
        aiUsageLast24Hours,
        errorRateLast24Hours,
      ] = await Promise.all([
        this.db
          .select({ count: count() })
          .from(diagnosisSessions)
          .where(gte(diagnosisSessions.createdAt, last24Hours)),

        this.db
          .select({ count: count() })
          .from(diagnosisSessions)
          .where(gte(diagnosisSessions.createdAt, last7Days)),

        this.db
          .select({
            totalCost: sum(aiUsageLogs.cost),
            totalTokens: sum(aiUsageLogs.tokensUsed),
            avgProcessingTime: avg(aiUsageLogs.processingTime),
          })
          .from(aiUsageLogs)
          .where(gte(aiUsageLogs.createdAt, last24Hours)),

        this.db
          .select({
            total: count(),
            errors: count(eq(aiUsageLogs.success, false)),
          })
          .from(aiUsageLogs)
          .where(gte(aiUsageLogs.createdAt, last24Hours)),
      ]);

      const errorRate = errorRateLast24Hours[0]
        ? (errorRateLast24Hours[0].errors / errorRateLast24Hours[0].total) * 100
        : 0;

      return this.createSuccessResponse({
        sessionsLast24Hours: sessionsLast24Hours[0]?.count || 0,
        sessionsLast7Days: sessionsLast7Days[0]?.count || 0,
        aiUsageLast24Hours: aiUsageLast24Hours[0] || {
          totalCost: 0,
          totalTokens: 0,
          avgProcessingTime: 0,
        },
        errorRate,
        systemStatus:
          errorRate < 5 ? "healthy" : errorRate < 15 ? "warning" : "critical",
      });
    } catch (error) {
      this.handleDatabaseError(error, "get system health metrics");
    }
  }
}

/**
 * Singleton instance for use across the application
 */
export const adminService = new AdminService();
