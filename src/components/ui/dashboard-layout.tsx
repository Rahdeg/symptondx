'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';

import {
    Menu,
    X,
    Home,
    User,
    Activity,
    Settings,
    Stethoscope,
    Shield,
    Users,
    BarChart3,
    Heart,
    FileText,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AuthButton } from '@/modules/auth/ui/auth-button';
import { NotificationBell } from '@/components/ui/notification-bell';
import { cn } from '@/lib/utils';

type UserRole = 'patient' | 'doctor' | 'admin';

interface NavigationItem {
    label: string;
    href: string;
    icon: React.ReactElement;
    badge?: string;
    isActive?: boolean;
}

interface DashboardLayoutProps {
    children: React.ReactNode;
    title: string;
    description?: string;
}

// Component for dynamic doctor navigation with real data
const DoctorNavigation = () => {
    return [
        {
            label: 'Dashboard',
            href: '/dashboard/doctor',
            icon: <Home className="h-4 w-4" />,
        },
        {
            label: 'Patient Reviews',
            href: '/doctor/reviews',
            icon: <Stethoscope className="h-4 w-4" />,
        },
        {
            label: 'AI Insights',
            href: '/doctor/ai-insights',
            icon: <Image src="/logo1.png" alt="AI" width={16} height={16} className="h-4 w-4" />,
        },
        {
            label: 'Patient Management',
            href: '/doctor/patients',
            icon: <Users className="h-4 w-4" />,
        },
        {
            label: 'Analytics',
            href: '/doctor/analytics',
            icon: <BarChart3 className="h-4 w-4" />,
        },
    ];
};

const getRoleNavigation = (role: UserRole): NavigationItem[] => {
    const commonItems: NavigationItem[] = [
        {
            label: 'Profile',
            href: '/profile',
            icon: <User className="h-4 w-4" />,
        },
        {
            label: 'Settings',
            href: '/settings',
            icon: <Settings className="h-4 w-4" />,
        },
    ];

    const roleSpecificItems: Record<UserRole, NavigationItem[]> = {
        patient: [
            {
                label: 'Dashboard',
                href: '/dashboard/patient',
                icon: <Home className="h-4 w-4" />,
            },
            {
                label: 'Symptom Analysis',
                href: '/diagnosis/new',
                icon: <Image src="/logo1.png" alt="AI" width={16} height={16} className="h-4 w-4" />,
            },
            {
                label: 'My Diagnoses',
                href: '/diagnoses',
                icon: <FileText className="h-4 w-4" />,
            },
            {
                label: 'Health History',
                href: '/health-history',
                icon: <Activity className="h-4 w-4" />,
            },
        ],
        doctor: DoctorNavigation(),
        admin: [
            {
                label: 'Dashboard',
                href: '/dashboard/admin',
                icon: <Home className="h-4 w-4" />,
            },
            {
                label: 'System Monitor',
                href: '/admin/monitor',
                icon: <Activity className="h-4 w-4" />,
            },
            {
                label: 'AI Management',
                href: '/admin/ai-models',
                icon: <Image src="/logo1.png" alt="AI" width={16} height={16} className="h-4 w-4" />,
            },
            {
                label: 'User Management',
                href: '/admin/users',
                icon: <Users className="h-4 w-4" />,
            },
            {
                label: 'System Analytics',
                href: '/admin/analytics',
                icon: <BarChart3 className="h-4 w-4" />,
            },
        ],
    };

    return [...roleSpecificItems[role], ...commonItems];
};

const getRoleDisplayName = (role: UserRole): string => {
    const names: Record<UserRole, string> = {
        patient: 'Patient',
        doctor: 'Healthcare Professional',
        admin: 'Administrator',
    };
    return names[role];
};

const getRoleIcon = (role: UserRole): React.ReactElement => {
    const icons: Record<UserRole, React.ReactElement> = {
        patient: <Heart className="h-4 w-4" />,
        doctor: <Stethoscope className="h-4 w-4" />,
        admin: <Shield className="h-4 w-4" />,
    };
    return icons[role];
};

const getRoleColor = (role: UserRole): string => {
    const colors: Record<UserRole, string> = {
        patient: 'text-blue-600 bg-blue-50',
        doctor: 'text-green-600 bg-green-50',
        admin: 'text-purple-600 bg-purple-50',
    };
    return colors[role];
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    title,
    description,
}) => {
    const { user } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const userRole = user?.publicMetadata?.role as UserRole | undefined;
    const navigationItems = userRole ? getRoleNavigation(userRole) : [];



    const handleNavigation = (href: string) => {
        router.push(href);
        setSidebarOpen(false);
    };

    if (!user || !userRole) {
        return (
            <div className="min-h-screen flex items-center justify-center ">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 backdrop-blur-sm bg-white/20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Fixed Sidebar */}
            <aside className={cn(
                'w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out',
                'fixed inset-y-0 left-0 z-50 lg:translate-x-0',
                sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            )}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center group"
                            title="Go to homepage"
                            aria-label="Go to homepage"
                        >
                            <Image
                                src="/logo.png"
                                alt="SymptomDx Logo"
                                width={120}
                                height={32}
                                className="h-8 w-auto logo-hover"
                            />
                        </button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* User info */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={user.imageUrl} alt={user.fullName || ''} />
                                <AvatarFallback>
                                    {user.fullName?.charAt(0) || user.emailAddresses[0]?.emailAddress.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user.fullName || 'User'}
                                </p>
                                <div className="flex items-center space-x-1">
                                    <Badge
                                        variant="secondary"
                                        className={cn('text-xs', getRoleColor(userRole))}
                                    >
                                        {getRoleIcon(userRole)}
                                        <span className="ml-1">{getRoleDisplayName(userRole)}</span>
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navigationItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Button
                                    key={item.href}
                                    variant={isActive ? 'default' : 'ghost'}
                                    className={cn(
                                        'w-full justify-start h-10 px-3',
                                        isActive && 'bg-primary text-primary-foreground'
                                    )}
                                    onClick={() => handleNavigation(item.href)}
                                >
                                    {item.icon}
                                    <span className="ml-3">{item.label}</span>
                                    {item.badge && (
                                        <Badge
                                            variant="secondary"
                                            className="ml-auto bg-red-100 text-red-800"
                                        >
                                            {item.badge}
                                        </Badge>
                                    )}
                                </Button>
                            );
                        })}
                    </nav>


                </div>
            </aside>

            {/* Fixed Header */}
            <header className="fixed top-0 right-0 left-0 lg:left-64 bg-white shadow-sm border-b border-gray-200 z-40">
                <div className="flex items-center justify-between h-16 px-4 sm:px-6">
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="lg:hidden flex-shrink-0"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{title}</h1>
                            {description && (
                                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block truncate">{description}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                        {/* Notification Bell */}
                        <NotificationBell />

                        {/* Auth Button */}
                        <AuthButton variant="ghost" size="sm" showRoleIndicator={false} />
                    </div>
                </div>
            </header>

            {/* Scrollable Page content */}
            <main className="pt-20 md:pt-24 lg:pl-72 lg:pt-24 min-h-screen p-4 sm:p-6 lg:p-8 xl:p-20 xl:pl-72">
                {children}
            </main>
        </div>
    );
};


