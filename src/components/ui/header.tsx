'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Brain, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HeaderAuthButton } from '@/modules/auth/ui/auth-button';

const navigationItems = [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
];

const logoConfig = {
    text: 'SymptomDx',
    icon: <Brain className="h-8 w-8 text-primary" />
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

    const handleNavClick = (href: string) => {
        scrollToSection(href);
        setIsMobileMenuOpen(false);
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
        <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
                whileHover={{ rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                {logoConfig.icon}
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {logoConfig.text}
            </span>
        </Link>
    );

    // Render navigation items
    const renderNavItems = () => (
        <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
                <button
                    key={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative group"
                >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full" />
                </button>
            ))}
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
                {navigationItems.map((item) => (
                    <button
                        key={item.href}
                        onClick={() => handleNavClick(item.href)}
                        className="block w-full text-left text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 py-2"
                    >
                        {item.label}
                    </button>
                ))}
                <div className="pt-4 border-t border-border">
                    <HeaderAuthButton className="w-full justify-center" />
                </div>
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

                    {/* Desktop Auth Button */}
                    <div className="hidden md:block">
                        <HeaderAuthButton />
                    </div>

                    {/* Mobile Menu Toggle */}
                    {renderMobileToggle()}
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
