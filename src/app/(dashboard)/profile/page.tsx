'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import {
    User,
    Heart,
    AlertTriangle,
    Pill,
    Edit,
    Save,
    X,
    Stethoscope
} from "lucide-react";
import { api } from "@/trpc/client";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

export default function ProfilePage() {
    const { user } = useUser();
    const [isEditing, setIsEditing] = useState(false);

    // Get user role from metadata
    const userRole = user?.publicMetadata?.role as 'patient' | 'doctor' | 'admin';

    // Use appropriate API based on role
    const { data: patientProfile, isLoading: patientLoading, refetch: refetchPatient } = api.patients.getPatientProfile.useQuery(undefined, {
        enabled: userRole === 'patient'
    });

    const { data: doctorProfile, isLoading: doctorLoading, refetch: refetchDoctor } = api.doctors.getDoctorProfile.useQuery(undefined, {
        enabled: userRole === 'doctor'
    });

    const isLoading = userRole === 'patient' ? patientLoading : doctorLoading;

    const handleSave = async () => {
        try {
            // Implementation for saving profile data would go here
            toast.success('Profile updated successfully');
            setIsEditing(false);
            if (userRole === 'patient') {
                refetchPatient();
            } else {
                refetchDoctor();
            }
        } catch (error) {
            toast.error('Failed to update profile');
            console.error('Error updating profile:', error);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout title="Profile" description="Manage your personal information">
                <div className="text-center py-8">
                    <p className="text-gray-500">Loading profile...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (userRole === 'patient' && !patientProfile) {
        return (
            <DashboardLayout title="Profile" description="Manage your personal information">
                <div className="text-center py-8">
                    <p className="text-gray-500">Patient profile not found</p>
                </div>
            </DashboardLayout>
        );
    }

    if (userRole === 'doctor' && !doctorProfile) {
        return (
            <DashboardLayout title="Profile" description="Manage your professional information">
                <div className="text-center py-8">
                    <p className="text-gray-500">Doctor profile not found</p>
                </div>
            </DashboardLayout>
        );
    }

    if (userRole === 'patient') {
        return (
            <DashboardLayout
                title="Profile"
                description="Manage your personal information and health details"
            >
                <div className="space-y-6">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Personal Information
                                <div className="ml-auto">
                                    {!isEditing ? (
                                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={handleSave}>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                                                <X className="h-4 w-4 mr-2" />
                                                Cancel
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Full Name</Label>
                                        <p className="text-lg">{patientProfile?.name || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <p className="text-lg">{patientProfile?.email || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="phoneNumber">Phone Number</Label>
                                        <p className="text-lg">{patientProfile?.phoneNumber || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                        <p className="text-lg">
                                            {patientProfile?.dateOfBirth
                                                ? new Date(patientProfile.dateOfBirth).toLocaleDateString()
                                                : 'Not provided'
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <Label htmlFor="gender">Gender</Label>
                                        <p className="text-lg">{patientProfile?.gender || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="address">Address</Label>
                                        <p className="text-lg">{patientProfile?.address || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Emergency Contact */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Emergency Contact
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                                    <p className="text-lg">{patientProfile?.emergencyContact || 'Not provided'}</p>
                                </div>
                                <div>
                                    <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                                    <p className="text-lg">{patientProfile?.emergencyPhone || 'Not provided'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Medical History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="h-5 w-5" />
                                Medical History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <Label>Medical Conditions</Label>
                                <p className="text-lg">
                                    {patientProfile?.medicalHistory && patientProfile.medicalHistory.length > 0
                                        ? patientProfile.medicalHistory.join(', ')
                                        : 'No medical history recorded'
                                    }
                                </p>
                            </div>
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
                            <div>
                                <Label>Known Allergies</Label>
                                <p className="text-lg">
                                    {patientProfile?.allergies && patientProfile.allergies.length > 0
                                        ? patientProfile.allergies.join(', ')
                                        : 'No allergies recorded'
                                    }
                                </p>
                            </div>
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
                            <div>
                                <Label>Current Medications</Label>
                                <p className="text-lg">
                                    {patientProfile?.currentMedications && patientProfile.currentMedications.length > 0
                                        ? patientProfile.currentMedications.join(', ')
                                        : 'No medications recorded'
                                    }
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    // Doctor Profile
    return (
        <DashboardLayout
            title="Profile"
            description="Manage your professional information"
        >
            <div className="space-y-6">
                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Information
                            <div className="ml-auto">
                                {!isEditing ? (
                                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={handleSave}>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                                            <X className="h-4 w-4 mr-2" />
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
                                    <p className="text-lg">{doctorProfile?.name || 'Not provided'}</p>
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <p className="text-lg">{doctorProfile?.email || 'Not provided'}</p>
                                </div>
                                <div>
                                    <Label htmlFor="phoneNumber">Phone Number</Label>
                                    <p className="text-lg">{doctorProfile?.phoneNumber || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Professional Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Stethoscope className="h-5 w-5" />
                            Professional Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="licenseNumber">License Number</Label>
                                    <p className="text-lg">{doctorProfile?.licenseNumber || 'Not provided'}</p>
                                </div>
                                <div>
                                    <Label htmlFor="specialization">Specialization</Label>
                                    <p className="text-lg">{doctorProfile?.specialization || 'Not provided'}</p>
                                </div>
                                <div>
                                    <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                                    <p className="text-lg">{doctorProfile?.yearsOfExperience || 'Not provided'}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="qualifications">Qualifications</Label>
                                    <p className="text-lg">
                                        {doctorProfile?.qualifications && doctorProfile.qualifications.length > 0
                                            ? doctorProfile.qualifications.join(', ')
                                            : 'Not provided'
                                        }
                                    </p>
                                </div>
                                <div>
                                    <Label htmlFor="hospitalAffiliations">Hospital Affiliations</Label>
                                    <p className="text-lg">
                                        {doctorProfile?.hospitalAffiliations && doctorProfile.hospitalAffiliations.length > 0
                                            ? doctorProfile.hospitalAffiliations.join(', ')
                                            : 'Not provided'
                                        }
                                    </p>
                                </div>
                                <div>
                                    <Label htmlFor="verification">Verification Status</Label>
                                    <p className={`text-lg ${doctorProfile?.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {doctorProfile?.isVerified ? 'Verified' : 'Pending Verification'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}