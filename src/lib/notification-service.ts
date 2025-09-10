import { db } from "@/db";
import { notifications, users, admins } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export type NotificationType =
  | "diagnosis_complete"
  | "doctor_review_needed"
  | "doctor_review_complete"
  | "high_risk_alert"
  | "follow_up_reminder"
  | "system_update"
  | "ai_processing_started"
  | "rate_limit_exceeded"
  | "usage_limit_exceeded"
  | "ai_processing_failed"
  | "new_member_joined"
  | "doctor_verification_needed"
  | "doctor_verification_complete";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
}

class NotificationService {
  // Create a new notification
  async createNotification(input: CreateNotificationInput) {
    try {
      const [notification] = await db
        .insert(notifications)
        .values({
          userId: input.userId,
          type: input.type,
          title: input.title,
          message: input.message,
          data: input.data,
          isRead: false,
        })
        .returning();

      // Trigger real-time notification if user is online
      await this.triggerRealTimeNotification(
        notification as Record<string, unknown>
      );

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  // Get user notifications
  async getUserNotifications(
    userId: string,
    options: {
      includeRead?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const { includeRead = false, limit = 20, offset = 0 } = options;

    try {
      const conditions = [eq(notifications.userId, userId)];

      if (!includeRead) {
        conditions.push(eq(notifications.isRead, false));
      }

      const userNotifications = await db
        .select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset);

      // Get unread count
      const unreadCount = await db
        .select({ count: notifications.id })
        .from(notifications)
        .where(
          and(eq(notifications.userId, userId), eq(notifications.isRead, false))
        );

      return {
        notifications: userNotifications,
        unreadCount: unreadCount.length,
      };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return {
        notifications: [],
        unreadCount: 0,
      };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string) {
    try {
      await db
        .update(notifications)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, userId)
          )
        );

      return { success: true };
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return { success: false, error: "Failed to mark notification as read" };
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string) {
    try {
      await db
        .update(notifications)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(eq(notifications.userId, userId), eq(notifications.isRead, false))
        );

      return { success: true };
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return {
        success: false,
        error: "Failed to mark all notifications as read",
      };
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string, userId: string) {
    try {
      await db
        .delete(notifications)
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, userId)
          )
        );

      return { success: true };
    } catch (error) {
      console.error("Error deleting notification:", error);
      return { success: false, error: "Failed to delete notification" };
    }
  }

  // Trigger real-time notification (placeholder for WebSocket implementation)
  private async triggerRealTimeNotification(
    notification: Record<string, unknown>
  ) {
    // TODO: Implement WebSocket notification
    console.log("🔔 Real-time notification triggered:", notification.title);

    // For now, we'll just log it
    // In a real implementation, this would send via WebSocket to connected clients
  }

  // Create diagnosis complete notification
  async createDiagnosisCompleteNotification(
    userId: string,
    sessionId: string,
    confidence: number
  ) {
    const title = "Diagnosis Analysis Complete";
    const message = `Your symptom analysis is complete with ${(
      confidence * 100
    ).toFixed(1)}% confidence. View your results now.`;

    return this.createNotification({
      userId,
      type: "diagnosis_complete",
      title,
      message,
      data: { sessionId, confidence },
    });
  }

  // Create doctor review needed notification
  async createDoctorReviewNotification(
    userId: string,
    sessionId: string,
    doctorName: string
  ) {
    const title = "Doctor Review Required";
    const message = `Dr. ${doctorName} has been assigned to review your diagnosis. You'll be notified when the review is complete.`;

    return this.createNotification({
      userId,
      type: "doctor_review_needed",
      title,
      message,
      data: { sessionId, doctorName },
    });
  }

  // Create high risk alert notification
  async createHighRiskAlertNotification(
    userId: string,
    sessionId: string,
    riskLevel: string
  ) {
    const title = "High Risk Alert";
    const message = `Your symptoms indicate a ${riskLevel} risk condition. Please consult with a healthcare provider immediately.`;

    return this.createNotification({
      userId,
      type: "high_risk_alert",
      title,
      message,
      data: { sessionId, riskLevel },
    });
  }

  // Create follow-up reminder notification
  async createFollowUpReminderNotification(
    userId: string,
    sessionId: string,
    daysSince: number
  ) {
    const title = "Follow-up Reminder";
    const message = `It's been ${daysSince} days since your diagnosis. How are you feeling? Consider updating your health status.`;

    return this.createNotification({
      userId,
      type: "follow_up_reminder",
      title,
      message,
      data: { sessionId, daysSince },
    });
  }

  // Create system update notification
  async createSystemUpdateNotification(
    userId: string,
    updateType: string,
    description: string
  ) {
    const title = "System Update";
    const message = `New ${updateType}: ${description}`;

    return this.createNotification({
      userId,
      type: "system_update",
      title,
      message,
      data: { updateType, description },
    });
  }

  // Bulk create notifications for multiple users
  async createBulkNotifications(
    userIds: string[],
    input: Omit<CreateNotificationInput, "userId">
  ) {
    const notificationPromises = userIds.map((userId) =>
      this.createNotification({ ...input, userId })
    );

    try {
      const results = await Promise.allSettled(notificationPromises);
      const successful = results.filter(
        (result) => result.status === "fulfilled"
      ).length;
      const failed = results.filter(
        (result) => result.status === "rejected"
      ).length;

      return {
        success: true,
        successful,
        failed,
        total: userIds.length,
      };
    } catch (error) {
      console.error("Error creating bulk notifications:", error);
      return {
        success: false,
        error: "Failed to create bulk notifications",
      };
    }
  }

  // Get notification statistics
  async getNotificationStats(userId: string) {
    try {
      const [totalNotifications] = await db
        .select({ count: notifications.id })
        .from(notifications)
        .where(eq(notifications.userId, userId));

      const [unreadNotifications] = await db
        .select({ count: notifications.id })
        .from(notifications)
        .where(
          and(eq(notifications.userId, userId), eq(notifications.isRead, false))
        );

      // Get notifications by type
      const notificationsByType = await db
        .select({
          type: notifications.type,
          count: notifications.id,
        })
        .from(notifications)
        .where(eq(notifications.userId, userId));

      return {
        total: totalNotifications.count,
        unread: unreadNotifications.count,
        byType: notificationsByType.reduce((acc, notif) => {
          acc[notif.type] = (acc[notif.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
    } catch (error) {
      console.error("Error getting notification stats:", error);
      return {
        total: 0,
        unread: 0,
        byType: {},
      };
    }
  }

  // Get all admin user IDs
  async getAllAdminUserIds(): Promise<string[]> {
    try {
      // First try to get from admins table (for users who completed full admin onboarding)
      const adminProfileUsers = await db
        .select({ userId: admins.userId })
        .from(admins)
        .leftJoin(users, eq(admins.userId, users.id))
        .where(and(eq(users.isActive, true), eq(admins.isActive, true)));

      // Also get users with role "admin" (for basic admin users)
      const adminRoleUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.role, "admin"), eq(users.isActive, true)));

      // Combine both sets and remove duplicates
      const adminUserIds = new Set([
        ...adminProfileUsers.map((admin) => admin.userId),
        ...adminRoleUsers.map((user) => user.id),
      ]);

      return Array.from(adminUserIds);
    } catch (error) {
      console.error("Error getting admin user IDs:", error);
      return [];
    }
  }

  // Create new member joined notification for admins
  async createNewMemberJoinedNotification(
    newMemberName: string,
    newMemberEmail: string,
    memberRole: "patient" | "doctor"
  ) {
    const adminUserIds = await this.getAllAdminUserIds();

    if (adminUserIds.length === 0) {
      console.warn("No active admin users found for new member notification");
      return { success: false, message: "No active admins found" };
    }

    const title = "New Member Joined";
    const message = `${newMemberName} (${newMemberEmail}) has joined as a ${memberRole}.`;

    return this.createBulkNotifications(adminUserIds, {
      type: "new_member_joined",
      title,
      message,
      data: {
        memberName: newMemberName,
        memberEmail: newMemberEmail,
        memberRole,
      },
    });
  }

  // Create doctor verification needed notification for admins
  async createDoctorVerificationNeededNotification(
    doctorName: string,
    doctorEmail: string,
    licenseNumber: string,
    doctorId: string
  ) {
    const adminUserIds = await this.getAllAdminUserIds();

    if (adminUserIds.length === 0) {
      console.warn(
        "No active admin users found for doctor verification notification"
      );
      return { success: false, message: "No active admins found" };
    }

    const title = "Doctor Verification Required";
    const message = `Dr. ${doctorName} (${doctorEmail}) requires verification. License: ${licenseNumber}`;

    return this.createBulkNotifications(adminUserIds, {
      type: "doctor_verification_needed",
      title,
      message,
      data: {
        doctorName,
        doctorEmail,
        licenseNumber,
        doctorId,
      },
    });
  }

  // Create doctor verification complete notification
  async createDoctorVerificationCompleteNotification(
    doctorUserId: string,
    isVerified: boolean,
    adminNotes?: string
  ) {
    const title = isVerified
      ? "Verification Approved"
      : "Verification Declined";
    const message = isVerified
      ? "Congratulations! Your medical license has been verified. You can now access all doctor features."
      : "Your verification request has been declined. Please contact support for more information.";

    return this.createNotification({
      userId: doctorUserId,
      type: "doctor_verification_complete",
      title,
      message,
      data: {
        isVerified,
        adminNotes,
      },
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export individual functions for convenience
export const {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createDiagnosisCompleteNotification,
  createDoctorReviewNotification,
  createHighRiskAlertNotification,
  createFollowUpReminderNotification,
  createSystemUpdateNotification,
  createBulkNotifications,
  getNotificationStats,
  getAllAdminUserIds,
  createNewMemberJoinedNotification,
  createDoctorVerificationNeededNotification,
  createDoctorVerificationCompleteNotification,
} = notificationService;
