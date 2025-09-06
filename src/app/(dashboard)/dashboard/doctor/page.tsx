'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import {
    HeartPulse,
    Users,
    BarChart3,
    Brain,
    Stethoscope,
    AlertTriangle,
    Clock,
    CheckCircle,
    TrendingUp,
    FileText,
    Activity
} from "lucide-react";
import { api } from "@/trpc/client";
import { formatDistanceToNow } from "date-fns";

export default function DoctorDashboard() {
    const router = useRouter();

    // Fetch real data
    const { data: dashboardStats, isLoading: statsLoading } = api.doctors.getDashboardStats.useQuery();
    const { data: recentSessions, isLoading: sessionsLoading } = api.doctors.getAssignedSessions.useQuery({
        page: 1,
        limit: 5
    });
    const { data: notifications, isLoading: notificationsLoading } = api.notifications.getMyNotifications.useQuery({
        includeRead: false,
        limit: 5
    });

    // Fetch new data for enhanced dashboard
    const { data: urgentCases } = api.doctors.getUrgentCases.useQuery();
    const { data: reviewMetrics, isLoading: metricsLoading } = api.doctors.getReviewMetrics.useQuery({
        period: "week"
    });

    const handleReviewCases = () => {
        router.push('/doctor/reviews');
    };

    const handleViewPatients = () => {
        router.push('/doctor/patients');
    };

    const handleViewAnalytics = () => {
        router.push('/doctor/analytics');
    };

    const handleAIInsights = () => {
        router.push('/doctor/ai-insights');
    };

    return (
        <DashboardLayout
            title="Doctor Dashboard"
            description="Review AI analyses, manage patients, and collaborate with AI"
        >
            <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {statsLoading ? "..." : dashboardStats?.pendingReviews || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Cases</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {statsLoading ? "..." : dashboardStats?.totalSessions || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Completed Reviews</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {statsLoading ? "..." : dashboardStats?.completedReviews || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Unread Notifications</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {notificationsLoading ? "..." : notifications?.unreadCount || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleReviewCases}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HeartPulse className="h-5 w-5 text-red-500" />
                                Patient Reviews
                                <Badge variant="destructive" className="ml-auto">
                                    {statsLoading ? "..." : dashboardStats?.pendingReviews || 0}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Review AI diagnoses and provide medical oversight with confidence intervals
                            </p>
                            <Button className="w-full" onClick={handleReviewCases}>
                                Review Cases
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewPatients}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                Patient Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Manage your patients and their health records
                            </p>
                            <Button variant="outline" className="w-full" onClick={handleViewPatients}>
                                View Patients
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleAIInsights}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-purple-500" />
                                AI Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Access AI-powered diagnostic insights and recommendations
                            </p>
                            <Button variant="outline" className="w-full" onClick={handleAIInsights}>
                                View Insights
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewAnalytics}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-green-500" />
                                Analytics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                View AI performance and diagnostic accuracy metrics
                            </p>
                            <Button variant="outline" className="w-full" onClick={handleViewAnalytics}>
                                View Analytics
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Stethoscope className="h-5 w-5 text-indigo-500" />
                                Clinical Guidelines
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Access latest clinical guidelines and treatment protocols
                            </p>
                            <Button variant="outline" className="w-full" disabled>
                                Coming Soon
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-orange-500" />
                                Case Studies
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Review interesting cases and AI diagnostic patterns
                            </p>
                            <Button variant="outline" className="w-full" disabled>
                                Coming Soon
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Urgent Cases Priority Queue */}
                {urgentCases && urgentCases.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Urgent Cases Priority Queue
                                <Badge variant="destructive" className="ml-auto">
                                    {urgentCases.length}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {urgentCases.slice(0, 5).map((case_, index) => (
                                    <div
                                        key={case_.id}
                                        className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${case_.isEmergency
                                            ? 'bg-red-50 border-red-200'
                                            : case_.urgencyLevel === 'high'
                                                ? 'bg-orange-50 border-orange-200'
                                                : 'bg-yellow-50 border-yellow-200'
                                            }`}
                                        onClick={() => router.push(`/doctor/reviews?case=${case_.id}`)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                                    <h4 className="font-semibold text-gray-900">
                                                        {case_.chiefComplaint}
                                                    </h4>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {case_.additionalInfo}
                                                </p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>Patient: {case_.patientName || 'Anonymous'}</span>
                                                    <span>Age: {case_.patientAge ? new Date().getFullYear() - new Date(case_.patientAge).getFullYear() : 'N/A'}</span>
                                                    <span>Gender: {case_.patientGender || 'N/A'}</span>
                                                    <span>Submitted: {formatDistanceToNow(new Date(case_.createdAt || new Date()))} ago</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <Badge
                                                    className={
                                                        case_.isEmergency
                                                            ? 'bg-red-100 text-red-800'
                                                            : case_.urgencyLevel === 'high'
                                                                ? 'bg-orange-100 text-orange-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                    }
                                                >
                                                    {case_.isEmergency ? '🚨 Emergency' : case_.urgencyLevel === 'high' ? '⚠️ High' : '⚡ Medium'}
                                                </Badge>
                                                <Badge variant="outline">
                                                    Pending Review
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {urgentCases.length > 5 && (
                                    <div className="text-center pt-2">
                                        <Button variant="outline" onClick={handleReviewCases}>
                                            View All {urgentCases.length} Cases
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Review Metrics */}
                {reviewMetrics && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-purple-500" />
                                Review Performance (This Week)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {metricsLoading ? "..." : reviewMetrics.totalCases}
                                    </div>
                                    <div className="text-sm text-gray-600">Total Cases</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {metricsLoading ? "..." : reviewMetrics.completedReviews}
                                    </div>
                                    <div className="text-sm text-gray-600">Completed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {metricsLoading ? "..." : reviewMetrics.pendingReviews}
                                    </div>
                                    <div className="text-sm text-gray-600">Pending</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {metricsLoading ? "..." : `${Math.round(reviewMetrics.completionRate)}%`}
                                    </div>
                                    <div className="text-sm text-gray-600">Completion Rate</div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                    <span>Review Progress</span>
                                    <span>{Math.round(reviewMetrics.completionRate)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${Math.min(100, Math.max(0, reviewMetrics.completionRate))}%`
                                        }}
                                        aria-label={`Progress: ${Math.round(reviewMetrics.completionRate)}%`}
                                    ></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Reviews</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {sessionsLoading ? (
                                    <div className="text-center py-4">
                                        <p className="text-gray-500">Loading recent activity...</p>
                                    </div>
                                ) : recentSessions?.sessions && recentSessions.sessions.length > 0 ? (
                                    recentSessions.sessions.slice(0, 3).map((session) => {
                                        const getStatusColor = (status: string) => {
                                            switch (status) {
                                                case 'completed': return 'bg-green-50';
                                                case 'in_progress': return 'bg-blue-50';
                                                case 'pending': return 'bg-yellow-50';
                                                case 'reviewed': return 'bg-purple-50';
                                                default: return 'bg-gray-50';
                                            }
                                        };

                                        const getStatusIcon = (status: string) => {
                                            switch (status) {
                                                case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
                                                case 'in_progress': return <Brain className="h-4 w-4 text-blue-600" />;
                                                case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
                                                case 'reviewed': return <FileText className="h-4 w-4 text-purple-600" />;
                                                default: return <Activity className="h-4 w-4 text-gray-600" />;
                                            }
                                        };

                                        const getStatusBadge = (status: string) => {
                                            switch (status) {
                                                case 'completed': return <Badge variant="secondary">Completed</Badge>;
                                                case 'in_progress': return <Badge variant="default">In Progress</Badge>;
                                                case 'pending': return <Badge variant="outline">Pending</Badge>;
                                                case 'reviewed': return <Badge variant="secondary">Reviewed</Badge>;
                                                default: return <Badge variant="outline">{status}</Badge>;
                                            }
                                        };

                                        return (
                                            <div key={session.id} className={`flex items-center space-x-4 p-4 ${getStatusColor(session.status)} rounded-lg`}>
                                                <div className="p-2 bg-white rounded-full">
                                                    {getStatusIcon(session.status)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">
                                                        {session.chiefComplaint || 'Symptom analysis'}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        {session.createdAt ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true }) : 'Unknown time'}
                                                    </p>
                                                </div>
                                                {getStatusBadge(session.status)}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-gray-500">No recent activity</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>AI Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Total Cases</span>
                                    <span className="text-sm font-bold text-green-600">
                                        {statsLoading ? "..." : dashboardStats?.totalSessions || 0}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-600 h-2 rounded-full w-[100%]"></div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Pending Reviews</span>
                                    <span className="text-sm font-bold text-blue-600">
                                        {statsLoading ? "..." : dashboardStats?.pendingReviews || 0}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full w-[100%]"></div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Completed Reviews</span>
                                    <span className="text-sm font-bold text-purple-600">
                                        {statsLoading ? "..." : dashboardStats?.completedReviews || 0}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-purple-600 h-2 rounded-full w-[100%]"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
