'use client';

import React from 'react';
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import { UserManagementTable } from "@/modules/admin/ui/components/user-management-table";

export default function AdminUsersPage() {

    return (
        <DashboardLayout
            title="Admin - User Management"
            description="Manage system users, roles, and permissions"
        >
            <div className="space-y-6">
                <UserManagementTable />
            </div>
        </DashboardLayout>
    );
}
