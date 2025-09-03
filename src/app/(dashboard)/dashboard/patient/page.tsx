'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import {
    Heart,
    Activity,
    Calendar,
    Brain,
    FileText,
    TrendingUp,
    Clock,
    AlertTriangle,
    CheckCircle
} from "lucide-react";

export default function PatientDashboard() {
    const router = useRouter();

    const handleStartAnalysis = () => {
        router.push('/diagnosis/new');
    };

    const handleViewHistory = () => {
        router.push('/health-history');
    };

    const handleScheduleAppointment = () => {
        router.push('/appointments');
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Diagnoses</p>
                                    <p className="text-2xl font-bold text-gray-900">12</p>
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
                                    <p className="text-2xl font-bold text-gray-900">8</p>
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
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-gray-900">3</p>
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
                                    <p className="text-sm font-medium text-gray-600">Urgent</p>
                                    <p className="text-2xl font-bold text-gray-900">1</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleScheduleAppointment}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-orange-500" />
                                Appointments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Schedule appointments with healthcare providers
                            </p>
                            <Button variant="outline" className="w-full" onClick={handleScheduleAppointment}>
                                Schedule
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

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <Brain className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Symptom analysis completed</p>
                                    <p className="text-xs text-gray-600">2 hours ago</p>
                                </div>
                                <Badge variant="secondary">Completed</Badge>
                            </div>

                            <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
                                <div className="p-2 bg-yellow-100 rounded-full">
                                    <Clock className="h-4 w-4 text-yellow-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Doctor review pending</p>
                                    <p className="text-xs text-gray-600">1 day ago</p>
                                </div>
                                <Badge variant="outline">Pending</Badge>
                            </div>

                            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Appointment scheduled</p>
                                    <p className="text-xs text-gray-600">3 days ago</p>
                                </div>
                                <Badge variant="secondary">Scheduled</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
