'use client';

import React from 'react';
import {
    Heart,
    Users,
    Target,
    Award,
    Globe,
    Shield,
    Brain,
    Stethoscope,
    CheckCircle,
    ArrowRight
} from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const missionValues = [
    {
        title: "Accessibility",
        description: "Making quality healthcare accessible to everyone, regardless of location or economic status.",
        icon: Globe,
        details: [
            "Available 24/7 worldwide",
            "No geographical barriers",
            "Affordable healthcare solutions",
            "Multi-language support"
        ]
    },
    {
        title: "Accuracy",
        description: "Delivering the most accurate diagnostic results through advanced AI and medical expertise.",
        icon: Target,
        details: [
            "94% diagnostic accuracy rate",
            "Continuous model improvement",
            "Medical professional oversight",
            "Evidence-based recommendations"
        ]
    },
    {
        title: "Privacy",
        description: "Protecting your health data with enterprise-grade security and HIPAA compliance.",
        icon: Shield,
        details: [
            "End-to-end encryption",
            "HIPAA compliant storage",
            "Zero-knowledge architecture",
            "Regular security audits"
        ]
    },
    {
        title: "Innovation",
        description: "Pioneering the future of healthcare with cutting-edge AI technology and research.",
        icon: Brain,
        details: [
            "Advanced machine learning",
            "Continuous research and development",
            "Partnership with medical institutions",
            "Open-source contributions"
        ]
    }
];

const teamMembers = [
    {
        name: "Dr. Sarah Chen",
        role: "Chief Medical Officer",
        expertise: "Emergency Medicine",
        experience: "15+ years",
        description: "Board-certified emergency physician with extensive experience in AI-assisted diagnosis."
    },
    {
        name: "Dr. Michael Rodriguez",
        role: "Head of AI Research",
        expertise: "Machine Learning",
        experience: "12+ years",
        description: "Leading AI researcher specializing in medical applications and neural networks."
    },
    {
        name: "Dr. Emily Watson",
        role: "Clinical Director",
        expertise: "Internal Medicine",
        experience: "18+ years",
        description: "Internal medicine specialist focused on preventive care and chronic disease management."
    },
    {
        name: "Dr. James Wilson",
        role: "Chief Technology Officer",
        expertise: "Health Informatics",
        experience: "10+ years",
        description: "Health informatics expert with deep knowledge of healthcare data systems."
    }
];

const milestones = [
    {
        year: "2020",
        title: "Company Founded",
        description: "Started with a vision to democratize healthcare through AI technology."
    },
    {
        year: "2021",
        title: "First AI Model",
        description: "Developed our first diagnostic AI model with 85% accuracy."
    },
    {
        year: "2022",
        title: "HIPAA Compliance",
        description: "Achieved full HIPAA compliance and enterprise security certification."
    },
    {
        year: "2023",
        title: "Medical Partnership",
        description: "Partnered with leading medical institutions for validation studies."
    },
    {
        year: "2024",
        title: "Global Launch",
        description: "Launched globally with 94% accuracy and 10,000+ successful diagnoses."
    }
];

const stats = [
    { label: "Diagnoses Completed", value: "10,000+", icon: Stethoscope },
    { label: "Active Users", value: "2,500+", icon: Users },
    { label: "Accuracy Rate", value: "94%", icon: Target },
    { label: "Countries Served", value: "50+", icon: Globe }
];

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            <Header variant="default" />

            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <h1 className="text-4xl md:text-6xl font-bold gradient-primary-text">
                            About SymptomDx
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            We&apos;re revolutionizing healthcare by making accurate medical diagnosis accessible to everyone through the power of artificial intelligence and medical expertise.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Our Mission
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            To democratize healthcare by providing accurate, accessible, and affordable medical diagnosis to people worldwide.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {missionValues.map((value, index) => (
                            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
                                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                                    <value.icon className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{value.description}</p>
                                <ul className="space-y-1 text-left">
                                    {value.details.map((detail, detailIndex) => (
                                        <li key={detailIndex} className="flex items-start space-x-2">
                                            <CheckCircle className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                                            <span className="text-xs text-muted-foreground">{detail}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Our Impact
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Numbers that reflect our commitment to improving healthcare worldwide
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <Card key={index} className="p-6 text-center">
                                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                                    <stat.icon className="h-8 w-8 text-primary" />
                                </div>
                                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Our Team
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            World-class medical professionals and AI researchers working together to improve healthcare
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {teamMembers.map((member, index) => (
                            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
                                <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Stethoscope className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                                <p className="text-sm text-primary font-medium mb-2">{member.role}</p>
                                <div className="space-y-1 mb-4">
                                    <Badge variant="outline" className="text-xs">{member.expertise}</Badge>
                                    <Badge variant="outline" className="text-xs">{member.experience}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{member.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Our Journey
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Key milestones in our mission to revolutionize healthcare
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        <div className="space-y-8">
                            {milestones.map((milestone, index) => (
                                <div key={index} className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-lg font-bold text-primary">{milestone.year}</span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold mb-2">{milestone.title}</h4>
                                        <p className="text-muted-foreground">{milestone.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <h2 className="text-3xl md:text-5xl font-bold">
                                    Our Values
                                </h2>
                                <p className="text-lg text-muted-foreground">
                                    Everything we do is guided by our core values of integrity, innovation, and patient care.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <Heart className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold">Patient-First Approach</h3>
                                            <p className="text-sm text-muted-foreground">Every decision we make prioritizes patient safety and care quality.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Award className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold">Excellence</h3>
                                            <p className="text-sm text-muted-foreground">We strive for the highest standards in everything we do.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Users className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold">Collaboration</h3>
                                            <p className="text-sm text-muted-foreground">We work together with healthcare professionals and patients.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                    <div className="text-center space-y-4">
                                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                            <Heart className="h-12 w-12 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-semibold">Making Healthcare Better</h3>
                                        <p className="text-sm text-muted-foreground">One diagnosis at a time</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Join Us in Revolutionizing Healthcare
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Be part of the future of medical diagnosis. Experience accurate, fast, and accessible healthcare.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="px-8 py-6 text-lg">
                                Get Started Today
                                <ArrowRight className="ml-2 h-5 w-5" />
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
