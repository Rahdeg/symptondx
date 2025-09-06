'use client';

import React, { useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/trpc/client';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';


export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);

    // Get utils for invalidation
    const utils = api.useUtils();

    // Fetch notifications
    const { data: notificationsData, refetch } = api.notifications.getMyNotifications.useQuery({
        includeRead: true,
        limit: 10,
    });

    // Mark as read mutation
    const markAsReadMutation = api.notifications.markAsRead.useMutation({
        onSuccess: () => {
            // Invalidate all notification queries to update dashboard data
            utils.notifications.getMyNotifications.invalidate();
            refetch();
        },
        onError: () => {
            toast.error('Failed to mark notification as read');
        },
    });

    // Mark all as read mutation
    const markAllAsReadMutation = api.notifications.markAllAsRead.useMutation({
        onSuccess: () => {
            toast.success('All notifications marked as read');
            // Invalidate all notification queries to update dashboard data
            utils.notifications.getMyNotifications.invalidate();
            refetch();
        },
        onError: () => {
            toast.error('Failed to mark all notifications as read');
        },
    });

    const handleMarkAsRead = (notificationId: string) => {
        markAsReadMutation.mutate({ id: notificationId });
    };

    const handleMarkAllAsRead = () => {
        markAllAsReadMutation.mutate();
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'diagnosis_complete':
                return '✅';
            case 'doctor_review_complete':
                return '✅';
            case 'high_risk_alert':
                return '🚨';
            case 'doctor_review_needed':
                return '👨‍⚕️';
            case 'follow_up_reminder':
                return '📅';
            case 'system_update':
                return '🔔';
            default:
                return '📢';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'high_risk_alert':
                return 'text-red-600';
            case 'diagnosis_complete':
                return 'text-green-600';
            case 'doctor_review_complete':
                return 'text-green-600';
            case 'doctor_review_needed':
                return 'text-blue-600';
            default:
                return 'text-gray-600';
        }
    };

    const notifications = notificationsData?.notifications || [];
    const unreadCount = notificationsData?.unreadCount || 0;

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                    {unreadCount > 0 ? (
                        <BellRing className="h-5 w-5" />
                    ) : (
                        <Bell className="h-5 w-5" />
                    )}
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            disabled={markAllAsReadMutation.isPending}
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-96">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                            No notifications yet
                        </div>
                    ) : (
                        <div className="p-2">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors ${!notification.isRead
                                        ? 'bg-blue-50 border-l-4 border-l-blue-500'
                                        : 'hover:bg-gray-50'
                                        }`}
                                    onClick={() => {
                                        if (!notification.isRead) {
                                            handleMarkAsRead(notification.id);
                                        }
                                        // Handle navigation based on notification type
                                        const data = notification.data;
                                        if (data && typeof data === 'object' && 'sessionId' in data) {
                                            const sessionId = (data as { sessionId: string }).sessionId;
                                            window.location.href = `/diagnosis/results/${sessionId}`;
                                        }
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-lg">
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`font-medium text-sm ${getNotificationColor(notification.type)}`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.isRead && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : 'Unknown time'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="p-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                    setIsOpen(false);
                                    // Navigate to full notifications page
                                    window.location.href = '/notifications';
                                }}
                            >
                                View all notifications
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
