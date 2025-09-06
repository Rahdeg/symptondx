'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import {
    Heart,
    Activity,
    Brain,
    FileText,
    TrendingUp,
    Clock,
    AlertTriangle,
    CheckCircle
} from "lucide-react";
import { api } from "@/trpc/client";
import { formatDistanceToNow } from "date-fns";

export default function PatientDashboard() {
    const router = useRouter();

    // Fetch real data
    const { data: dashboardStats, isLoading: statsLoading } = api.patients.getDashboardStats.useQuery();
    const { data: recentSessions, isLoading: sessionsLoading } = api.patients.getDiagnosisSessions.useQuery({
        page: 1,
        limit: 5
    });
    const { data: notifications, isLoading: notificationsLoading } = api.notifications.getMyNotifications.useQuery({
        includeRead: false,
        limit: 5
    });

    // Fetch new data for enhanced dashboard
    const { data: pendingReviews } = api.patients.getPendingDoctorReviews.useQuery();
    const { data: reviewHistory } = api.patients.getDoctorReviewHistory.useQuery({
        page: 1,
        limit: 3
    });

    const handleStartAnalysis = () => {
        router.push('/diagnosis/new');
    };

    const handleViewHistory = () => {
        router.push('/health-history');
    };


    const handleViewDiagnoses = () => {
        router.push('/diagnoses');
    };

    return (
        <DashboardLayout
            title="Health Dashboard"
            description="Manage your health with AI-powered insights"
        >
            <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Diagnoses</p>
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
                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {statsLoading ? "..." : dashboardStats?.completedSessions || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Clock className="h-6 w-6 text-yellow-600" />
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
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <AlertTriangle className="h-6 w-6 text-red-600" />
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
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleStartAnalysis}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-blue-500" />
                                Symptom Analysis
                                <Badge variant="secondary" className="ml-auto">New</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Describe your symptoms and get AI-powered health insights with confidence intervals
                            </p>
                            <Button className="w-full" onClick={handleStartAnalysis}>
                                Start Analysis
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewDiagnoses}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-green-500" />
                                My Diagnoses
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                View your past diagnoses and AI analysis results
                            </p>
                            <Button variant="outline" className="w-full" onClick={handleViewDiagnoses}>
                                View Diagnoses
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewHistory}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-purple-500" />
                                Health History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                View your complete health records and medical history
                            </p>
                            <Button variant="outline" className="w-full" onClick={handleViewHistory}>
                                View History
                            </Button>
                        </CardContent>
                    </Card>


                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-indigo-500" />
                                Health Trends
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Track your health patterns and improvement over time
                            </p>
                            <Button variant="outline" className="w-full" disabled>
                                Coming Soon
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="h-5 w-5 text-red-500" />
                                Wellness Tips
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Get personalized health and wellness recommendations
                            </p>
                            <Button variant="outline" className="w-full" disabled>
                                Coming Soon
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Doctor Reviews */}
                {pendingReviews && pendingReviews.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-yellow-500" />
                                Pending Doctor Reviews
                                <Badge variant="destructive" className="ml-auto">
                                    {pendingReviews.length}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {pendingReviews.map((review) => (
                                    <div key={review.id} className="border rounded-lg p-4 bg-yellow-50">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">
                                                    {review.chiefComplaint}
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {review.additionalInfo}
                                                </p>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-500">
                                                    <span>Assigned to: {review.doctorName || 'Dr. Smith'}</span>
                                                    <span>Specialization: {review.doctorSpecialization || 'General Medicine'}</span>
                                                    <span>Submitted: {formatDistanceToNow(new Date(review.createdAt || new Date()))} ago</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:items-end gap-2">
                                                <Badge
                                                    className={
                                                        review.isEmergency
                                                            ? 'bg-red-100 text-red-800'
                                                            : review.urgencyLevel === 'high'
                                                                ? 'bg-orange-100 text-orange-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                    }
                                                >
                                                    {review.isEmergency ? 'Emergency' : review.urgencyLevel || 'Medium'}
                                                </Badge>
                                                <Badge variant="outline">
                                                    Awaiting Review
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Doctor Review History */}
                {reviewHistory && reviewHistory.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                Recent Doctor Reviews
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {reviewHistory.map((review) => (
                                    <div key={review.sessionId} className="border rounded-lg p-4 bg-green-50">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">
                                                    {review.chiefComplaint}
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Final Diagnosis: {review.doctorReview?.finalDiagnosis || review.finalDiagnosis || 'Pending'}
                                                </p>
                                                {review.doctorReview && (
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-sm text-gray-600">
                                                            <strong>Doctor&apos;s Notes:</strong> {review.doctorReview.notes || 'No additional notes'}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            <strong>Confidence Level:</strong> {review.doctorReview.confidence || 'N/A'}/10
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            <strong>Agrees with AI:</strong> {review.doctorReview.agreesWithML ? 'Yes' : 'No'}
                                                        </p>
                                                        {review.doctorReview.recommendedActions && review.doctorReview.recommendedActions.length > 0 && (
                                                            <div className="mt-2">
                                                                <p className="text-sm font-medium text-gray-700 mb-1">Recommended Actions:</p>
                                                                <ul className="text-sm text-gray-600 list-disc list-inside">
                                                                    {review.doctorReview.recommendedActions.map((action, index) => (
                                                                        <li key={index}>{action}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-500">
                                                    <span>Reviewed by: {review.doctorName || 'Dr. Smith'}</span>
                                                    <span>Specialization: {review.doctorSpecialization || 'General Medicine'}</span>
                                                    <span>Completed: {formatDistanceToNow(new Date(review.completedAt || new Date()))} ago</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:items-end gap-2">
                                                <Badge className="bg-green-100 text-green-800">
                                                    Review Complete
                                                </Badge>
                                                {review.doctorReview?.confidence && (
                                                    <Badge variant="outline">
                                                        Confidence: {review.doctorReview.confidence}/10
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
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
            </div>
        </DashboardLayout>
    );
}
