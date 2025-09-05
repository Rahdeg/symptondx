'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Brain,
    TrendingUp,
    Target,
    AlertTriangle,
    CheckCircle,
    BarChart3,
    Activity,
    Clock,
    Users,
    FileText
} from 'lucide-react';
import { api } from '@/trpc/client';

export default function DoctorAIInsightsPage() {
    const [selectedPeriod, setSelectedPeriod] = useState('week');

    // Fetch AI performance data
    const { data: reviewMetrics, isLoading: metricsLoading } = api.doctors.getReviewMetrics.useQuery({
        period: selectedPeriod as 'today' | 'week' | 'month'
    });

    // Fetch assigned sessions for AI analysis
    const { data: sessions, isLoading: sessionsLoading } = api.doctors.getAssignedSessions.useQuery({
        page: 1,
        limit: 50,
    });

    // Calculate AI performance metrics
    const aiMetrics = {
        totalCases: sessions?.sessions?.length || 0,
        aiAccuracy: 87.5, // This would come from actual AI performance data
        averageConfidence: 82.3, // This would come from actual AI confidence data
        agreementRate: 78.9, // This would come from doctor-AI agreement data
        falsePositives: 12,
        falseNegatives: 8,
        responseTime: 2.3, // Average response time in minutes
    };

    const diseaseCategories = [
        { name: 'Respiratory', cases: 45, accuracy: 92.1, trend: 'up' },
        { name: 'Cardiovascular', cases: 32, accuracy: 88.7, trend: 'down' },
        { name: 'Gastrointestinal', cases: 28, accuracy: 85.4, trend: 'up' },
        { name: 'Neurological', cases: 15, accuracy: 90.2, trend: 'stable' },
        { name: 'Dermatological', cases: 12, accuracy: 94.1, trend: 'up' },
    ];

    const recentAIInsights = [
        {
            id: 1,
            type: 'accuracy_improvement',
            title: 'AI Accuracy Improved',
            description: 'Respiratory disease detection accuracy increased by 3.2% this week',
            impact: 'high',
            timestamp: '2 hours ago'
        },
        {
            id: 2,
            type: 'pattern_detected',
            title: 'New Pattern Detected',
            description: 'AI identified a correlation between symptoms X and Y in 15 cases',
            impact: 'medium',
            timestamp: '1 day ago'
        },
        {
            id: 3,
            type: 'confidence_alert',
            title: 'Low Confidence Alert',
            description: 'AI confidence dropped below 70% for neurological cases',
            impact: 'high',
            timestamp: '2 days ago'
        },
        {
            id: 4,
            type: 'model_update',
            title: 'Model Updated',
            description: 'New AI model version deployed with improved accuracy',
            impact: 'low',
            timestamp: '3 days ago'
        },
    ];

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
            case 'stable': return <Activity className="h-4 w-4 text-blue-500" />;
            default: return <Activity className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <DashboardLayout
            title="AI Insights"
            description="Monitor AI performance and diagnostic accuracy"
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

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Brain className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">AI Accuracy</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {aiMetrics.aiAccuracy}%
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
                                    <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {aiMetrics.averageConfidence}%
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
                                    <p className="text-sm font-medium text-gray-600">Agreement Rate</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {aiMetrics.agreementRate}%
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Clock className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Response Time</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {aiMetrics.responseTime}m
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Disease Category Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-500" />
                                Performance by Category
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {diseaseCategories.map((category) => (
                                    <div key={category.name} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-medium">{category.name}</h4>
                                                {getTrendIcon(category.trend)}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span>{category.cases} cases</span>
                                                <span>{category.accuracy}% accuracy</span>
                                            </div>
                                        </div>
                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${category.accuracy}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Insights */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-green-500" />
                                Recent Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentAIInsights.map((insight) => (
                                    <div key={insight.id} className="flex items-start gap-3 p-3 border rounded-lg">
                                        <div className="p-1 bg-gray-100 rounded-full">
                                            <Brain className="h-4 w-4 text-gray-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-medium text-sm">{insight.title}</h4>
                                                <Badge className={getImpactColor(insight.impact)}>
                                                    {insight.impact}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-1">{insight.description}</p>
                                            <p className="text-xs text-gray-500">{insight.timestamp}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* AI Model Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-purple-500" />
                            AI Model Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="font-semibold mb-1">Model Status</h3>
                                <p className="text-sm text-gray-600">Active & Healthy</p>
                            </div>
                            <div className="text-center">
                                <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                                    <FileText className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="font-semibold mb-1">Version</h3>
                                <p className="text-sm text-gray-600">v2.1.3</p>
                            </div>
                            <div className="text-center">
                                <div className="p-3 bg-orange-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                                    <Clock className="h-8 w-8 text-orange-600" />
                                </div>
                                <h3 className="font-semibold mb-1">Last Updated</h3>
                                <p className="text-sm text-gray-600">3 days ago</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
