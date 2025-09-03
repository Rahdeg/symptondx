"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboardIcon,
    UserCircleIcon,
    ActivityIcon,
    SettingsIcon,
    BrainIcon
} from 'lucide-react';
import { UserButton, SignInButton, SignedIn, SignedOut, useUser } from '@clerk/nextjs';

type UserRole = "patient" | "doctor" | "admin";

interface NavigationItem {
    label: string;
    href: string;
    icon: React.ReactElement;
}

const getRoleNavigation = (role: UserRole): NavigationItem[] => {
    const commonItems: NavigationItem[] = [
        {
            label: 'Profile',
            href: '/profile',
            icon: <UserCircleIcon className="size-4" />
        },
        {
            label: 'Settings',
            href: '/settings',
            icon: <SettingsIcon className="size-4" />
        }
    ];

    const roleSpecificItems: Record<UserRole, NavigationItem[]> = {
        patient: [
            {
                label: 'Symptom Analysis',
                href: '/diagnosis/new',
                icon: <BrainIcon className="size-4" />
            },
            {
                label: 'My Diagnoses',
                href: '/diagnoses',
                icon: <ActivityIcon className="size-4" />
            }
        ],
        doctor: [
            {
                label: 'Patient Reviews',
                href: '/doctor/reviews',
                icon: <ActivityIcon className="size-4" />
            },
            {
                label: 'AI Insights',
                href: '/doctor/ai-insights',
                icon: <BrainIcon className="size-4" />
            }
        ],
        admin: [
            {
                label: 'System Monitor',
                href: '/admin/monitor',
                icon: <ActivityIcon className="size-4" />
            },
            {
                label: 'AI Management',
                href: '/admin/ai-models',
                icon: <BrainIcon className="size-4" />
            }
        ]
    };

    const dashboardHrefs: Record<UserRole, string> = {
        patient: '/dashboard/patient',
        doctor: '/dashboard/doctor',
        admin: '/dashboard/admin'
    };

    return [
        {
            label: 'Dashboard',
            href: dashboardHrefs[role],
            icon: <LayoutDashboardIcon className="size-4" />
        },
        ...roleSpecificItems[role],
        ...commonItems
    ];
};

const getRoleDisplayName = (role: UserRole): string => {
    const names: Record<UserRole, string> = {
        patient: 'Patient',
        doctor: 'Healthcare Professional',
        admin: 'Administrator'
    };
    return names[role];
};

const getRoleIcon = (role: UserRole): React.ReactElement => {
    const icons: Record<UserRole, React.ReactElement> = {
        patient: <UserCircleIcon className="size-4" />,
        doctor: <ActivityIcon className="size-4" />,
        admin: <SettingsIcon className="size-4" />
    };
    return icons[role];
};

// Main AuthButton component
interface AuthButtonProps {
    variant?: "default" | "outline" | "ghost";
    size?: "sm" | "default" | "lg";
    showRoleIndicator?: boolean;
    className?: string;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
    variant = "outline",
    size = "default",
    showRoleIndicator = true,
    className = ""
}) => {
    const { user } = useUser();
    const userRole = user?.publicMetadata?.role as UserRole | undefined;

    const getSignInButtonClasses = (): string => {
        const baseClasses = 'font-medium transition-all duration-200 hover:scale-105';
        const variantClasses = {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90',
            outline: 'border-primary/50 text-primary hover:bg-primary/10 hover:border-primary',
            ghost: 'text-primary hover:bg-primary/10'
        };
        return `${baseClasses} ${variantClasses[variant]}`;
    };

    return (
        <>
            <SignedIn>
                {userRole && (
                    <div className={`flex items-center space-x-2 ${className}`}>
                        {showRoleIndicator && (
                            <div className="hidden sm:flex items-center space-x-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                {getRoleIcon(userRole)}
                                <span>{getRoleDisplayName(userRole)}</span>
                            </div>
                        )}

                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "w-8 h-8 ring-2 ring-primary/20 hover:ring-primary/40 transition-all",
                                    userButtonPopoverCard: "shadow-lg border-border",
                                    userButtonPopoverActionButton: "hover:bg-muted transition-colors"
                                }
                            }}
                        >
                            <UserButton.MenuItems>
                                {getRoleNavigation(userRole).map((item) => (
                                    <UserButton.Link
                                        key={item.href}
                                        label={item.label}
                                        href={item.href}
                                        labelIcon={item.icon}
                                    />
                                ))}
                                <UserButton.Action label="manageAccount" />
                            </UserButton.MenuItems>
                        </UserButton>
                    </div>
                )}
            </SignedIn>
            <SignedOut>
                <div className={className}>
                    <SignInButton mode="modal">
                        <Button
                            variant={variant}
                            size={size}
                            className={getSignInButtonClasses()}
                        >
                            <UserCircleIcon className="size-4 mr-2" />
                            Sign In
                        </Button>
                    </SignInButton>
                </div>
            </SignedOut>
        </>
    );
};

// Convenience components for different use cases (Polymorphism)
export const HeaderAuthButton: React.FC<{ className?: string }> = ({ className }) => (
    <AuthButton
        variant="ghost"
        size="sm"
        showRoleIndicator={false}
        className={className}
    />
);

export const PrimaryAuthButton: React.FC<{ className?: string }> = ({ className }) => (
    <AuthButton
        variant="default"
        size="lg"
        showRoleIndicator={true}
        className={className}
    />
);

export const OutlineAuthButton: React.FC<{ className?: string }> = ({ className }) => (
    <AuthButton
        variant="outline"
        size="default"
        showRoleIndicator={true}
        className={className}
    />
);
