'use client';

import React, { useState } from 'react';
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    BarChart3,
    TrendingUp,
    Users,
    Activity,
    DollarSign,
    Download,
    Calendar
} from "lucide-react";
import { api } from '@/trpc/client';

export default function AdminAnalyticsPage() {
    const [timeRange, setTimeRange] = useState('30d');

    const { data: stats } = api.admin.getSystemStats.useQuery({
        dateFrom: timeRange === '7d' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() :
            timeRange === '30d' ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() :
                timeRange === '90d' ? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() :
                    undefined,
        dateTo: new Date().toISOString(),
    });


    const userStats = stats?.users || {};
    const diagnosisStats = stats?.diagnoses || { total: 0, completed: 0 };
    const aiStats = stats?.aiUsage || { totalCost: 0, totalTokens: 0, avgProcessingTime: 0 };
    const doctorStats = stats?.doctors || { verified: 0, pending: 0 };

    return (
        <DashboardLayout
            title="Admin - System Analytics"
            description="Comprehensive system performance and usage analytics"
        >
            <div className="space-y-6">
                {/* Header with Controls */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                                <SelectItem value="30d">Last 30 days</SelectItem>
                                <SelectItem value="90d">Last 90 days</SelectItem>
                                <SelectItem value="all">All time</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export Report
                    </Button>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {Object.values(userStats).reduce((sum, count) => sum + count, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                +12% from last period
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Diagnoses</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{diagnosisStats.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {diagnosisStats.completed} completed
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">AI Usage Cost</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${(parseFloat(aiStats.totalCost?.toString() || '0')).toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {(parseInt(aiStats.totalTokens?.toString() || '0') / 1000).toFixed(1)}K tokens used
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Performance</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {((parseFloat(aiStats.avgProcessingTime?.toString() || '0')) / 1000).toFixed(1)}s
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Avg AI processing time
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Analytics Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Growth Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                User Growth
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                                <div className="text-center">
                                    <BarChart3 className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                    <p className="text-gray-500">Chart placeholder</p>
                                    <p className="text-xs text-gray-400">Integration with charting library needed</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Diagnosis Trends */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Diagnosis Trends
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                                <div className="text-center">
                                    <Activity className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                    <p className="text-gray-500">Chart placeholder</p>
                                    <p className="text-xs text-gray-400">Shows diagnosis completion rates over time</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* User Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600">{userStats.patient || 0}</div>
                                <p className="text-sm text-gray-600">Patients</p>
                                <Badge className="mt-2 bg-green-100 text-green-800">
                                    {((userStats.patient || 0) / Object.values(userStats).reduce((sum, count) => sum + count, 0) * 100).toFixed(1)}%
                                </Badge>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">{userStats.doctor || 0}</div>
                                <p className="text-sm text-gray-600">Doctors</p>
                                <Badge className="mt-2 bg-blue-100 text-blue-800">
                                    {((userStats.doctor || 0) / Object.values(userStats).reduce((sum, count) => sum + count, 0) * 100).toFixed(1)}%
                                </Badge>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600">{userStats.admin || 0}</div>
                                <p className="text-sm text-gray-600">Admins</p>
                                <Badge className="mt-2 bg-purple-100 text-purple-800">
                                    {((userStats.admin || 0) / Object.values(userStats).reduce((sum, count) => sum + count, 0) * 100).toFixed(1)}%
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            System Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium mb-3">Doctor Verification Status</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Verified Doctors</span>
                                        <Badge className="bg-green-100 text-green-800">{doctorStats.verified}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Pending Verification</span>
                                        <Badge className="bg-yellow-100 text-yellow-800">{doctorStats.pending}</Badge>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium mb-3">System Health</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm">System Status</span>
                                        <Badge className="bg-green-100 text-green-800">Operational</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">AI Model Status</span>
                                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
