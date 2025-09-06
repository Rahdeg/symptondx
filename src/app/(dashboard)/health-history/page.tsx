'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Activity,
    Calendar,
    Search,
    Filter,
    Download,
    Eye,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Clock,
    Stethoscope,
    Brain,
    FileText,
    Heart,
    BarChart3
} from 'lucide-react';
import { api } from '@/trpc/client';
import { formatDistanceToNow, format } from 'date-fns';

export default function HealthHistoryPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTimeRange, setSelectedTimeRange] = useState<'all' | '3m' | '6m' | '1y'>('all');
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'pending' | 'reviewed'>('all');

    // Fetch health history data
    const { data: diagnosisSessions, isLoading: sessionsLoading } = api.patients.getDiagnosisSessions.useQuery({
        page: 1,
        limit: 50
    });

    const { data: healthStats, isLoading: statsLoading } = api.patients.getDashboardStats.useQuery();

    const { data: doctorReviews, isLoading: reviewsLoading } = api.patients.getDoctorReviewHistory.useQuery({
        page: 1,
        limit: 20
    });

    const isLoading = sessionsLoading || statsLoading || reviewsLoading;

    // Filter sessions based on search and filters
    const filteredSessions = diagnosisSessions?.sessions?.filter(session => {
        const matchesSearch = searchTerm === '' ||
            session.chiefComplaint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.finalDiagnosis?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTimeRange = selectedTimeRange === 'all' ||
            (session.createdAt && isWithinTimeRange(session.createdAt, selectedTimeRange));

        const matchesStatus = selectedStatus === 'all' || session.status === selectedStatus;

        return matchesSearch && matchesTimeRange && matchesStatus;
    }) || [];

    function isWithinTimeRange(date: Date, range: string): boolean {
        const now = new Date();
        const sessionDate = new Date(date);

        switch (range) {
            case '3m':
                return sessionDate >= new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000);
            case '6m':
                return sessionDate >= new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
            case '1y':
                return sessionDate >= new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            default:
                return true;
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100';
            case 'in_progress': return 'text-blue-600 bg-blue-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'reviewed': return 'text-purple-600 bg-purple-100';
            case 'cancelled': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-4 w-4" />;
            case 'in_progress': return <Clock className="h-4 w-4" />;
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'reviewed': return <Stethoscope className="h-4 w-4" />;
            case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
            default: return <Activity className="h-4 w-4" />;
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'emergency': return 'text-red-600 bg-red-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout
                title="Health History"
                description="Your complete health record and diagnostic history"
            >
                <div className="max-w-6xl mx-auto">
                    <Card>
                        <CardContent className="p-12 text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
                            <h2 className="text-2xl font-semibold mb-2">Loading Health History</h2>
                            <p className="text-muted-foreground">
                                Retrieving your complete health record and diagnostic history...
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Health History"
            description="Your complete health record and diagnostic history"
        >
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Health History</h1>
                        <p className="text-muted-foreground">
                            Track your health journey and diagnostic history
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                    </div>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search diagnoses, symptoms, or conditions..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={selectedTimeRange}
                                    onChange={(e) => setSelectedTimeRange(e.target.value as 'all' | '3m' | '6m' | '1y')}
                                    className="px-3 py-2 border rounded-md text-sm"
                                    title="Select time range filter"
                                >
                                    <option value="all">All Time</option>
                                    <option value="3m">Last 3 Months</option>
                                    <option value="6m">Last 6 Months</option>
                                    <option value="1y">Last Year</option>
                                </select>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'completed' | 'pending' | 'reviewed')}
                                    className="px-3 py-2 border rounded-md text-sm"
                                    title="Select status filter"
                                >
                                    <option value="all">All Status</option>
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                    <option value="reviewed">Reviewed</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Health Statistics */}
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
                                        {healthStats?.totalSessions || 0}
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
                                        {healthStats?.completedSessions || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Stethoscope className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Doctor Reviews</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {healthStats?.pendingReviews || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Health Score</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {healthStats?.totalSessions ? Math.min(100, Math.max(60, 100 - (healthStats.totalSessions * 2))) : 85}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="diagnoses" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
                        <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
                        <TabsTrigger value="reviews">Doctor Reviews</TabsTrigger>
                        <TabsTrigger value="trends">Health Trends</TabsTrigger>
                    </TabsList>

                    {/* Diagnoses Tab */}
                    <TabsContent value="diagnoses" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-blue-500" />
                                    Diagnostic History
                                    <Badge variant="outline" className="ml-auto">
                                        {filteredSessions.length} records
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {filteredSessions.length === 0 ? (
                                        <div className="text-center py-8">
                                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No diagnoses found</h3>
                                            <p className="text-gray-600 mb-4">
                                                {searchTerm || selectedTimeRange !== 'all' || selectedStatus !== 'all'
                                                    ? 'Try adjusting your search or filter criteria.'
                                                    : 'You haven&apos;t completed any diagnostic sessions yet.'}
                                            </p>
                                            <Button onClick={() => window.location.href = '/diagnosis/new'}>
                                                Start New Diagnosis
                                            </Button>
                                        </div>
                                    ) : (
                                        filteredSessions.map((session) => (
                                            <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            {getStatusIcon(session.status)}
                                                            <h4 className="font-semibold text-gray-900">
                                                                {session.chiefComplaint || 'Symptom Analysis'}
                                                            </h4>
                                                            <Badge className={getStatusColor(session.status)}>
                                                                {session.status}
                                                            </Badge>
                                                            <Badge className={getUrgencyColor(session.urgencyLevel || 'medium')}>
                                                                {session.urgencyLevel || 'Medium'} Priority
                                                            </Badge>
                                                        </div>

                                                        {session.finalDiagnosis && (
                                                            <p className="text-sm text-gray-600 mb-2">
                                                                <strong>Diagnosis:</strong> {session.finalDiagnosis}
                                                            </p>
                                                        )}

                                                        {session.additionalInfo && (
                                                            <p className="text-sm text-gray-600 mb-2">
                                                                {session.additionalInfo}
                                                            </p>
                                                        )}

                                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-4 w-4" />
                                                                {session.createdAt ? format(new Date(session.createdAt), 'MMM dd, yyyy') : 'Unknown date'}
                                                            </span>
                                                            <span>
                                                                {session.createdAt ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true }) : 'Unknown time'}
                                                            </span>
                                                            {session.confidence_score && (
                                                                <span className="flex items-center gap-1">
                                                                    <Brain className="h-4 w-4" />
                                                                    {(parseFloat(session.confidence_score) * 100).toFixed(1)}% confidence
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Doctor Reviews Tab */}
                    <TabsContent value="reviews" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Stethoscope className="h-5 w-5 text-purple-500" />
                                    Doctor Reviews
                                    <Badge variant="outline" className="ml-auto">
                                        {doctorReviews?.length || 0} reviews
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {doctorReviews && doctorReviews.length > 0 ? (
                                        doctorReviews.map((review) => (
                                            <div key={review.sessionId} className="border rounded-lg p-4 bg-purple-50">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 mb-2">
                                                            {review.chiefComplaint}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            <strong>Final Diagnosis:</strong> {review.doctorReview?.finalDiagnosis || review.finalDiagnosis || 'Pending'}
                                                        </p>

                                                        {review.doctorReview && (
                                                            <div className="mt-3 space-y-2">
                                                                <p className="text-sm text-gray-600">
                                                                    <strong>Doctor&apos;s Notes:</strong> {review.doctorReview.notes || 'No additional notes'}
                                                                </p>
                                                                <div className="flex items-center gap-4 text-sm">
                                                                    <span>
                                                                        <strong>Confidence:</strong> {review.doctorReview.confidence || 'N/A'}/10
                                                                    </span>
                                                                    <span>
                                                                        <strong>Agrees with AI:</strong> {review.doctorReview.agreesWithML ? 'Yes' : 'No'}
                                                                    </span>
                                                                </div>
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

                                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                            <span>Reviewed by: {review.doctorName || 'Dr. Smith'}</span>
                                                            <span>Specialization: {review.doctorSpecialization || 'General Medicine'}</span>
                                                            <span>
                                                                {review.completedAt ? formatDistanceToNow(new Date(review.completedAt), { addSuffix: true }) : 'Unknown time'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <Badge className="bg-purple-100 text-purple-800">
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
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No doctor reviews yet</h3>
                                            <p className="text-gray-600 mb-4">
                                                Doctor reviews will appear here when your diagnoses are reviewed by medical professionals.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Health Trends Tab */}
                    <TabsContent value="trends" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-green-500" />
                                        Diagnosis Frequency
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8">
                                        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Trend Analysis</h3>
                                        <p className="text-gray-600">
                                            Health trend analysis will be available as you build your diagnostic history.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Heart className="h-5 w-5 text-red-500" />
                                        Health Score
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8">
                                        <div className="text-4xl font-bold text-green-600 mb-2">
                                            {healthStats?.totalSessions ? Math.min(100, Math.max(60, 100 - (healthStats.totalSessions * 2))) : 85}
                                        </div>
                                        <p className="text-gray-600 mb-4">Overall Health Score</p>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${Math.min(100, Math.max(60, 100 - ((healthStats?.totalSessions || 0) * 2)))}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}