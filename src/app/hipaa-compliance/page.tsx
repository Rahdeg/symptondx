'use client';

import React from 'react';
import {
    Shield,
    Lock,
    Eye,
    Database,
    UserCheck,
    CheckCircle,
    FileText,
    Calendar,
    Mail,
    Award,
    Users,
    Server,
    Key
} from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const hipaaSafeguards = [
    {
        title: "Administrative Safeguards",
        description: "Policies and procedures to manage the selection, development, implementation, and maintenance of security measures.",
        icon: Users,
        requirements: [
            "Security Officer designation and training",
            "Workforce access management",
            "Information access management",
            "Security awareness and training",
            "Security incident procedures",
            "Contingency plan",
            "Evaluation and assessment"
        ]
    },
    {
        title: "Physical Safeguards",
        description: "Physical measures, policies, and procedures to protect electronic information systems and related buildings.",
        icon: Server,
        requirements: [
            "Facility access controls",
            "Workstation use restrictions",
            "Workstation security measures",
            "Device and media controls",
            "Disposal and reuse procedures"
        ]
    },
    {
        title: "Technical Safeguards",
        description: "Technology and policies to protect electronic health information and control access to it.",
        icon: Lock,
        requirements: [
            "Access control systems",
            "Audit controls and logging",
            "Integrity controls",
            "Person or entity authentication",
            "Transmission security"
        ]
    }
];

const complianceFeatures = [
    {
        title: "End-to-End Encryption",
        description: "All data is encrypted using AES-256 encryption both in transit and at rest.",
        icon: Key,
        details: [
            "AES-256 encryption for data at rest",
            "TLS 1.3 for data in transit",
            "Encrypted database storage",
            "Secure key management"
        ]
    },
    {
        title: "Access Controls",
        description: "Multi-layered access controls ensure only authorized personnel can access health information.",
        icon: UserCheck,
        details: [
            "Role-based access controls",
            "Multi-factor authentication",
            "Principle of least privilege",
            "Regular access reviews"
        ]
    },
    {
        title: "Audit Logging",
        description: "Comprehensive logging of all access and modifications to health information.",
        icon: FileText,
        details: [
            "Complete audit trail",
            "Real-time monitoring",
            "Automated alerts",
            "Regular audit reviews"
        ]
    },
    {
        title: "Data Integrity",
        description: "Measures to ensure health information is not altered or destroyed in an unauthorized manner.",
        icon: Shield,
        details: [
            "Data validation checks",
            "Checksum verification",
            "Backup and recovery procedures",
            "Version control systems"
        ]
    }
];

const userRights = [
    {
        title: "Right to Access",
        description: "You have the right to access your health information and receive copies of your records.",
        icon: Eye
    },
    {
        title: "Right to Amend",
        description: "You can request corrections to your health information if it's inaccurate or incomplete.",
        icon: FileText
    },
    {
        title: "Right to Restrict",
        description: "You can request restrictions on how we use or disclose your health information.",
        icon: Lock
    },
    {
        title: "Right to Accounting",
        description: "You can request a list of disclosures we've made of your health information.",
        icon: Database
    }
];

const breachNotification = [
    {
        timeframe: "Immediate",
        action: "Discovery and Assessment",
        description: "We immediately assess any potential breach and determine if it involves protected health information."
    },
    {
        timeframe: "Within 24 hours",
        action: "Internal Notification",
        description: "Our security team and legal department are notified of any confirmed breach."
    },
    {
        timeframe: "Within 60 days",
        action: "Individual Notification",
        description: "Affected individuals are notified in writing with details about the breach and steps taken."
    },
    {
        timeframe: "Within 60 days",
        action: "HHS Notification",
        description: "We notify the Department of Health and Human Services of any breach affecting 500+ individuals."
    }
];

const certifications = [
    {
        name: "HIPAA Compliance",
        description: "Full compliance with HIPAA Privacy and Security Rules",
        status: "Certified",
        icon: Award
    },
    {
        name: "SOC 2 Type II",
        description: "Security, availability, and confidentiality controls",
        status: "Certified",
        icon: Shield
    },
    {
        name: "ISO 27001",
        description: "Information security management system",
        status: "Certified",
        icon: Lock
    },
    {
        name: "HITRUST CSF",
        description: "Healthcare industry security framework",
        status: "Certified",
        icon: CheckCircle
    }
];

export default function HIPAACompliancePage() {
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
                            HIPAA Compliance
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            We are fully compliant with HIPAA regulations and committed to protecting your health information.
                        </p>
                        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Last updated: December 2024</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Compliance Overview */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <Card className="p-8">
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold">HIPAA Compliance Overview</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    SymptomDx is fully compliant with the Health Insurance Portability and Accountability Act (HIPAA)
                                    Privacy and Security Rules. We understand the critical importance of protecting your health information
                                    and have implemented comprehensive safeguards to ensure the confidentiality, integrity, and availability
                                    of your protected health information (PHI).
                                </p>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="flex items-start space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold text-green-900">Fully Compliant</h3>
                                            <p className="text-sm text-green-800 mt-1">
                                                We maintain full HIPAA compliance through regular audits, staff training, and comprehensive security measures.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* HIPAA Safeguards */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            HIPAA Safeguards
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            We implement all required HIPAA safeguards to protect your health information
                        </p>
                    </div>

                    <div className="space-y-8">
                        {hipaaSafeguards.map((safeguard, index) => (
                            <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                                <div className="flex items-start space-x-4">
                                    <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                                        <safeguard.icon className="h-8 w-8 text-primary" />
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-xl font-semibold">{safeguard.title}</h3>
                                            <p className="text-muted-foreground">{safeguard.description}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium mb-2">Key Requirements:</h4>
                                            <ul className="space-y-1">
                                                {safeguard.requirements.map((requirement, reqIndex) => (
                                                    <li key={reqIndex} className="flex items-start space-x-2">
                                                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                                        <span className="text-sm text-muted-foreground">{requirement}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Compliance Features */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Our Compliance Features
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Advanced security measures that exceed HIPAA requirements
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {complianceFeatures.map((feature, index) => (
                            <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <feature.icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold">{feature.title}</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                                    <ul className="space-y-1">
                                        {feature.details.map((detail, detailIndex) => (
                                            <li key={detailIndex} className="flex items-start space-x-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                                <span className="text-xs text-muted-foreground">{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* User Rights */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Your HIPAA Rights
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Under HIPAA, you have specific rights regarding your health information
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {userRights.map((right, index) => (
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

            {/* Breach Notification */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center space-y-4 mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold">
                                Breach Notification Process
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Our comprehensive breach notification procedures ensure timely and transparent communication
                            </p>
                        </div>

                        <div className="space-y-6">
                            {breachNotification.map((step, index) => (
                                <Card key={index} className="p-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="text-lg font-bold text-primary">{index + 1}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-semibold">{step.action}</h3>
                                                <Badge variant="outline">{step.timeframe}</Badge>
                                            </div>
                                            <p className="text-muted-foreground">{step.description}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Certifications */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Certifications & Audits
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Third-party certifications and regular audits ensure ongoing compliance
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {certifications.map((cert, index) => (
                            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
                                <div className="mx-auto mb-4 p-3 rounded-full bg-green-100 w-fit">
                                    <cert.icon className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{cert.name}</h3>
                                <p className="text-sm text-muted-foreground mb-3">{cert.description}</p>
                                <Badge className="bg-green-600 text-white">{cert.status}</Badge>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Information */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center space-y-6">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Privacy Officer Contact
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            For questions about our HIPAA compliance or to exercise your privacy rights, contact our Privacy Officer.
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
                        <p className="text-sm text-muted-foreground">
                            We respond to all privacy inquiries within 30 days as required by HIPAA.
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
