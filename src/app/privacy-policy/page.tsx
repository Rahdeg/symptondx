'use client';

import React from 'react';
import {
    Shield,
    Lock,
    Eye,
    Database,
    UserCheck,
    AlertTriangle,
    Mail,
    Calendar,
    FileText
} from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const privacyPrinciples = [
    {
        title: "Data Minimization",
        description: "We only collect the minimum amount of data necessary to provide our services.",
        icon: Database,
        details: [
            "Collect only essential health information",
            "No unnecessary data collection",
            "Regular data audits and cleanup",
            "Purpose limitation principles"
        ]
    },
    {
        title: "Transparency",
        description: "We are transparent about how we collect, use, and protect your data.",
        icon: Eye,
        details: [
            "Clear privacy notices",
            "Regular policy updates",
            "Easy-to-understand language",
            "Open communication about changes"
        ]
    },
    {
        title: "Security",
        description: "Your data is protected with enterprise-grade security measures.",
        icon: Lock,
        details: [
            "End-to-end encryption",
            "Regular security audits",
            "Access controls and monitoring",
            "Incident response procedures"
        ]
    },
    {
        title: "User Control",
        description: "You have full control over your personal data and privacy settings.",
        icon: UserCheck,
        details: [
            "Data access and portability",
            "Right to deletion",
            "Privacy settings control",
            "Consent management"
        ]
    }
];

const dataTypes = [
    {
        category: "Health Information",
        description: "Medical data collected for diagnosis purposes",
        examples: ["Symptoms", "Medical history", "Diagnosis results", "Treatment recommendations"],
        retention: "7 years or as required by law"
    },
    {
        category: "Account Information",
        description: "Basic account and profile data",
        examples: ["Name", "Email address", "Account preferences", "Login credentials"],
        retention: "Until account deletion"
    },
    {
        category: "Usage Data",
        description: "Information about how you use our platform",
        examples: ["Feature usage", "Diagnosis frequency", "Platform interactions", "Performance data"],
        retention: "2 years"
    },
    {
        category: "Technical Data",
        description: "Technical information for platform operation",
        examples: ["IP address", "Device information", "Browser type", "Log files"],
        retention: "1 year"
    }
];

const rights = [
    {
        title: "Right to Access",
        description: "You can request a copy of all personal data we have about you.",
        icon: FileText
    },
    {
        title: "Right to Rectification",
        description: "You can request correction of inaccurate or incomplete data.",
        icon: UserCheck
    },
    {
        title: "Right to Erasure",
        description: "You can request deletion of your personal data in certain circumstances.",
        icon: Database
    },
    {
        title: "Right to Portability",
        description: "You can request your data in a structured, machine-readable format.",
        icon: FileText
    },
    {
        title: "Right to Restrict Processing",
        description: "You can request limitation of how we process your data.",
        icon: Lock
    },
    {
        title: "Right to Object",
        description: "You can object to certain types of data processing.",
        icon: AlertTriangle
    }
];

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen">
            <Header variant="default" />

            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <div className="mx-auto mb-6 p-4 rounded-full bg-primary/10 w-fit">
                            <Shield className="h-12 w-12 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold gradient-primary-text">
                            Privacy Policy
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Your privacy is our priority. Learn how we collect, use, and protect your personal information.
                        </p>
                        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Last updated: December 2024</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Introduction */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <Card className="p-8">
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold">Introduction</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    At SymptomDx, we are committed to protecting your privacy and ensuring the security of your personal health information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered medical diagnosis platform.
                                </p>
                                <p className="text-muted-foreground leading-relaxed">
                                    We understand that health information is particularly sensitive, and we have implemented comprehensive security measures and privacy controls to protect your data. This policy complies with applicable privacy laws, including HIPAA, GDPR, and other relevant regulations.
                                </p>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="flex items-start space-x-3">
                                        <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold text-blue-900">Important Notice</h3>
                                            <p className="text-sm text-blue-800 mt-1">
                                                This platform is not intended for emergency medical situations. If you are experiencing a medical emergency, please call 911 or go to your nearest emergency room immediately.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Privacy Principles */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Our Privacy Principles
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            These principles guide how we handle your personal information
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {privacyPrinciples.map((principle, index) => (
                            <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                                <div className="flex items-start space-x-4">
                                    <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                                        <principle.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-semibold">{principle.title}</h3>
                                        <p className="text-sm text-muted-foreground">{principle.description}</p>
                                        <ul className="space-y-1">
                                            {principle.details.map((detail, detailIndex) => (
                                                <li key={detailIndex} className="flex items-start space-x-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                                    <span className="text-xs text-muted-foreground">{detail}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Data Collection */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center space-y-4 mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold">
                                Information We Collect
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                We collect only the information necessary to provide our services
                            </p>
                        </div>

                        <div className="space-y-6">
                            {dataTypes.map((dataType, index) => (
                                <Card key={index} className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-semibold">{dataType.category}</h3>
                                            <Badge variant="outline">{dataType.retention}</Badge>
                                        </div>
                                        <p className="text-muted-foreground">{dataType.description}</p>
                                        <div>
                                            <h4 className="font-medium mb-2">Examples include:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {dataType.examples.map((example, exampleIndex) => (
                                                    <Badge key={exampleIndex} variant="secondary" className="text-xs">
                                                        {example}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Your Rights */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Your Privacy Rights
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            You have control over your personal information
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rights.map((right, index) => (
                            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
                                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                                    <right.icon className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{right.title}</h3>
                                <p className="text-sm text-muted-foreground">{right.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Data Security */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <Card className="p-8">
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold">Data Security</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    We implement comprehensive security measures to protect your personal information:
                                </p>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Technical Safeguards</h3>
                                        <ul className="space-y-2">
                                            <li className="flex items-start space-x-2">
                                                <Lock className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">End-to-end encryption for all data transmission</span>
                                            </li>
                                            <li className="flex items-start space-x-2">
                                                <Shield className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">AES-256 encryption for data at rest</span>
                                            </li>
                                            <li className="flex items-start space-x-2">
                                                <Database className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">Secure cloud infrastructure with regular backups</span>
                                            </li>
                                            <li className="flex items-start space-x-2">
                                                <UserCheck className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">Multi-factor authentication for all accounts</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Administrative Safeguards</h3>
                                        <ul className="space-y-2">
                                            <li className="flex items-start space-x-2">
                                                <FileText className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">Regular privacy and security training for all staff</span>
                                            </li>
                                            <li className="flex items-start space-x-2">
                                                <Eye className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">Access controls and audit logging</span>
                                            </li>
                                            <li className="flex items-start space-x-2">
                                                <AlertTriangle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">Incident response and breach notification procedures</span>
                                            </li>
                                            <li className="flex items-start space-x-2">
                                                <Calendar className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">Regular security assessments and penetration testing</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Contact Information */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center space-y-6">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Questions About Privacy?
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            If you have any questions about this Privacy Policy or our data practices, please contact us.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="mailto:privacy@symptomdx.com"
                                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                <Mail className="h-5 w-5" />
                                <span>privacy@symptomdx.com</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
