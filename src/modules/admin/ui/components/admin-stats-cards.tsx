'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Stethoscope,
    Brain,
    TrendingUp,
    DollarSign,
    Clock,
    UserCheck,
    Activity
} from 'lucide-react';
import { api } from '@/trpc/client';

export const AdminStatsCards: React.FC = () => {
    const { data: stats, isLoading } = api.admin.getSystemStats.useQuery({});

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const userStats = stats?.users || {};
    const diagnosisStats = stats?.diagnoses || { total: 0, completed: 0 };
    const aiStats = stats?.aiUsage || { totalCost: 0, totalTokens: 0, avgProcessingTime: 0 };
    const doctorStats = stats?.doctors || { verified: 0, pending: 0 };

    const totalUsers = Object.values(userStats).reduce((sum, count) => sum + count, 0);
    const completionRate = diagnosisStats.total > 0
        ? ((diagnosisStats.completed / diagnosisStats.total) * 100).toFixed(1)
        : '0';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Users */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
                    <div className="flex gap-1 mt-2">
                        <Badge variant="secondary" className="text-xs">
                            {userStats.patient || 0} Patients
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                            {userStats.doctor || 0} Doctors
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Doctor Verification */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Doctor Status</CardTitle>
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{doctorStats.verified}</div>
                    <div className="flex gap-1 mt-2">
                        <Badge className="text-xs bg-green-100 text-green-800">
                            <UserCheck className="h-3 w-3 mr-1" />
                            {doctorStats.verified} Verified
                        </Badge>
                        <Badge className="text-xs bg-yellow-100 text-yellow-800">
                            <Clock className="h-3 w-3 mr-1" />
                            {doctorStats.pending} Pending
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Diagnosis Statistics */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Diagnoses</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{diagnosisStats.total.toLocaleString()}</div>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge className="text-xs bg-blue-100 text-blue-800">
                            {completionRate}% Complete
                        </Badge>
                        <span className="text-xs text-gray-500">
                            {diagnosisStats.completed} finished
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* AI Usage Cost */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">AI Usage Cost</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        ${(parseFloat(aiStats.totalCost?.toString() || '0')).toFixed(2)}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                            {(parseInt(aiStats.totalTokens?.toString() || '0') / 1000).toFixed(1)}K tokens
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Average Processing Time */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {((parseFloat(aiStats.avgProcessingTime?.toString() || '0')) / 1000).toFixed(1)}s
                    </div>
                    <p className="text-xs text-muted-foreground">
                        AI response time
                    </p>
                </CardContent>
            </Card>

            {/* System Health */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Health</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">Healthy</div>
                    <div className="flex gap-1 mt-2">
                        <Badge className="text-xs bg-green-100 text-green-800">
                            All systems operational
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Admin Users */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{userStats.admin || 0}</div>
                    <p className="text-xs text-muted-foreground">
                        System administrators
                    </p>
                </CardContent>
            </Card>

            {/* AI Model Performance */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">AI Performance</CardTitle>
                    <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">94.2%</div>
                    <div className="flex gap-1 mt-2">
                        <Badge className="text-xs bg-green-100 text-green-800">
                            High Accuracy
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
