'use client';

import React, { useState } from 'react';
import {
    HelpCircle,
    Search,
    MessageCircle,
    Phone,
    Mail,
    Clock,
    AlertTriangle,
    User,
    Shield,
    Brain,
    FileText,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const faqCategories = [
    {
        title: "Getting Started",
        icon: User,
        faqs: [
            {
                question: "How do I create an account?",
                answer: "Click the 'Sign Up' button on our homepage, enter your email address, and follow the verification process. You'll receive a confirmation email to complete your registration."
            },
            {
                question: "Is the service free to use?",
                answer: "Yes, our basic diagnosis service is free. We also offer premium features for advanced analysis and priority support."
            },
            {
                question: "What information do I need to provide?",
                answer: "You'll need to provide your symptoms, medical history (optional), and basic demographic information. All information is kept confidential and secure."
            },
            {
                question: "How accurate is the AI diagnosis?",
                answer: "Our AI achieves 94% accuracy in diagnostic suggestions. All results are reviewed by licensed medical professionals to ensure quality and safety."
            }
        ]
    },
    {
        title: "Using the Platform",
        icon: Brain,
        faqs: [
            {
                question: "How long does it take to get results?",
                answer: "Most diagnoses are completed within 30 seconds. Medical professional review adds an additional 5-10 minutes for comprehensive analysis."
            },
            {
                question: "Can I use this for emergency situations?",
                answer: "No, our platform is not for emergencies. If you're experiencing a medical emergency, call 911 or go to your nearest emergency room immediately."
            },
            {
                question: "Can I save my diagnosis results?",
                answer: "Yes, all your diagnosis results are automatically saved to your account. You can access them anytime from your dashboard."
            },
            {
                question: "How do I update my symptoms?",
                answer: "You can update your symptoms by starting a new diagnosis session. Previous symptoms and results remain in your history for reference."
            }
        ]
    },
    {
        title: "Account & Privacy",
        icon: Shield,
        faqs: [
            {
                question: "Is my health information secure?",
                answer: "Yes, we use enterprise-grade encryption and are fully HIPAA compliant. Your health information is protected with the highest security standards."
            },
            {
                question: "Can I delete my account?",
                answer: "Yes, you can delete your account at any time from your account settings. This will permanently remove all your data from our systems."
            },
            {
                question: "Who can see my health information?",
                answer: "Only you and our licensed medical professionals (for review purposes) can see your health information. We never share your data with third parties."
            },
            {
                question: "How do I change my password?",
                answer: "Go to your account settings and click 'Change Password'. You'll need to enter your current password and create a new one."
            }
        ]
    },
    {
        title: "Technical Support",
        icon: FileText,
        faqs: [
            {
                question: "The platform is running slowly. What should I do?",
                answer: "Try refreshing your browser, clearing your cache, or using a different browser. If the issue persists, contact our technical support team."
            },
            {
                question: "I'm having trouble logging in. What can I do?",
                answer: "Check that you're using the correct email and password. If you've forgotten your password, use the 'Forgot Password' link on the login page."
            },
            {
                question: "The diagnosis results aren't loading. What's wrong?",
                answer: "This could be due to a temporary server issue. Try refreshing the page or waiting a few minutes. If the problem continues, contact support."
            },
            {
                question: "Can I use the platform on my mobile device?",
                answer: "Yes, our platform is fully responsive and works on all mobile devices. We also have a mobile app available for download."
            }
        ]
    }
];

const supportMethods = [
    {
        title: "Live Chat",
        description: "Get instant help from our support team",
        icon: MessageCircle,
        availability: "24/7",
        responseTime: "Immediate",
        contact: "Click the chat icon in the bottom right"
    },
    {
        title: "Email Support",
        description: "Send us a detailed message and we'll respond quickly",
        icon: Mail,
        availability: "24/7",
        responseTime: "Within 24 hours",
        contact: "support@symptomdx.com"
    },
    {
        title: "Phone Support",
        description: "Speak directly with our support team",
        icon: Phone,
        availability: "Mon-Fri 9AM-6PM EST",
        responseTime: "Immediate",
        contact: "+1 (555) 123-4567"
    }
];

const quickActions = [
    {
        title: "Start New Diagnosis",
        description: "Begin a new symptom analysis",
        icon: Brain,
        href: "/diagnosis/new"
    },
    {
        title: "View History",
        description: "Access your past diagnoses",
        icon: FileText,
        href: "/health-history"
    },
    {
        title: "Account Settings",
        description: "Manage your account preferences",
        icon: User,
        href: "/profile"
    },
    {
        title: "Contact Support",
        description: "Get help from our team",
        icon: MessageCircle,
        href: "/contact"
    }
];

export default function HelpCenterPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const handleFaqToggle = (index: number) => {
        setExpandedFaq(expandedFaq === index ? null : index);
    };

    const filteredFaqs = faqCategories.map(category => ({
        ...category,
        faqs: category.faqs.filter(faq =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.faqs.length > 0);

    return (
        <div className="min-h-screen">
            <Header variant="default" />

            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <div className="mx-auto mb-6 p-4 rounded-full bg-primary/10 w-fit">
                            <HelpCircle className="h-12 w-12 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold gradient-primary-text">
                            Help Center
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Find answers to common questions and get the support you need.
                        </p>
                    </div>
                </div>
            </section>

            {/* Search Section */}
            <section className="py-12 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search for help articles, FAQs, or topics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-6 text-lg"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Quick Actions
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Common tasks you can perform right now
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {quickActions.map((action, index) => (
                            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                                    <action.icon className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                                <Button variant="outline" size="sm" className="w-full">
                                    Go to {action.title}
                                </Button>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Find answers to the most common questions about our platform
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-8">
                        {filteredFaqs.map((category, categoryIndex) => (
                            <div key={categoryIndex}>
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <category.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-semibold">{category.title}</h3>
                                </div>
                                <div className="space-y-4">
                                    {category.faqs.map((faq, faqIndex) => {
                                        const globalIndex = categoryIndex * 100 + faqIndex;
                                        const isExpanded = expandedFaq === globalIndex;

                                        return (
                                            <Card key={faqIndex} className="overflow-hidden">
                                                <button
                                                    onClick={() => handleFaqToggle(globalIndex)}
                                                    className="w-full p-6 text-left hover:bg-muted/50 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-semibold pr-4">{faq.question}</h4>
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                                        ) : (
                                                            <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                                        )}
                                                    </div>
                                                </button>
                                                {isExpanded && (
                                                    <div className="px-6 pb-6">
                                                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                                                    </div>
                                                )}
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Support Methods */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Get in Touch
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Can&apos;t find what you&apos;re looking for? Our support team is here to help.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {supportMethods.map((method, index) => (
                            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
                                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                                    <method.icon className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{method.title}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{method.description}</p>
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>{method.availability}</span>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {method.responseTime}
                                    </Badge>
                                </div>
                                <p className="text-sm font-medium text-primary">{method.contact}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Emergency Notice */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <Card className="p-8 border-red-200 bg-red-50">
                            <div className="flex items-start space-x-4">
                                <AlertTriangle className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold text-red-900">Medical Emergency</h2>
                                    <div className="space-y-3 text-red-800">
                                        <p className="font-semibold">
                                            If you are experiencing a medical emergency, please:
                                        </p>
                                        <ul className="space-y-2">
                                            <li className="flex items-start space-x-2">
                                                <div className="w-2 h-2 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                                                <span>Call 911 immediately</span>
                                            </li>
                                            <li className="flex items-start space-x-2">
                                                <div className="w-2 h-2 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                                                <span>Go to your nearest emergency room</span>
                                            </li>
                                            <li className="flex items-start space-x-2">
                                                <div className="w-2 h-2 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                                                <span>Do not use this platform for emergency medical situations</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
