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

export default function DoctorDashboard() {
    const router = useRouter();

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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                                    <p className="text-2xl font-bold text-gray-900">8</p>
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
                                    <p className="text-sm font-medium text-gray-600">Active Patients</p>
                                    <p className="text-2xl font-bold text-gray-900">24</p>
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
                                    <p className="text-sm font-medium text-gray-600">Completed Today</p>
                                    <p className="text-2xl font-bold text-gray-900">12</p>
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
                                    <p className="text-sm font-medium text-gray-600">AI Accuracy</p>
                                    <p className="text-2xl font-bold text-gray-900">94%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleReviewCases}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HeartPulse className="h-5 w-5 text-red-500" />
                                Patient Reviews
                                <Badge variant="destructive" className="ml-auto">8</Badge>
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

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Reviews</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg">
                                    <div className="p-2 bg-red-100 rounded-full">
                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">High-risk case needs review</p>
                                        <p className="text-xs text-gray-600">Patient: John Doe • 30 min ago</p>
                                    </div>
                                    <Badge variant="destructive">Urgent</Badge>
                                </div>

                                <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
                                    <div className="p-2 bg-yellow-100 rounded-full">
                                        <Clock className="h-4 w-4 text-yellow-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">AI diagnosis pending review</p>
                                        <p className="text-xs text-gray-600">Patient: Jane Smith • 1 hour ago</p>
                                    </div>
                                    <Badge variant="outline">Pending</Badge>
                                </div>

                                <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                                    <div className="p-2 bg-green-100 rounded-full">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Review completed</p>
                                        <p className="text-xs text-gray-600">Patient: Mike Johnson • 2 hours ago</p>
                                    </div>
                                    <Badge variant="secondary">Completed</Badge>
                                </div>
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
                                    <span className="text-sm font-medium">Overall Accuracy</span>
                                    <span className="text-sm font-bold text-green-600">94.2%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-600 h-2 rounded-full w-[94%]"></div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Doctor Agreement</span>
                                    <span className="text-sm font-bold text-blue-600">87.5%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full w-[87%]"></div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Response Time</span>
                                    <span className="text-sm font-bold text-purple-600">2.3s</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-purple-600 h-2 rounded-full w-[92%]"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
