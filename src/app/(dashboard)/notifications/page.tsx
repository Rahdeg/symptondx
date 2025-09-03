'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/trpc/client';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
    Bell,
    BellRing,
    Check,
    CheckCheck,
    Trash2,
    RefreshCw
} from 'lucide-react';

export default function NotificationsPage() {
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

    // Fetch notifications
    const { data: notificationsData, refetch, isLoading } = api.notifications.getMyNotifications.useQuery({
        includeRead: true,
        limit: 50,
    });

    // Mark as read mutation
    const markAsReadMutation = api.notifications.markAsRead.useMutation({
        onSuccess: () => {
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
            refetch();
        },
        onError: () => {
            toast.error('Failed to mark all notifications as read');
        },
    });

    // Delete notification mutation
    const deleteNotificationMutation = api.notifications.deleteNotification.useMutation({
        onSuccess: () => {
            toast.success('Notification deleted');
            refetch();
        },
        onError: () => {
            toast.error('Failed to delete notification');
        },
    });

    const handleMarkAsRead = (notificationId: string) => {
        markAsReadMutation.mutate({ id: notificationId });
    };

    const handleMarkAllAsRead = () => {
        markAllAsReadMutation.mutate();
    };

    const handleDeleteNotification = (notificationId: string) => {
        deleteNotificationMutation.mutate({ id: notificationId });
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'diagnosis_complete':
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
                return 'text-red-600 bg-red-50 border-red-200';
            case 'diagnosis_complete':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'doctor_review_needed':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const notifications = notificationsData?.notifications || [];
    const unreadCount = notificationsData?.unreadCount || 0;

    // Filter notifications based on current filter
    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.isRead;
        if (filter === 'read') return notification.isRead;
        return true; // 'all'
    });

    return (
        <DashboardLayout
            title="Notifications"
            description="Stay updated with your diagnosis results and important alerts"
        >
            <div className="space-y-6">
                {/* Header with actions */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell className="h-6 w-6 text-blue-500" />
                                <div>
                                    <CardTitle>Notifications</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {unreadCount} unread notifications
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => refetch()}
                                    disabled={isLoading}
                                >
                                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                                {unreadCount > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleMarkAllAsRead}
                                        disabled={markAllAsReadMutation.isPending}
                                    >
                                        <CheckCheck className="h-4 w-4" />
                                        Mark all read
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Filter tabs */}
                <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'unread' | 'read')}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all" className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            All ({notifications.length})
                        </TabsTrigger>
                        <TabsTrigger value="unread" className="flex items-center gap-2">
                            <BellRing className="h-4 w-4" />
                            Unread ({unreadCount})
                        </TabsTrigger>
                        <TabsTrigger value="read" className="flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            Read ({notifications.length - unreadCount})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={filter} className="space-y-4">
                        {filteredNotifications.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">
                                        {filter === 'unread' ? 'No unread notifications' :
                                            filter === 'read' ? 'No read notifications' :
                                                'No notifications yet'}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {filter === 'unread' ? 'You\'re all caught up!' :
                                            filter === 'read' ? 'No notifications have been read yet' :
                                                'You\'ll see notifications here when they arrive.'}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {filteredNotifications.map((notification) => (
                                    <Card
                                        key={notification.id}
                                        className={`transition-all hover:shadow-md ${!notification.isRead
                                                ? 'border-l-4 border-l-blue-500 bg-blue-50/50'
                                                : ''
                                            }`}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                <span className="text-2xl">
                                                    {getNotificationIcon(notification.type)}
                                                </span>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className={`font-semibold text-sm ${getNotificationColor(notification.type).split(' ')[0]}`}>
                                                                    {notification.title}
                                                                </h4>
                                                                {!notification.isRead && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        New
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mb-2">
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : 'Unknown time'}
                                                            </p>

                                                            {(() => {
                                                                const data = notification.data;
                                                                if (data && typeof data === 'object' && 'sessionId' in data) {
                                                                    const sessionId = (data as { sessionId: string }).sessionId;
                                                                    return (
                                                                        <div className="mt-3">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    window.location.href = `/diagnosis/results/${sessionId}`;
                                                                                }}
                                                                            >
                                                                                View Results
                                                                            </Button>
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}
                                                        </div>

                                                        <div className="flex items-center gap-1 ml-4">
                                                            {!notification.isRead && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                                    disabled={markAsReadMutation.isPending}
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteNotification(notification.id)}
                                                                disabled={deleteNotificationMutation.isPending}
                                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
