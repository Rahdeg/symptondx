'use client';

import React from 'react';
import {
    User,
    FileText,
    Brain,
    Stethoscope,
    CheckCircle,
    Shield,
    ArrowRight,
    Play,
    Download,
    MessageCircle,
} from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const steps = [
    {
        step: 1,
        title: "Enter Your Symptoms",
        description: "Describe your symptoms in detail using our intuitive interface. Our system guides you through relevant questions to gather comprehensive information.",
        icon: User,
        details: [
            "Answer guided questions about your symptoms",
            "Provide information about symptom duration and severity",
            "Include any relevant medical history",
            "Upload photos if applicable (optional)"
        ],
        duration: "2-3 minutes"
    },
    {
        step: 2,
        title: "AI Analysis",
        description: "Our advanced AI algorithms analyze your symptoms using machine learning models trained on millions of medical cases.",
        icon: Brain,
        details: [
            "Pattern recognition and symptom correlation",
            "Differential diagnosis generation",
            "Confidence scoring for each possibility",
            "Risk assessment and urgency evaluation"
        ],
        duration: "15-30 seconds"
    },
    {
        step: 3,
        title: "Medical Review",
        description: "Licensed physicians review the AI analysis to ensure accuracy and provide additional medical insights.",
        icon: Stethoscope,
        details: [
            "Board-certified doctor review",
            "Medical expertise validation",
            "Additional recommendations",
            "Quality assurance checks"
        ],
        duration: "5-10 minutes"
    },
    {
        step: 4,
        title: "Get Your Results",
        description: "Receive your comprehensive diagnostic report with recommendations and next steps.",
        icon: CheckCircle,
        details: [
            "Detailed diagnostic report",
            "Treatment recommendations",
            "When to seek immediate care",
            "Follow-up guidance"
        ],
        duration: "Immediate"
    }
];

const processFeatures = [
    {
        title: "Comprehensive Data Collection",
        description: "We gather detailed information about your symptoms, medical history, and current health status.",
        icon: FileText,
        features: [
            "Symptom severity and duration",
            "Medical history review",
            "Current medications",
            "Lifestyle factors"
        ]
    },
    {
        title: "Advanced AI Processing",
        description: "Our AI uses deep learning to analyze patterns and generate accurate diagnostic suggestions.",
        icon: Brain,
        features: [
            "Neural network analysis",
            "Pattern recognition",
            "Differential diagnosis",
            "Confidence scoring"
        ]
    },
    {
        title: "Medical Professional Oversight",
        description: "Every diagnosis is reviewed by licensed physicians to ensure accuracy and safety.",
        icon: Stethoscope,
        features: [
            "Doctor review process",
            "Medical validation",
            "Expert recommendations",
            "Quality assurance"
        ]
    },
    {
        title: "Secure & Private",
        description: "Your health information is protected with enterprise-grade security and HIPAA compliance.",
        icon: Shield,
        features: [
            "End-to-end encryption",
            "HIPAA compliance",
            "Data privacy protection",
            "Secure storage"
        ]
    }
];

const timelineData = [
    { time: "0:00", event: "Start symptom entry", description: "Begin describing your symptoms" },
    { time: "0:02", event: "AI analysis begins", description: "Machine learning algorithms start processing" },
    { time: "0:15", event: "Initial analysis complete", description: "AI generates preliminary diagnosis" },
    { time: "0:20", event: "Medical review starts", description: "Doctor begins reviewing AI analysis" },
    { time: "0:25", event: "Review complete", description: "Medical professional validates results" },
    { time: "0:30", event: "Results delivered", description: "Comprehensive report ready for review" }
];

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen">
            <Header variant="default" />

            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <h1 className="text-4xl md:text-6xl font-bold gradient-primary-text">
                            How It Works
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Our AI-powered diagnosis process combines cutting-edge technology with medical expertise to deliver accurate, fast, and reliable results.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="px-8 py-6 text-lg">
                                <Play className="mr-2 h-5 w-5" />
                                Watch Demo
                            </Button>
                            <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                                <Download className="mr-2 h-5 w-5" />
                                Download Guide
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Process Overview */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Simple 4-Step Process
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            From symptom entry to diagnosis results in under 30 minutes
                        </p>
                    </div>

                    <div className="space-y-8">
                        {steps.map((step, index) => (
                            <div key={index} className="flex flex-col lg:flex-row items-center gap-8">
                                <div className="flex-shrink-0">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                                            <step.icon className="h-10 w-10 text-primary" />
                                        </div>
                                        <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
                                            {step.step}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-bold">{step.title}</h3>
                                        <Badge variant="outline" className="text-sm">
                                            {step.duration}
                                        </Badge>
                                    </div>
                                    <p className="text-lg text-muted-foreground">{step.description}</p>
                                    <ul className="space-y-2">
                                        {step.details.map((detail, detailIndex) => (
                                            <li key={detailIndex} className="flex items-start space-x-2">
                                                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block">
                                        <ArrowRight className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Real-Time Timeline
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            See exactly what happens during your diagnosis process
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        <div className="space-y-6">
                            {timelineData.map((item, index) => (
                                <div key={index} className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-16 text-right">
                                        <span className="text-sm font-mono text-primary">{item.time}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                                            <h4 className="font-semibold">{item.event}</h4>
                                        </div>
                                        <p className="text-sm text-muted-foreground ml-4">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Process Features */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            What Makes Us Different
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Advanced technology combined with medical expertise for the most accurate results
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {processFeatures.map((feature, index) => (
                            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
                                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                                    <feature.icon className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                                <ul className="space-y-1 text-left">
                                    {feature.features.map((item, itemIndex) => (
                                        <li key={itemIndex} className="flex items-start space-x-2">
                                            <CheckCircle className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                                            <span className="text-xs text-muted-foreground">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Accuracy Stats */}
            <section className="py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Proven Accuracy & Reliability
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Our platform delivers consistently accurate results backed by medical research
                        </p>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-primary mb-2">94%</div>
                                <div className="text-sm text-muted-foreground">Diagnostic Accuracy</div>
                                <Progress value={94} className="mt-4" />
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-primary mb-2">30s</div>
                                <div className="text-sm text-muted-foreground">Average Response Time</div>
                                <Progress value={100} className="mt-4" />
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-primary mb-2">10K+</div>
                                <div className="text-sm text-muted-foreground">Successful Diagnoses</div>
                                <Progress value={100} className="mt-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Ready to Get Started?
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Experience the future of medical diagnosis with our AI-powered platform.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="px-8 py-6 text-lg">
                                Start Your Diagnosis
                            </Button>
                            <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                                <MessageCircle className="mr-2 h-5 w-5" />
                                Contact Support
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
