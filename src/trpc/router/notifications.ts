import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  baseProcedure,
} from "@/trpc/init";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export const notificationsRouter = createTRPCRouter({
  // Test endpoint to check if notifications system is working
  testConnection: baseProcedure.query(async () => {
    return {
      success: true,
      message: "Notifications system is active",
      timestamp: new Date().toISOString(),
    };
  }),

  // Get user's notifications
  getMyNotifications: protectedProcedure
    .input(
      z.object({
        includeRead: z.boolean().optional().default(false),
        limit: z.number().optional().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // Build query conditions
        const conditions = [eq(notifications.userId, ctx.user.id)];

        if (!input.includeRead) {
          conditions.push(eq(notifications.isRead, false));
        }

        // Fetch notifications from database
        const userNotifications = await db
          .select()
          .from(notifications)
          .where(and(...conditions))
          .orderBy(desc(notifications.createdAt))
          .limit(input.limit);

        // Get unread count
        const unreadCount = await db
          .select({ count: notifications.id })
          .from(notifications)
          .where(
            and(
              eq(notifications.userId, ctx.user.id),
              eq(notifications.isRead, false)
            )
          );

        return {
          notifications: userNotifications,
          unreadCount: unreadCount.length,
        };
      } catch (error) {
        console.error("Error fetching notifications:", error);
        // Fallback to empty result
        return {
          notifications: [],
          unreadCount: 0,
        };
      }
    }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await db
          .update(notifications)
          .set({
            isRead: true,
            readAt: new Date(),
          })
          .where(
            and(
              eq(notifications.id, input.id),
              eq(notifications.userId, ctx.user.id)
            )
          );

        return { success: true };
      } catch (error) {
        console.error("Error marking notification as read:", error);
        return { success: false, error: "Failed to mark notification as read" };
      }
    }),

  // Mark all as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await db
        .update(notifications)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(
            eq(notifications.userId, ctx.user.id),
            eq(notifications.isRead, false)
          )
        );

      return { success: true };
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return {
        success: false,
        error: "Failed to mark all notifications as read",
      };
    }
  }),

  // Delete notification
  deleteNotification: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await db
          .delete(notifications)
          .where(
            and(
              eq(notifications.id, input.id),
              eq(notifications.userId, ctx.user.id)
            )
          );

        return { success: true };
      } catch (error) {
        console.error("Error deleting notification:", error);
        return { success: false, error: "Failed to delete notification" };
      }
    }),

  // Create notification (for internal use)
  createNotification: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        type: z.enum([
          "diagnosis_complete",
          "doctor_review_needed",
          "high_risk_alert",
          "follow_up_reminder",
          "system_update",
        ]),
        title: z.string(),
        message: z.string(),
        data: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const newNotification = await db
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

        return { success: true, notification: newNotification[0] };
      } catch (error) {
        console.error("Error creating notification:", error);
        return { success: false, error: "Failed to create notification" };
      }
    }),
});
