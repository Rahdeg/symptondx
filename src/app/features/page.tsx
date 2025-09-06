'use client';

import React from 'react';
import {
    Shield,
    Stethoscope,
    Clock,
    Brain,
    FileText,
    BarChart3,
    Smartphone,
    Globe,
    Lock,
    CheckCircle
} from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const mainFeatures = [
    {
        title: "AI-Powered Analysis",
        description: "Advanced machine learning algorithms analyze your symptoms and provide accurate diagnostic suggestions with confidence scores.",
        icon: Brain,
        badge: "AI",
        details: [
            "Deep learning neural networks trained on millions of medical cases",
            "Real-time symptom analysis and pattern recognition",
            "Confidence scoring for each diagnostic suggestion",
            "Continuous learning and model improvement"
        ]
    },
    {
        title: "Medical Professional Review",
        description: "Licensed doctors review AI analyses to ensure accuracy and provide additional medical insights when needed.",
        icon: Stethoscope,
        badge: "Verified",
        details: [
            "Board-certified physicians review all AI diagnoses",
            "Human oversight for complex medical cases",
            "Expert medical opinions and recommendations",
            "Quality assurance and accuracy validation"
        ]
    },
    {
        title: "Secure & Private",
        description: "Your health data is encrypted and protected with enterprise-grade security. We never share your information.",
        icon: Shield,
        badge: "HIPAA",
        details: [
            "End-to-end encryption for all data transmission",
            "HIPAA-compliant data storage and processing",
            "Zero-knowledge architecture for maximum privacy",
            "Regular security audits and compliance monitoring"
        ]
    },
    {
        title: "Instant Results",
        description: "Get diagnostic results in under 30 seconds. Our optimized AI models provide fast and reliable analysis.",
        icon: Clock,
        badge: "Fast",
        details: [
            "Sub-30 second analysis time",
            "Real-time processing and instant feedback",
            "Optimized algorithms for speed and accuracy",
            "24/7 availability for immediate assistance"
        ]
    }
];

const additionalFeatures = [
    {
        title: "Comprehensive Symptom Analysis",
        description: "Detailed analysis of multiple symptoms with consideration of medical history and risk factors.",
        icon: FileText,
        features: [
            "Multi-symptom correlation analysis",
            "Medical history integration",
            "Risk factor assessment",
            "Symptom severity evaluation"
        ]
    },
    {
        title: "User-Friendly Interface",
        description: "Intuitive design that makes medical diagnosis accessible to everyone, regardless of technical expertise.",
        icon: Smartphone,
        features: [
            "Mobile-responsive design",
            "Accessible interface for all users",
            "Step-by-step guidance",
            "Clear, jargon-free explanations"
        ]
    },
    {
        title: "Global Accessibility",
        description: "Available worldwide with support for multiple languages and healthcare systems.",
        icon: Globe,
        features: [
            "Multi-language support",
            "Global healthcare system compatibility",
            "Cultural sensitivity in recommendations",
            "Worldwide availability"
        ]
    },
    {
        title: "Data Analytics",
        description: "Comprehensive analytics and reporting for healthcare providers and researchers.",
        icon: BarChart3,
        features: [
            "Population health insights",
            "Disease trend analysis",
            "Research data contribution",
            "Healthcare outcome tracking"
        ]
    }
];

const securityFeatures = [
    {
        title: "End-to-End Encryption",
        description: "All data is encrypted using industry-standard AES-256 encryption.",
        icon: Lock
    },
    {
        title: "HIPAA Compliance",
        description: "Full compliance with HIPAA regulations for healthcare data protection.",
        icon: Shield
    },
    {
        title: "Regular Audits",
        description: "Third-party security audits ensure ongoing protection of your data.",
        icon: CheckCircle
    }
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen">
            <Header variant="default" />

            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <h1 className="text-4xl md:text-6xl font-bold gradient-primary-text">
                            Powerful Features for Better Healthcare
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Discover how our AI-powered platform revolutionizes medical diagnosis with cutting-edge technology and expert medical oversight.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Features Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Core Features
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            The essential features that make our platform the most advanced medical diagnosis tool available
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {mainFeatures.map((feature, index) => (
                            <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <feature.icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">{feature.title}</CardTitle>
                                            <Badge variant="secondary" className="mt-1">
                                                {feature.badge}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardDescription className="text-base">
                                        {feature.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {feature.details.map((detail, detailIndex) => (
                                            <li key={detailIndex} className="flex items-start space-x-2">
                                                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Additional Features Section */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Additional Capabilities
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Advanced features that enhance the diagnostic experience and provide comprehensive healthcare support
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {additionalFeatures.map((feature, index) => (
                            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
                                <CardHeader className="pb-4">
                                    <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                                        <feature.icon className="h-8 w-8 text-primary" />
                                    </div>
                                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                                    <CardDescription className="text-sm">
                                        {feature.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-left">
                                        {feature.features.map((item, itemIndex) => (
                                            <li key={itemIndex} className="flex items-start space-x-2">
                                                <CheckCircle className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                                                <span className="text-xs text-muted-foreground">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Security Features Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Security & Privacy
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Your health data is protected with enterprise-grade security measures
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {securityFeatures.map((feature, index) => (
                            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
                                <div className="mx-auto mb-4 p-3 rounded-full bg-green-100 w-fit">
                                    <feature.icon className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Ready to Experience the Future of Healthcare?
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Join thousands of users who trust our platform for accurate, fast, and secure medical diagnosis.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="px-8 py-6 text-lg">
                                Start Free Analysis
                            </Button>
                            <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                                Learn More
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
