'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Users,
    Search,
    Calendar,
    Heart,
    Mail,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { api } from '@/trpc/client';
import { formatDistanceToNow } from 'date-fns';

export default function DoctorPatientsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Fetch urgent cases with patient details
    const { data: urgentCases, isLoading } = api.doctors.getUrgentCases.useQuery();

    // Get unique patients from urgent cases
    const patients = urgentCases ?
        urgentCases.reduce((acc: Array<{ patientName: string | null; patientAge: Date | null; patientGender: string | null; sessionId: string; chiefComplaint: string | null; status: string; lastSession: string; totalSessions: number; urgencyLevel: string | null; isEmergency: boolean | null }>, urgentCase: { id: string; chiefComplaint: string | null; status: string; createdAt: Date | null; urgencyLevel: string | null; isEmergency: boolean | null; patientName: string | null; patientAge: Date | null; patientGender: string | null }) => {
            const existingPatient = acc.find(p => p.patientName === urgentCase.patientName);
            if (!existingPatient) {
                acc.push({
                    patientName: urgentCase.patientName,
                    patientAge: urgentCase.patientAge,
                    patientGender: urgentCase.patientGender,
                    sessionId: urgentCase.id,
                    chiefComplaint: urgentCase.chiefComplaint,
                    status: urgentCase.status,
                    totalSessions: 1,
                    lastSession: urgentCase.createdAt ? urgentCase.createdAt.toISOString() : 'Unknown',
                    urgencyLevel: urgentCase.urgencyLevel,
                    isEmergency: urgentCase.isEmergency
                });
            } else {
                existingPatient.totalSessions += 1;
                if (urgentCase.createdAt && new Date(urgentCase.createdAt) > new Date(existingPatient.lastSession)) {
                    existingPatient.lastSession = urgentCase.createdAt.toISOString();
                    existingPatient.status = urgentCase.status;
                    existingPatient.urgencyLevel = urgentCase.urgencyLevel;
                    existingPatient.isEmergency = urgentCase.isEmergency;
                }
            }
            return acc;
        }, []) : [];

    const filteredPatients = patients.filter(patient => {
        const matchesSearch = patient.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.chiefComplaint?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'reviewed': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getUrgencyColor = (urgency: string | null) => {
        switch (urgency) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <DashboardLayout
            title="My Patients"
            description="Manage your assigned patients and their cases"
        >
            <div className="space-y-6">
                {/* Search and Filter */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <Label htmlFor="search">Search Patients</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Search by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="md:w-48">
                                <Label htmlFor="status">Filter by Status</Label>
                                <select
                                    id="status"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    aria-label="Filter by status"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="reviewed">Reviewed</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Patients List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        <div className="col-span-full text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading patients...</p>
                        </div>
                    ) : filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                            <Card key={patient.sessionId} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-blue-500" />
                                        {patient.patientName || 'Anonymous'}
                                        {patient.isEmergency && (
                                            <AlertTriangle className="h-4 w-4 text-red-500" />
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">No email available</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                                Age: {patient.patientAge ? new Date().getFullYear() - new Date(patient.patientAge).getFullYear() : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Heart className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                                Gender: {patient.patientGender || 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Total Cases: </span>
                                            <span className="font-medium">{patient.totalSessions}</span>
                                        </div>
                                        <Badge className={getStatusColor(patient.status)}>
                                            {patient.status}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4 inline mr-1" />
                                            Last seen: {formatDistanceToNow(new Date(patient.lastSession))} ago
                                        </div>
                                        <Badge
                                            className={getUrgencyColor(patient.urgencyLevel || 'medium')}
                                        >
                                            {patient.isEmergency ? 'Emergency' : patient.urgencyLevel || 'Medium'}
                                        </Badge>
                                    </div>

                                    <Button className="w-full" variant="outline">
                                        View Details
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No patients found</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Patients will appear here when they request doctor reviews
                            </p>
                        </div>
                    )}
                </div>

                {/* Summary Stats */}
                {patients.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Patient Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {patients.length}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Total Patients</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {patients.filter(p => p.status === 'pending').length}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Pending Cases</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {patients.filter(p => p.status === 'reviewed').length}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Completed Reviews</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                        {patients.filter(p => p.isEmergency).length}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Emergency Cases</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
