'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import { AdminStatsCards } from "@/modules/admin/ui/components/admin-stats-cards";
import {
    Settings,
    Users,
    BarChart3,
    Brain,
    Shield,
    AlertTriangle,
    Activity,
    Server,
    Database,
    Cpu
} from "lucide-react";

export default function AdminDashboard() {
    const router = useRouter();

    const handleViewAnalytics = () => {
        router.push('/admin/analytics');
    };

    const handleManageUsers = () => {
        router.push('/admin/users');
    };

    const handleAIManagement = () => {
        router.push('/admin/ai-models');
    };

    const handleSystemMonitor = () => {
        router.push('/admin/monitor');
    };

    const handleManageDoctors = () => {
        router.push('/admin/doctors');
    };

    return (
        <DashboardLayout
            title="Admin Dashboard"
            description="System monitoring, AI performance, and platform management"
        >
            <div className="space-y-6">
                {/* Real-time System Stats */}
                <AdminStatsCards />

                {/* Main Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewAnalytics}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-500" />
                                System Analytics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Monitor AI model performance and system metrics with confidence intervals
                            </p>
                            <Button className="w-full" onClick={handleViewAnalytics}>
                                View Analytics
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleManageUsers}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-green-500" />
                                User Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Manage doctors, patients, and system access permissions
                            </p>
                            <Button variant="outline" className="w-full" onClick={handleManageUsers}>
                                Manage Users
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleAIManagement}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-purple-500" />
                                AI Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Configure AI models, training data, and prediction parameters
                            </p>
                            <Button variant="outline" className="w-full" onClick={handleAIManagement}>
                                Manage AI
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleSystemMonitor}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-red-500" />
                                System Monitor
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Real-time system monitoring and performance tracking
                            </p>
                            <Button variant="outline" className="w-full" onClick={handleSystemMonitor}>
                                Monitor System
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleManageDoctors}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-orange-500" />
                                Doctor Verification
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Verify doctor credentials and manage medical professional access
                            </p>
                            <Button variant="outline" className="w-full" onClick={handleManageDoctors}>
                                Manage Doctors
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-indigo-500" />
                                System Config
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Configure platform settings and AI parameters
                            </p>
                            <Button variant="outline" className="w-full" disabled>
                                Coming Soon
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* System Status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-green-100 rounded-full">
                                            <Server className="h-4 w-4 text-green-600" />
                                        </div>
                                        <span className="text-sm font-medium">API Server</span>
                                    </div>
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">Online</Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-green-100 rounded-full">
                                            <Database className="h-4 w-4 text-green-600" />
                                        </div>
                                        <span className="text-sm font-medium">Database</span>
                                    </div>
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">Online</Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-green-100 rounded-full">
                                            <Cpu className="h-4 w-4 text-green-600" />
                                        </div>
                                        <span className="text-sm font-medium">AI Models</span>
                                    </div>
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-yellow-100 rounded-full">
                                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                        </div>
                                        <span className="text-sm font-medium">Notification Service</span>
                                    </div>
                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Degraded</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                                    <div className="p-2 bg-blue-100 rounded-full">
                                        <Users className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">New doctor registered</p>
                                        <p className="text-xs text-gray-600">Dr. Sarah Chen • 15 min ago</p>
                                    </div>
                                    <Badge variant="secondary">New</Badge>
                                </div>

                                <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                                    <div className="p-2 bg-green-100 rounded-full">
                                        <Brain className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">AI model updated</p>
                                        <p className="text-xs text-gray-600">v2.1.3 deployed • 1 hour ago</p>
                                    </div>
                                    <Badge variant="secondary">Updated</Badge>
                                </div>

                                <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
                                    <div className="p-2 bg-yellow-100 rounded-full">
                                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">High prediction volume</p>
                                        <p className="text-xs text-gray-600">1,200+ requests/hour • 2 hours ago</p>
                                    </div>
                                    <Badge variant="outline">Alert</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
