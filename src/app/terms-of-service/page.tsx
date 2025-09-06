'use client';

import React from 'react';
import {
    FileText,
    AlertTriangle,
    Shield,
    User,
    Scale,
    Calendar,
    Mail,
    CheckCircle,
    XCircle,
    Info
} from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { Card } from '@/components/ui/card';

const serviceTerms = [
    {
        title: "Service Description",
        description: "SymptomDx provides AI-powered medical diagnosis assistance and is not a replacement for professional medical care.",
        icon: FileText,
        details: [
            "AI-generated diagnostic suggestions for informational purposes only",
            "Not intended for emergency medical situations",
            "Should not replace consultation with healthcare professionals",
            "Results are not guaranteed to be accurate or complete"
        ]
    },
    {
        title: "User Responsibilities",
        description: "Users must provide accurate information and use the service responsibly.",
        icon: User,
        details: [
            "Provide accurate and complete symptom information",
            "Use the service for personal health information only",
            "Not share account credentials with others",
            "Comply with all applicable laws and regulations"
        ]
    },
    {
        title: "Medical Disclaimer",
        description: "Important limitations and disclaimers regarding medical advice.",
        icon: AlertTriangle,
        details: [
            "Not a substitute for professional medical advice",
            "Emergency situations require immediate medical attention",
            "Always consult healthcare professionals for medical decisions",
            "We are not liable for medical decisions based on our suggestions"
        ]
    },
    {
        title: "Privacy & Security",
        description: "How we protect your information and your privacy rights.",
        icon: Shield,
        details: [
            "HIPAA-compliant data protection",
            "End-to-end encryption for all data",
            "No sharing of personal health information",
            "Right to access, modify, or delete your data"
        ]
    }
];

const prohibitedUses = [
    "Using the service for emergency medical situations",
    "Providing false or misleading health information",
    "Attempting to reverse engineer our AI models",
    "Using the service for commercial purposes without permission",
    "Violating any applicable laws or regulations",
    "Interfering with the service's operation or security"
];

const limitations = [
    {
        title: "Service Availability",
        description: "We strive for 99.9% uptime but cannot guarantee uninterrupted service.",
        icon: Calendar
    },
    {
        title: "Accuracy Limitations",
        description: "AI suggestions are based on available data and may not be 100% accurate.",
        icon: Info
    },
    {
        title: "Medical Liability",
        description: "We are not liable for medical decisions or outcomes based on our suggestions.",
        icon: AlertTriangle
    },
    {
        title: "Data Loss",
        description: "While we implement backups, we cannot guarantee against data loss.",
        icon: Shield
    }
];

const userRights = [
    {
        title: "Access Your Data",
        description: "You can request a copy of all your personal data at any time.",
        icon: CheckCircle
    },
    {
        title: "Modify Information",
        description: "You can update or correct your account information and health data.",
        icon: User
    },
    {
        title: "Delete Account",
        description: "You can request complete deletion of your account and data.",
        icon: XCircle
    },
    {
        title: "Data Portability",
        description: "You can export your data in a structured format.",
        icon: FileText
    }
];

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen">
            <Header variant="default" />

            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <div className="mx-auto mb-6 p-4 rounded-full bg-primary/10 w-fit">
                            <Scale className="h-12 w-12 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold gradient-primary-text">
                            Terms of Service
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Please read these terms carefully before using our AI-powered medical diagnosis platform.
                        </p>
                        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Last updated: December 2024</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Important Notice */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <Card className="p-8 border-red-200 bg-red-50">
                            <div className="flex items-start space-x-4">
                                <AlertTriangle className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold text-red-900">Important Medical Disclaimer</h2>
                                    <div className="space-y-3 text-red-800">
                                        <p className="font-semibold">
                                            SymptomDx is NOT a replacement for professional medical care and should NOT be used for emergency medical situations.
                                        </p>
                                        <ul className="space-y-2">
                                            <li className="flex items-start space-x-2">
                                                <div className="w-2 h-2 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                                                <span>If you are experiencing a medical emergency, call 911 or go to your nearest emergency room immediately.</span>
                                            </li>
                                            <li className="flex items-start space-x-2">
                                                <div className="w-2 h-2 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                                                <span>Our AI suggestions are for informational purposes only and should not be the sole basis for medical decisions.</span>
                                            </li>
                                            <li className="flex items-start space-x-2">
                                                <div className="w-2 h-2 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                                                <span>Always consult with qualified healthcare professionals for medical advice, diagnosis, or treatment.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Service Terms */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Service Terms
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Understanding our service and your responsibilities
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {serviceTerms.map((term, index) => (
                            <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                                <div className="flex items-start space-x-4">
                                    <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                                        <term.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-semibold">{term.title}</h3>
                                        <p className="text-sm text-muted-foreground">{term.description}</p>
                                        <ul className="space-y-1">
                                            {term.details.map((detail, detailIndex) => (
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

            {/* Prohibited Uses */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <Card className="p-8">
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold">Prohibited Uses</h2>
                                <p className="text-muted-foreground">
                                    You agree not to use our service for any of the following purposes:
                                </p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {prohibitedUses.map((use, index) => (
                                        <div key={index} className="flex items-start space-x-3">
                                            <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-muted-foreground">{use}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <div className="flex items-start space-x-3">
                                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold text-yellow-900">Consequences</h3>
                                            <p className="text-sm text-yellow-800 mt-1">
                                                Violation of these terms may result in immediate termination of your account and legal action.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Limitations */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Service Limitations
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Important limitations and disclaimers
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {limitations.map((limitation, index) => (
                            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
                                <div className="mx-auto mb-4 p-3 rounded-full bg-orange-100 w-fit">
                                    <limitation.icon className="h-8 w-8 text-orange-600" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{limitation.title}</h3>
                                <p className="text-sm text-muted-foreground">{limitation.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* User Rights */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Your Rights
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            What you can expect from our service
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {userRights.map((right, index) => (
                            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
                                <div className="mx-auto mb-4 p-3 rounded-full bg-green-100 w-fit">
                                    <right.icon className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{right.title}</h3>
                                <p className="text-sm text-muted-foreground">{right.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Liability and Indemnification */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <Card className="p-8">
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold">Liability and Indemnification</h2>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Limitation of Liability</h3>
                                        <p className="text-muted-foreground text-sm">
                                            To the maximum extent permitted by law, SymptomDx shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising out of or relating to your use of our service.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Medical Disclaimer</h3>
                                        <p className="text-muted-foreground text-sm">
                                            Our service provides AI-generated suggestions for informational purposes only. We are not responsible for any medical decisions, treatments, or outcomes based on our suggestions. Users assume full responsibility for their health decisions.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Indemnification</h3>
                                        <p className="text-muted-foreground text-sm">
                                            You agree to indemnify and hold harmless SymptomDx from any claims, damages, or expenses arising from your use of our service or violation of these terms.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Changes to Terms */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <Card className="p-8">
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold">Changes to Terms</h2>
                                <p className="text-muted-foreground">
                                    We may update these Terms of Service from time to time. We will notify you of any material changes by:
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-start space-x-2">
                                        <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                        <span className="text-sm text-muted-foreground">Posting the updated terms on our website</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                        <span className="text-sm text-muted-foreground">Sending email notifications to registered users</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                        <span className="text-sm text-muted-foreground">Displaying prominent notices on our platform</span>
                                    </li>
                                </ul>
                                <p className="text-muted-foreground text-sm">
                                    Your continued use of our service after any changes constitutes acceptance of the new terms.
                                </p>
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
                            Questions About These Terms?
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            If you have any questions about these Terms of Service, please contact us.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="mailto:legal@symptomdx.com"
                                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                <Mail className="h-5 w-5" />
                                <span>legal@symptomdx.com</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
