'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    Clock,
    Target,
    Activity,
    Calendar,
    FileText,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';
import { api } from '@/trpc/client';
import { formatDistanceToNow } from 'date-fns';

export default function DoctorAnalyticsPage() {
    const [selectedPeriod, setSelectedPeriod] = useState('week');

    // Fetch analytics data
    const { data: reviewMetrics, isLoading: metricsLoading } = api.doctors.getReviewMetrics.useQuery({
        period: selectedPeriod as 'today' | 'week' | 'month'
    });

    const { data: sessions, isLoading: sessionsLoading } = api.doctors.getAssignedSessions.useQuery({
        page: 1,
        limit: 100,
    });

    // Mock analytics data (in real app, this would come from analytics API)
    const analyticsData = {
        totalCases: sessions?.sessions?.length || 0,
        completedReviews: reviewMetrics?.completedReviews || 0,
        pendingReviews: reviewMetrics?.pendingReviews || 0,
        averageReviewTime: 24, // hours
        completionRate: reviewMetrics?.completionRate || 0,
        patientSatisfaction: 4.7,
        accuracyRate: 94.2,
        responseTime: 2.3, // hours
    };

    const weeklyData = [
        { day: 'Mon', cases: 12, completed: 10 },
        { day: 'Tue', cases: 15, completed: 14 },
        { day: 'Wed', cases: 8, completed: 7 },
        { day: 'Thu', cases: 18, completed: 16 },
        { day: 'Fri', cases: 22, completed: 20 },
        { day: 'Sat', cases: 6, completed: 5 },
        { day: 'Sun', cases: 4, completed: 3 },
    ];

    const diseaseDistribution = [
        { name: 'Respiratory', count: 45, percentage: 28 },
        { name: 'Cardiovascular', count: 32, percentage: 20 },
        { name: 'Gastrointestinal', count: 28, percentage: 17 },
        { name: 'Neurological', count: 25, percentage: 15 },
        { name: 'Dermatological', count: 20, percentage: 12 },
        { name: 'Other', count: 12, percentage: 8 },
    ];

    const performanceMetrics = [
        {
            title: 'Review Efficiency',
            value: '94.2%',
            change: '+2.1%',
            trend: 'up',
            description: 'Cases reviewed within 24 hours'
        },
        {
            title: 'Diagnosis Accuracy',
            value: '96.8%',
            change: '+1.3%',
            trend: 'up',
            description: 'Correct initial diagnoses'
        },
        {
            title: 'Patient Satisfaction',
            value: '4.7/5',
            change: '+0.2',
            trend: 'up',
            description: 'Average patient rating'
        },
        {
            title: 'Response Time',
            value: '2.3h',
            change: '-0.5h',
            trend: 'up',
            description: 'Average time to first response'
        },
    ];

    const recentActivity = [
        {
            id: 1,
            type: 'review_completed',
            description: 'Completed review for respiratory case',
            timestamp: '2 hours ago',
            status: 'completed'
        },
        {
            id: 2,
            type: 'urgent_case',
            description: 'New urgent case assigned',
            timestamp: '4 hours ago',
            status: 'urgent'
        },
        {
            id: 3,
            type: 'ai_agreement',
            description: 'Agreed with AI diagnosis (95% confidence)',
            timestamp: '6 hours ago',
            status: 'completed'
        },
        {
            id: 4,
            type: 'review_completed',
            description: 'Completed review for cardiovascular case',
            timestamp: '1 day ago',
            status: 'completed'
        },
    ];

    const getTrendIcon = (trend: string) => {
        return trend === 'up' ?
            <TrendingUp className="h-4 w-4 text-green-500" /> :
            <TrendingDown className="h-4 w-4 text-red-500" />;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'urgent': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <DashboardLayout
            title="Analytics Dashboard"
            description="Comprehensive analytics and performance metrics"
        >
            <div className="space-y-6">
                {/* Period Selector */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">Analysis Period:</span>
                            <div className="flex gap-2">
                                {['today', 'week', 'month'].map((period) => (
                                    <Button
                                        key={period}
                                        variant={selectedPeriod === period ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedPeriod(period)}
                                    >
                                        {period.charAt(0).toUpperCase() + period.slice(1)}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Key Performance Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {performanceMetrics.map((metric, index) => (
                        <Card key={index}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
                                    {getTrendIcon(metric.trend)}
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                    <span className="text-sm text-green-600">{metric.change}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Weekly Activity Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-500" />
                                Weekly Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {weeklyData.map((day, index) => (
                                    <div key={day.day} className="flex items-center gap-4">
                                        <div className="w-12 text-sm font-medium text-gray-600">
                                            {day.day}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${(day.completed / day.cases) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-600">
                                                    {day.completed}/{day.cases}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Disease Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-green-500" />
                                Disease Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {diseaseDistribution.map((disease, index) => (
                                    <div key={disease.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                            <span className="text-sm font-medium">{disease.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">{disease.count} cases</span>
                                            <Badge variant="outline">{disease.percentage}%</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-purple-500" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                                    <div className="p-1 bg-gray-100 rounded-full">
                                        <Activity className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-medium">{activity.description}</p>
                                            <Badge className={getStatusColor(activity.status)}>
                                                {activity.status}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="font-semibold mb-1">Total Cases</h3>
                            <p className="text-2xl font-bold text-blue-600">{analyticsData.totalCases}</p>
                            <p className="text-sm text-gray-600">This {selectedPeriod}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="font-semibold mb-1">Completion Rate</h3>
                            <p className="text-2xl font-bold text-green-600">{Math.round(analyticsData.completionRate)}%</p>
                            <p className="text-sm text-gray-600">Reviews completed</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                                <Clock className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="font-semibold mb-1">Avg Review Time</h3>
                            <p className="text-2xl font-bold text-purple-600">{analyticsData.averageReviewTime}h</p>
                            <p className="text-sm text-gray-600">Per case</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
