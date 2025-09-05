'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import {
    FileText,
    Clock,
    CheckCircle,
    AlertTriangle,
    Eye,
    Calendar,
    Filter
} from "lucide-react";
import { api } from "@/trpc/client";
import { formatDistanceToNow } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DiagnosesPage() {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;

    const { data: sessionsData, isLoading, refetch } = api.patients.getDiagnosisSessions.useQuery({
        page: currentPage,
        limit,
        status: statusFilter === 'all' ? undefined : statusFilter as "pending" | "in_progress" | "completed" | "reviewed" | "cancelled"
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-50';
            case 'in_progress': return 'text-blue-600 bg-blue-50';
            case 'pending': return 'text-yellow-600 bg-yellow-50';
            case 'reviewed': return 'text-purple-600 bg-purple-50';
            case 'cancelled': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-4 w-4" />;
            case 'in_progress': return <Clock className="h-4 w-4" />;
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'reviewed': return <FileText className="h-4 w-4" />;
            case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'emergency': return 'destructive';
            case 'high': return 'destructive';
            case 'medium': return 'secondary';
            case 'low': return 'outline';
            default: return 'outline';
        }
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const handleViewDetails = (sessionId: string) => {
        window.location.href = `/diagnosis/results/${sessionId}`;
    };

    return (
        <DashboardLayout
            title="My Diagnoses"
            description="View your diagnosis history and results"
        >
            <div className="space-y-6">
                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 items-center">
                            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="reviewed">Reviewed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Diagnosis Sessions */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Loading diagnoses...</p>
                        </div>
                    ) : sessionsData?.sessions && sessionsData.sessions.length > 0 ? (
                        sessionsData.sessions.map((session) => (
                            <Card key={session.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`p-2 rounded-full ${getStatusColor(session.status)}`}>
                                                    {getStatusIcon(session.status)}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg">
                                                        {session.chiefComplaint || 'Symptom Analysis'}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {session.createdAt ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true }) : 'Unknown date'}
                                                    </p>
                                                </div>
                                            </div>

                                            {session.additionalInfo && (
                                                <p className="text-sm text-gray-700 mb-3">
                                                    {session.additionalInfo}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                    <span className="text-gray-600">
                                                        {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : 'Unknown date'}
                                                    </span>
                                                </div>

                                                {session.urgencyLevel && (
                                                    <Badge variant={getUrgencyColor(session.urgencyLevel)}>
                                                        {session.urgencyLevel.toUpperCase()} PRIORITY
                                                    </Badge>
                                                )}

                                                {session.isEmergency && (
                                                    <Badge variant="destructive">
                                                        EMERGENCY
                                                    </Badge>
                                                )}
                                            </div>

                                            {session.finalDiagnosis && (
                                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                    <p className="text-sm font-medium text-blue-900">Final Diagnosis:</p>
                                                    <p className="text-blue-800">{session.finalDiagnosis}</p>
                                                    {session.confidence_score && (
                                                        <p className="text-xs text-blue-600 mt-1">
                                                            Confidence: {session.confidence_score}%
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 ml-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewDetails(session.id)}
                                                className="flex items-center gap-1"
                                            >
                                                <Eye className="h-4 w-4" />
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Diagnoses Found</h3>
                                <p className="text-gray-600 mb-4">
                                    {statusFilter === 'all'
                                        ? "You haven't completed any symptom analyses yet."
                                        : `No diagnoses found with status: ${statusFilter}`
                                    }
                                </p>
                                <Button onClick={() => window.location.href = '/diagnosis/new'}>
                                    Start New Analysis
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Pagination */}
                {sessionsData && sessionsData.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-gray-600">
                            Page {currentPage} of {sessionsData.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(sessionsData.totalPages, prev + 1))}
                            disabled={currentPage === sessionsData.totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
