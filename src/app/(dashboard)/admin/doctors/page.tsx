'use client';

import React from 'react';
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import { DoctorVerificationTable } from "@/modules/admin/ui/components/doctor-verification-table";

export default function AdminDoctorsPage() {

    return (
        <DashboardLayout
            title="Admin - Doctor Verification"
            description="Review and verify doctor applications"
        >
            <div className="space-y-6">
                <DoctorVerificationTable />
            </div>
        </DashboardLayout>
    );
}
