'use client';

import React from 'react';
import Link from 'next/link';
import { Github, Twitter, Mail, Heart } from 'lucide-react';
import Image from 'next/image';

const currentYear = new Date().getFullYear();

const companyInfo = {
    description: 'AI-powered medical diagnosis platform helping people get accurate symptom analysis and healthcare guidance.',
    icon: <Image src="/logo.png" alt="SymptomDx Logo" width={120} height={32} className="h-8 w-auto logo-hover" />
};

const footerLinks = {
    product: [
        { label: 'Features', href: '#features' },
        { label: 'How it Works', href: '#how-it-works' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'API', href: '/api' }
    ],
    company: [
        { label: 'About', href: '#about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '#contact' }
    ],
    legal: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
        { label: 'HIPAA Compliance', href: '/hipaa' }
    ],
    support: [
        { label: 'Help Center', href: '/help' },
        { label: 'Documentation', href: '/docs' },
        { label: 'Community', href: '/community' },
        { label: 'Status', href: '/status' }
    ]
};

const socialLinks = [
    {
        label: 'GitHub',
        href: 'https://github.com/symptomdx',
        icon: <Github className="h-5 w-5" />
    },
    {
        label: 'Twitter',
        href: 'https://twitter.com/symptomdx',
        icon: <Twitter className="h-5 w-5" />
    },
    {
        label: 'Email',
        href: 'mailto:contact@symptomdx.com',
        icon: <Mail className="h-5 w-5" />
    }
];

const handleLinkClick = (href: string): void => {
    if (href.startsWith('#')) {
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
};

// Main Footer Component
interface FooterProps {
    className?: string;
    variant?: 'default' | 'minimal';
}

export const Footer: React.FC<FooterProps> = ({
    className = '',
    variant = 'default'
}) => {

    // Render company section
    const renderCompanySection = () => (
        <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center mb-4">
                {companyInfo.icon}
            </div>
            <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
                {companyInfo.description}
            </p>
            <div className="flex space-x-4">
                {socialLinks.map((social) => (
                    <Link
                        key={social.label}
                        href={social.href}
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                        aria-label={social.label}
                    >
                        {social.icon}
                    </Link>
                ))}
            </div>
        </div>
    );

    // Render link section
    const renderLinkSection = (title: string, links: Array<{ label: string; href: string }>) => (
        <div>
            <h3 className="font-semibold mb-4">{title}</h3>
            <ul className="space-y-2">
                {links.map((link) => (
                    <li key={link.href}>
                        {link.href.startsWith('#') ? (
                            <button
                                onClick={() => handleLinkClick(link.href)}
                                className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-left"
                            >
                                {link.label}
                            </button>
                        ) : (
                            <Link
                                href={link.href}
                                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                            >
                                {link.label}
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );

    // Render bottom section
    const renderBottomSection = () => (
        <div className="pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <p className="text-sm text-muted-foreground">
                    © {currentYear} SymptomDx. All rights reserved.
                </p>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <span>Made with</span>
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                    <span>for better healthcare</span>
                </div>
            </div>
        </div>
    );

    // Minimal footer variant
    if (variant === 'minimal') {
        return (
            <footer className={`bg-background border-t border-border ${className}`}>
                <div className="container mx-auto px-4 py-8">
                    {renderBottomSection()}
                </div>
            </footer>
        );
    }

    // Default footer variant
    return (
        <footer className={`bg-muted/30 border-t border-border ${className}`}>
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
                    {/* Company Info */}
                    {renderCompanySection()}

                    {/* Footer Links */}
                    {renderLinkSection('Product', footerLinks.product)}
                    {renderLinkSection('Company', footerLinks.company)}
                    {renderLinkSection('Legal', footerLinks.legal)}
                    {renderLinkSection('Support', footerLinks.support)}
                </div>

                {/* Bottom Section */}
                {renderBottomSection()}
            </div>
        </footer>
    );
};

// Specialized footer variants (Polymorphism)
export const MinimalFooter: React.FC<{ className?: string }> = ({ className }) => (
    <Footer variant="minimal" className={className} />
);
