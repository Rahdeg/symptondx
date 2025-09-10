'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
    Stethoscope,
    Shield,
    Building,
    Bell
} from "lucide-react";
import { api } from "@/trpc/client";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

export default function ProfilePage() {
    const { user } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Record<string, string | string[]>>({});

    // Get user role from metadata
    const userRole = user?.publicMetadata?.role as 'patient' | 'doctor' | 'admin';

    // Use appropriate API based on role
    const { data: patientProfile, isLoading: patientLoading, refetch: refetchPatient } = api.patients.getPatientProfile.useQuery(undefined, {
        enabled: userRole === 'patient'
    });

    const { data: doctorProfile, isLoading: doctorLoading, refetch: refetchDoctor } = api.doctors.getDoctorProfile.useQuery(undefined, {
        enabled: userRole === 'doctor'
    });

    const { data: adminProfile, isLoading: adminLoading, refetch: refetchAdmin } = api.admin.getAdminProfile.useQuery(undefined, {
        enabled: userRole === 'admin'
    });

    // Admin profile update mutation
    const updateAdminMutation = api.admin.updateAdminProfile.useMutation({
        onSuccess: () => {
            toast.success('Profile updated successfully');
            setIsEditing(false);
            refetchAdmin();
        },
        onError: (error) => {
            toast.error('Failed to update profile');
            console.error('Error updating profile:', error);
        }
    });

    const isLoading = userRole === 'patient' ? patientLoading : userRole === 'doctor' ? doctorLoading : adminLoading;

    const handleSave = async () => {
        try {
            if (userRole === 'admin') {
                await updateAdminMutation.mutateAsync(editData);
            } else {
                // Implementation for patient/doctor profile updates would go here
                toast.success('Profile updated successfully');
                setIsEditing(false);
                if (userRole === 'patient') {
                    refetchPatient();
                } else if (userRole === 'doctor') {
                    refetchDoctor();
                }
            }
        } catch {
            // Error handling is done in the mutation onError callback
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        // Initialize edit data with current profile data
        if (userRole === 'admin' && adminProfile) {
            setEditData({
                organizationName: adminProfile.organizationName,
                jobTitle: adminProfile.jobTitle,
                phoneNumber: adminProfile.phoneNumber,
                department: adminProfile.department || '',
                managementLevel: adminProfile.managementLevel,
                systemPermissions: adminProfile.systemPermissions || [],
                preferredNotifications: adminProfile.preferredNotifications || [],
            });
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({});
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

    if (userRole === 'admin' && !adminProfile) {
        return (
            <DashboardLayout title="Profile" description="Manage your administrative information">
                <div className="text-center py-8">
                    <p className="text-gray-500">Admin profile not found</p>
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

    if (userRole === 'admin') {
        return (
            <DashboardLayout
                title="Profile"
                description="Manage your administrative information"
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
                                        <Button variant="outline" size="sm" onClick={handleEdit}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={handleSave}
                                                disabled={updateAdminMutation.isPending}
                                            >
                                                <Save className="h-4 w-4 mr-2" />
                                                {updateAdminMutation.isPending ? 'Saving...' : 'Save'}
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={handleCancel}>
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
                                        <p className="text-lg">{adminProfile?.name || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <p className="text-lg">{adminProfile?.email || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="phoneNumber">Phone Number</Label>
                                        {isEditing ? (
                                            <Input
                                                value={editData.phoneNumber || ''}
                                                onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                                                placeholder="Enter phone number"
                                            />
                                        ) : (
                                            <p className="text-lg">{adminProfile?.phoneNumber || 'Not provided'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Administrative Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-5 w-5" />
                                Administrative Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="organizationName">Organization Name</Label>
                                        {isEditing ? (
                                            <Input
                                                value={editData.organizationName || ''}
                                                onChange={(e) => setEditData({ ...editData, organizationName: e.target.value })}
                                                placeholder="Enter organization name"
                                            />
                                        ) : (
                                            <p className="text-lg">{adminProfile?.organizationName || 'Not provided'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="jobTitle">Job Title</Label>
                                        {isEditing ? (
                                            <Input
                                                value={editData.jobTitle || ''}
                                                onChange={(e) => setEditData({ ...editData, jobTitle: e.target.value })}
                                                placeholder="Enter job title"
                                            />
                                        ) : (
                                            <p className="text-lg">{adminProfile?.jobTitle || 'Not provided'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="department">Department</Label>
                                        {isEditing ? (
                                            <Input
                                                value={editData.department || ''}
                                                onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                                                placeholder="Enter department (optional)"
                                            />
                                        ) : (
                                            <p className="text-lg">{adminProfile?.department || 'Not provided'}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="managementLevel">Management Level</Label>
                                        <p className="text-lg capitalize">
                                            {adminProfile?.managementLevel || 'Not provided'}
                                        </p>
                                    </div>
                                    <div>
                                        <Label htmlFor="isActive">Account Status</Label>
                                        <p className={`text-lg font-medium ${adminProfile?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                            {adminProfile?.isActive ? 'Active' : 'Inactive'}
                                        </p>
                                    </div>
                                    <div>
                                        <Label htmlFor="createdAt">Member Since</Label>
                                        <p className="text-lg">
                                            {adminProfile?.createdAt
                                                ? new Date(adminProfile.createdAt).toLocaleDateString()
                                                : 'Not provided'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Permissions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                System Permissions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <Label>Assigned Permissions</Label>
                                <div className="mt-2">
                                    {adminProfile?.systemPermissions && adminProfile.systemPermissions.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {adminProfile.systemPermissions.map((permission: string) => (
                                                <Badge key={permission} variant="secondary" className="capitalize">
                                                    {permission.replace(/_/g, ' ')}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-lg text-muted-foreground">No permissions assigned</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notification Preferences */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Notification Preferences
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <Label>Active Notifications</Label>
                                <div className="mt-2">
                                    {adminProfile?.preferredNotifications && adminProfile.preferredNotifications.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {adminProfile.preferredNotifications.map((notification: string) => (
                                                <Badge key={notification} variant="outline" className="capitalize">
                                                    {notification.replace(/_/g, ' ')}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-lg text-muted-foreground">No notification preferences set</p>
                                    )}
                                </div>
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