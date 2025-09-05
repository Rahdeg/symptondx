'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import {
    Activity,
    Heart,
    Pill,
    AlertTriangle,
    Plus,
    Edit,
    Calendar,
    User
} from "lucide-react";
import { api } from "@/trpc/client";
import { formatDistanceToNow } from "date-fns";

export default function HealthHistoryPage() {
    const { data: patientProfile, isLoading: profileLoading } = api.patients.getPatientProfile.useQuery();
    const { data: sessionsData, isLoading: sessionsLoading } = api.patients.getDiagnosisSessions.useQuery({
        page: 1,
        limit: 50
    });

    const formatDate = (date: Date | string | null) => {
        if (!date) return 'Not provided';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateAge = (dateOfBirth: Date | string | null) => {
        if (!dateOfBirth) return 'Not provided';
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <DashboardLayout
            title="Health History"
            description="Your complete medical history and health information"
        >
            <div className="space-y-6">
                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {profileLoading ? (
                            <div className="text-center py-4">
                                <p className="text-gray-500">Loading profile...</p>
                            </div>
                        ) : patientProfile ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Name</label>
                                        <p className="text-lg">{patientProfile.name || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Email</label>
                                        <p className="text-lg">{patientProfile.email || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Phone Number</label>
                                        <p className="text-lg">{patientProfile.phoneNumber || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                                        <p className="text-lg">{formatDate(patientProfile.dateOfBirth)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Age</label>
                                        <p className="text-lg">{calculateAge(patientProfile.dateOfBirth)} years old</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Gender</label>
                                        <p className="text-lg">{patientProfile.gender || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-gray-500">Profile not found</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Medical History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Medical History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {profileLoading ? (
                            <div className="text-center py-4">
                                <p className="text-gray-500">Loading medical history...</p>
                            </div>
                        ) : patientProfile?.medicalHistory && patientProfile.medicalHistory.length > 0 ? (
                            <div className="space-y-2">
                                {patientProfile.medicalHistory.map((condition, index) => (
                                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                        <Heart className="h-4 w-4 text-red-500" />
                                        <span>{condition}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-gray-500">No medical history recorded</p>
                                <Button variant="outline" className="mt-2" disabled>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Medical History
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Allergies */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Allergies
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {profileLoading ? (
                            <div className="text-center py-4">
                                <p className="text-gray-500">Loading allergies...</p>
                            </div>
                        ) : patientProfile?.allergies && patientProfile.allergies.length > 0 ? (
                            <div className="space-y-2">
                                {patientProfile.allergies.map((allergy, index) => (
                                    <Badge key={index} variant="destructive" className="mr-2 mb-2">
                                        {allergy}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-gray-500">No allergies recorded</p>
                                <Button variant="outline" className="mt-2" disabled>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Allergy
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Current Medications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Pill className="h-5 w-5" />
                            Current Medications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {profileLoading ? (
                            <div className="text-center py-4">
                                <p className="text-gray-500">Loading medications...</p>
                            </div>
                        ) : patientProfile?.currentMedications && patientProfile.currentMedications.length > 0 ? (
                            <div className="space-y-2">
                                {patientProfile.currentMedications.map((medication, index) => (
                                    <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                                        <Pill className="h-4 w-4 text-blue-500" />
                                        <span>{medication}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-gray-500">No current medications recorded</p>
                                <Button variant="outline" className="mt-2" disabled>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Medication
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Diagnosis Sessions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Recent Diagnosis Sessions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {sessionsLoading ? (
                            <div className="text-center py-4">
                                <p className="text-gray-500">Loading recent sessions...</p>
                            </div>
                        ) : sessionsData?.sessions && sessionsData.sessions.length > 0 ? (
                            <div className="space-y-3">
                                {sessionsData.sessions.slice(0, 5).map((session) => (
                                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-full">
                                                <Activity className="h-4 w-4 text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{session.chiefComplaint || 'Symptom Analysis'}</p>
                                                <p className="text-sm text-gray-600">
                                                    {session.createdAt ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true }) : 'Unknown date'}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={session.status === 'completed' ? 'secondary' : 'outline'}>
                                            {session.status}
                                        </Badge>
                                    </div>
                                ))}
                                {sessionsData.sessions.length > 5 && (
                                    <div className="text-center pt-2">
                                        <Button variant="outline" onClick={() => window.location.href = '/diagnoses'}>
                                            View All Sessions
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-gray-500">No diagnosis sessions found</p>
                                <Button variant="outline" className="mt-2" onClick={() => window.location.href = '/diagnosis/new'}>
                                    Start New Analysis
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Emergency Contact */}
                {patientProfile?.address && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Address</label>
                                    <p className="text-lg">{patientProfile.address}</p>
                                </div>
                                {patientProfile.emergencyContact && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                                        <p className="text-lg">{patientProfile.emergencyContact}</p>
                                        {patientProfile.emergencyPhone && (
                                            <p className="text-sm text-gray-600">{patientProfile.emergencyPhone}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
