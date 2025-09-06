'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HeaderAuthButton } from '@/modules/auth/ui/auth-button';

const navigationItems = [
    { label: 'Features', href: '/features' },
    { label: 'How it Works', href: '/how-it-works' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
];

const logoConfig = {
    icon: (
        <Image
            src="/logo.png"
            alt="SymptomDx Logo"
            width={120}
            height={32}
            className="h-8 w-auto logo-hover"
        />
    )
};

const scrollToSection = (href: string): void => {
    if (href.startsWith('#')) {
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
};

// Main Header Component
interface HeaderProps {
    className?: string;
    variant?: 'default' | 'transparent' | 'solid';
}

export const Header: React.FC<HeaderProps> = ({
    className = '',
    variant = 'default'
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const handleNavClick = (href: string) => {
        if (href.startsWith('#')) {
            scrollToSection(href);
        } else {
            router.push(href);
        }
        setIsMobileMenuOpen(false);
    };

    // Check if a navigation item is active
    const isActive = (href: string) => {
        if (href === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(href);
    };

    // Get header styles based on variant
    const getHeaderStyles = () => {
        const baseStyles = 'sticky top-0 z-50 w-full border-b transition-all duration-200';

        switch (variant) {
            case 'transparent':
                return `${baseStyles} bg-background/80 backdrop-blur-md border-border/50`;
            case 'solid':
                return `${baseStyles} bg-background border-border`;
            default:
                return `${baseStyles} bg-background/95 backdrop-blur-sm border-border/80`;
        }
    };

    // Render logo
    const renderLogo = () => (
        <button
            onClick={() => router.push('/')}
            className="flex items-center group"
        >
            <motion.div
                whileHover={{ rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                {logoConfig.icon}
            </motion.div>
        </button>
    );

    // Render navigation items
    const renderNavItems = () => (
        <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => {
                const active = isActive(item.href);
                return (
                    <button
                        key={item.href}
                        onClick={() => handleNavClick(item.href)}
                        className={`text-sm font-medium transition-colors duration-200 relative group ${active
                            ? 'text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {item.label}
                        <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-200 ${active ? 'w-full' : 'w-0 group-hover:w-full'
                            }`} />
                    </button>
                );
            })}
        </nav>
    );

    // Render mobile menu
    const renderMobileMenu = () => (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
                opacity: isMobileMenuOpen ? 1 : 0,
                height: isMobileMenuOpen ? 'auto' : 0
            }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-background border-t border-border"
        >
            <div className="px-4 py-6 space-y-4">
                {navigationItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <button
                            key={item.href}
                            onClick={() => handleNavClick(item.href)}
                            className={`block w-full text-left text-base font-medium transition-colors duration-200 py-2 ${active
                                ? 'text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );

    // Render mobile menu toggle
    const renderMobileToggle = () => (
        <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
            {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
            ) : (
                <Menu className="h-5 w-5" />
            )}
        </Button>
    );

    return (
        <header className={`${getHeaderStyles()} ${className}`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    {renderLogo()}

                    {/* Desktop Navigation */}
                    {renderNavItems()}

                    {/* Auth Button - Desktop */}
                    <div className="hidden md:block">
                        <HeaderAuthButton />
                    </div>

                    {/* Mobile Auth Button - positioned before close button */}
                    <div className="flex items-center space-x-2 md:hidden">
                        <HeaderAuthButton />
                        {renderMobileToggle()}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {renderMobileMenu()}
        </header>
    );
};

// Specialized header variants (Polymorphism)
export const TransparentHeader: React.FC<{ className?: string }> = ({ className }) => (
    <Header variant="transparent" className={className} />
);

export const SolidHeader: React.FC<{ className?: string }> = ({ className }) => (
    <Header variant="solid" className={className} />
);
