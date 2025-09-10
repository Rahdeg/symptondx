'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import { AdminAuthModal } from "@/modules/admin/ui/components/admin-auth-modal";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(true);

    useEffect(() => {
        // Check if admin is already authenticated in this session
        const adminAuth = sessionStorage.getItem('admin-authenticated');
        if (adminAuth === 'true') {
            setIsAuthenticated(true);
            setShowAuthModal(false);
        } else {
            // Always require fresh authentication for admin access
            setIsAuthenticated(false);
            setShowAuthModal(true);
        }
    }, []);

    const handleAuthSuccess = () => {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin-authenticated', 'true');
    };

    const handleAuthModalClose = () => {
        if (!isAuthenticated) {
            // Redirect to the user's appropriate dashboard based on their role
            // This will be handled by the middleware
            router.push('/dashboard');
        }
        setShowAuthModal(false);
    };

    if (!isAuthenticated) {
        return (
            <>
                <DashboardLayout
                    title="Admin Dashboard"
                    description="Access restricted - authentication required"
                >
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="text-gray-500 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
                            <p className="text-gray-500">Admin authentication required to access the admin dashboard.</p>
                        </div>
                    </div>
                </DashboardLayout>

                <AdminAuthModal
                    isOpen={showAuthModal}
                    onClose={handleAuthModalClose}
                    onSuccess={handleAuthSuccess}
                />
            </>
        );
    }

    return <>{children}</>;
}
