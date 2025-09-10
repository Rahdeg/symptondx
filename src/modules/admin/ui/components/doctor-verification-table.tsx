'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    UserCheck,
    UserX,
    Stethoscope,
    AlertTriangle,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Loader2
} from 'lucide-react';
import { api } from '@/trpc/client';
import { formatDistanceToNow } from 'date-fns';

// Skeleton loading component for doctor table rows
const DoctorTableSkeleton: React.FC = () => {
    return (
        <>
            {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                    <TableCell>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 w-24 font-mono" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-8 w-20" />
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
};

interface DoctorData {
    doctor: {
        id: string;
        licenseNumber: string;
        specialization: string | null;
        yearsOfExperience: number | null;
        qualifications: string | null;
        hospitalAffiliations: string | null;
        isVerified: boolean | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    };
    user?: {
        id: string;
        name: string | null;
        email: string;
        createdAt: Date | null;
    } | null;
}

interface VerificationModalProps {
    doctor: DoctorData | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
    doctor,
    isOpen,
    onClose,
    onSuccess
}) => {
    const [action, setAction] = useState<'verify' | 'reject' | null>(null);
    const [notes, setNotes] = useState('');

    const verifyDoctor = api.admin.verifyDoctor.useMutation({
        onSuccess: () => {
            onSuccess();
            onClose();
            setAction(null);
            setNotes('');
        },
    });

    const handleVerify = (isVerified: boolean) => {
        if (!doctor) return;
        setAction(isVerified ? 'verify' : 'reject');
    };

    const handleConfirm = () => {
        if (!doctor || action === null) return;

        verifyDoctor.mutate({
            doctorId: doctor.doctor.id,
            isVerified: action === 'verify',
            notes: notes || undefined,
        });
    };

    const handleClose = () => {
        setAction(null);
        setNotes('');
        onClose();
    };

    if (!doctor) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5" />
                        Doctor Verification - {doctor.user?.name || 'Unknown Doctor'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Doctor Information */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Name</label>
                            <p className="text-sm">{doctor.user?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Email</label>
                            <p className="text-sm">{doctor.user?.email || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">License Number</label>
                            <p className="text-sm font-mono">{doctor.doctor.licenseNumber}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Specialization</label>
                            <p className="text-sm">{doctor.doctor.specialization || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Years of Experience</label>
                            <p className="text-sm">{doctor.doctor.yearsOfExperience || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Registration Date</label>
                            <p className="text-sm">{doctor.user?.createdAt ? formatDistanceToNow(new Date(doctor.user.createdAt), { addSuffix: true }) : 'N/A'}</p>
                        </div>
                    </div>

                    {/* Additional Information */}
                    {(doctor.doctor.qualifications || doctor.doctor.hospitalAffiliations) && (
                        <div className="space-y-3">
                            {doctor.doctor.qualifications && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Qualifications</label>
                                    <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">
                                        {doctor.doctor.qualifications}
                                    </p>
                                </div>
                            )}
                            {doctor.doctor.hospitalAffiliations && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Hospital Affiliations</label>
                                    <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">
                                        {doctor.doctor.hospitalAffiliations}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Verification Action */}
                    {!action && (
                        <div className="flex gap-4 justify-center">
                            <Button
                                onClick={() => handleVerify(true)}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Verify Doctor
                            </Button>
                            <Button
                                onClick={() => handleVerify(false)}
                                variant="destructive"
                            >
                                <UserX className="h-4 w-4 mr-2" />
                                Reject Application
                            </Button>
                        </div>
                    )}

                    {/* Confirmation Step */}
                    {action && (
                        <div className="space-y-4">
                            <Alert className={action === 'verify' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                                <div className="flex items-center gap-2">
                                    {action === 'verify' ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                    <AlertDescription className={action === 'verify' ? 'text-green-800' : 'text-red-800'}>
                                        Are you sure you want to {action === 'verify' ? 'verify' : 'reject'} this doctor&apos;s application?
                                    </AlertDescription>
                                </div>
                            </Alert>

                            <div>
                                <label className="text-sm font-medium">
                                    Notes {action === 'reject' && '(Required for rejection)'}
                                </label>
                                <Textarea
                                    placeholder={action === 'verify'
                                        ? 'Optional notes about the verification...'
                                        : 'Please provide a reason for rejection...'
                                    }
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    )}

                    {verifyDoctor.error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{verifyDoctor.error.message}</AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={verifyDoctor.isPending}>
                        Cancel
                    </Button>
                    {action && (
                        <Button
                            onClick={handleConfirm}
                            disabled={verifyDoctor.isPending || (action === 'reject' && !notes.trim())}
                            className={action === 'verify' ? 'bg-green-600 hover:bg-green-700' : ''}
                            variant={action === 'verify' ? 'default' : 'destructive'}
                        >
                            {verifyDoctor.isPending ? 'Processing...' : `Confirm ${action === 'verify' ? 'Verification' : 'Rejection'}`}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const DoctorVerificationTable: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState<string>('pending');
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorData | null>(null);

    const { data: doctorsData, refetch, isLoading, isFetching } = api.admin.getPendingDoctorVerifications.useQuery({
        status: statusFilter as 'pending' | 'verified' | 'rejected' || undefined,
        limit: 50,
        offset: 0,
    });

    const getStatusColor = (isVerified: boolean | null) => {
        return isVerified
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800';
    };

    const getStatusIcon = (isVerified: boolean | null) => {
        return isVerified ? (
            <CheckCircle className="h-4 w-4" />
        ) : (
            <Clock className="h-4 w-4" />
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Doctor Verification Management
                    {isFetching && !isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    <Button
                        variant={statusFilter === 'pending' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStatusFilter('pending')}
                        disabled={isLoading}
                    >
                        <Clock className="h-4 w-4 mr-2" />
                        Pending ({isLoading ? '...' : doctorsData?.total || 0})
                    </Button>
                    <Button
                        variant={statusFilter === 'verified' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStatusFilter('verified')}
                        disabled={isLoading}
                    >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verified
                    </Button>
                    <Button
                        variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStatusFilter('rejected')}
                        disabled={isLoading}
                    >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejected
                    </Button>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Doctor</TableHead>
                                <TableHead>License</TableHead>
                                <TableHead>Specialization</TableHead>
                                <TableHead>Experience</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Applied</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <DoctorTableSkeleton />
                            ) : doctorsData?.doctors?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <div className="flex flex-col items-center gap-2">
                                            <Stethoscope className="h-8 w-8 text-gray-400" />
                                            <p className="text-gray-500">No doctors found</p>
                                            <p className="text-sm text-gray-400">
                                                {statusFilter === 'pending'
                                                    ? 'No pending doctor verifications at this time.'
                                                    : `No ${statusFilter} doctors found.`
                                                }
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                doctorsData?.doctors?.map((doctorData) => (
                                    <TableRow key={doctorData.doctor.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{doctorData.user?.name || 'Unnamed Doctor'}</div>
                                                <div className="text-sm text-gray-500">{doctorData.user?.email}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-sm">{doctorData.doctor.licenseNumber}</span>
                                        </TableCell>
                                        <TableCell>
                                            {doctorData.doctor.specialization || 'Not specified'}
                                        </TableCell>
                                        <TableCell>
                                            {doctorData.doctor.yearsOfExperience
                                                ? `${doctorData.doctor.yearsOfExperience} years`
                                                : 'Not specified'
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(doctorData.doctor.isVerified)}>
                                                <span className="flex items-center gap-1">
                                                    {getStatusIcon(doctorData.doctor.isVerified)}
                                                    {doctorData.doctor.isVerified ? 'Verified' : 'Pending'}
                                                </span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {doctorData.doctor.createdAt ? formatDistanceToNow(new Date(doctorData.doctor.createdAt), { addSuffix: true }) : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setSelectedDoctor(doctorData)}
                                                disabled={isLoading}
                                            >
                                                <FileText className="h-4 w-4 mr-1" />
                                                Review
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {!isLoading && doctorsData && doctorsData.hasMore && (
                    <div className="flex justify-center mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isFetching}
                        >
                            {isFetching ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                'Load More'
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>

            {/* Verification Modal */}
            <VerificationModal
                doctor={selectedDoctor}
                isOpen={!!selectedDoctor}
                onClose={() => setSelectedDoctor(null)}
                onSuccess={refetch}
            />
        </Card>
    );
};
