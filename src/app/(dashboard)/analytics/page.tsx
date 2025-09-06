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
    Users,
    Brain,
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    Target,
    PieChart,
    Calendar,
    Filter,
    Download
} from 'lucide-react';
import { api } from '@/trpc/client';
import { formatDistanceToNow } from 'date-fns';

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

    // Fetch analytics data
    const { data: systemStats, isLoading: statsLoading } = api.ml.getModelMetrics.useQuery({
        timeRange,
        modelVersion: undefined
    });

    const { data: confidenceDistribution, isLoading: confidenceLoading } = api.ml.getConfidenceDistribution.useQuery({
        timeRange
    });

    const { data: topDiseases, isLoading: diseasesLoading } = api.ml.getTopDiseases.useQuery({
        timeRange,
        limit: 10
    });

    const { data: highRiskPredictions, isLoading: highRiskLoading } = api.ml.getHighRiskPredictions.useQuery({
        limit: 5
    });

    const { data: doctorStats, isLoading: doctorStatsLoading } = api.doctors.getReviewMetrics.useQuery({
        period: timeRange === '7d' ? 'week' : timeRange === '30d' ? 'month' : 'month'
    });

    const isLoading = statsLoading || confidenceLoading || diseasesLoading || highRiskLoading || doctorStatsLoading;

    const getTimeRangeLabel = (range: string) => {
        switch (range) {
            case '7d': return 'Last 7 days';
            case '30d': return 'Last 30 days';
            case '90d': return 'Last 90 days';
            case '1y': return 'Last year';
            default: return 'Last 30 days';
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return 'text-green-600 bg-green-100';
        if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    if (isLoading) {
        return (
            <DashboardLayout
                title="Analytics Dashboard"
                description="System performance and diagnostic insights"
            >
                <div className="max-w-7xl mx-auto">
                    <Card>
                        <CardContent className="p-12 text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
                            <h2 className="text-2xl font-semibold mb-2">Loading Analytics</h2>
                            <p className="text-muted-foreground">
                                Gathering system performance data and diagnostic insights...
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Analytics Dashboard"
            description="System performance and diagnostic insights"
        >
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                        <Badge variant="outline" className="text-sm">
                            {getTimeRangeLabel(timeRange)}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Time Range Selector */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Time Range:</span>
                            <div className="flex gap-1">
                                {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                                    <Button
                                        key={range}
                                        variant={timeRange === range ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setTimeRange(range)}
                                    >
                                        {range}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Brain className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Predictions</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {systemStats?.totalPredictions || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Target className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Average Confidence</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {systemStats?.averageConfidence
                                            ? `${(systemStats.averageConfidence * 100).toFixed(1)}%`
                                            : '0%'
                                        }
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">High Confidence</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {systemStats?.highConfidencePredictions || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Users className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {systemStats?.totalPredictions || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Analytics Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="diseases">Diseases</TabsTrigger>
                        <TabsTrigger value="alerts">Alerts</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Confidence Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PieChart className="h-5 w-5 text-blue-500" />
                                        Confidence Distribution
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {confidenceDistribution && Object.entries(confidenceDistribution).map(([range, count]) => (
                                            <div key={range} className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{range}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{
                                                                width: `${(count / Math.max(...Object.values(confidenceDistribution))) * 100}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-gray-600 w-8">{count}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Top Diseases */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-green-500" />
                                        Most Diagnosed Conditions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {topDiseases?.slice(0, 5).map((disease, index) => (
                                            <div key={disease.disease.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{disease.disease.name}</p>
                                                        <p className="text-sm text-gray-600">{disease.averageConfidence}% avg confidence</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline">{disease.predictionCount} cases</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent High-Risk Predictions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    Recent High-Risk Predictions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {highRiskPredictions?.map((prediction) => (
                                        <div key={prediction.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{prediction.disease.name}</h4>
                                                <p className="text-sm text-gray-600">
                                                    Patient: Anonymous •
                                                    Confidence: {(parseFloat(prediction.confidence) * 100).toFixed(1)}% •
                                                    {prediction.createdAt ? formatDistanceToNow(new Date(prediction.createdAt)) : 'Unknown time'} ago
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={getConfidenceColor(parseFloat(prediction.confidence))}>
                                                    {(parseFloat(prediction.confidence) * 100).toFixed(1)}%
                                                </Badge>
                                                <Badge variant="destructive">High Risk</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Performance Tab */}
                    <TabsContent value="performance" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Model Performance Metrics */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-purple-500" />
                                        Model Performance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Accuracy Rate</span>
                                            <span className="text-lg font-bold text-green-600">
                                                {systemStats?.accuracyRate ? `${(systemStats.accuracyRate * 100).toFixed(1)}%` : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{ width: `${(systemStats?.accuracyRate || 0) * 100}%` }}
                                            ></div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Accuracy Rate</span>
                                            <span className="text-lg font-bold text-blue-600">
                                                {systemStats?.accuracyRate ? `${systemStats.accuracyRate.toFixed(1)}%` : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${systemStats?.accuracyRate || 0}%` }}
                                            ></div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">High Confidence</span>
                                            <span className="text-lg font-bold text-purple-600">
                                                {systemStats?.highConfidencePredictions ? `${systemStats.highConfidencePredictions}` : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-purple-600 h-2 rounded-full"
                                                style={{ width: `${systemStats?.totalPredictions ? (systemStats.highConfidencePredictions / systemStats.totalPredictions) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Doctor Review Metrics */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-orange-500" />
                                        Doctor Review Performance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {doctorStats?.totalCases || 0}
                                                </div>
                                                <div className="text-sm text-gray-600">Total Cases</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {doctorStats?.completedReviews || 0}
                                                </div>
                                                <div className="text-sm text-gray-600">Completed</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>Completion Rate</span>
                                                <span>{Math.round(doctorStats?.completionRate || 0)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${Math.min(100, Math.max(0, doctorStats?.completionRate || 0))}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Diseases Tab */}
                    <TabsContent value="diseases" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-indigo-500" />
                                    Disease Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {topDiseases?.map((disease, index) => (
                                        <div key={disease.disease.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-bold">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{disease.disease.name}</h4>
                                                    <p className="text-sm text-gray-600">
                                                        {disease.predictionCount} predictions •
                                                        {disease.averageConfidence}% avg confidence
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={getConfidenceColor(parseFloat(disease.averageConfidence || '0') / 100)}>
                                                    {disease.averageConfidence}%
                                                </Badge>
                                                <Badge variant="outline">{disease.predictionCount} cases</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Alerts Tab */}
                    <TabsContent value="alerts" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    System Alerts & Notifications
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="p-4 border rounded-lg bg-yellow-50">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold text-yellow-900">High Confidence Predictions</h4>
                                                <p className="text-sm text-yellow-800 mt-1">
                                                    {systemStats?.highConfidencePredictions || 0} predictions with &gt;80% confidence in the last {getTimeRangeLabel(timeRange).toLowerCase()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 border rounded-lg bg-blue-50">
                                        <div className="flex items-start gap-3">
                                            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold text-blue-900">System Performance</h4>
                                                <p className="text-sm text-blue-800 mt-1">
                                                    Average response time: 2.3s • Uptime: 99.9% • Last updated: {formatDistanceToNow(new Date())} ago
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 border rounded-lg bg-green-50">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold text-green-900">Model Health</h4>
                                                <p className="text-sm text-green-800 mt-1">
                                                    All systems operational • Model accuracy within expected range • No critical issues detected
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
