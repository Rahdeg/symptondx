'use client';

import React from 'react';
import {
    FileText,
    Calendar,
    Mail,
    ArrowRight,
    Clock,
    Users,
    Heart,
    Zap,
    Shield,
    Brain
} from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const upcomingTopics = [
    {
        title: "The Future of AI in Healthcare",
        description: "Exploring how artificial intelligence is revolutionizing medical diagnosis and patient care.",
        category: "AI & Technology",
        readTime: "5 min read",
        icon: Brain
    },
    {
        title: "Understanding Symptom Analysis",
        description: "Learn how our AI analyzes symptoms and what factors contribute to accurate diagnosis.",
        category: "Medical Insights",
        readTime: "7 min read",
        icon: Heart
    },
    {
        title: "Privacy and Security in Digital Health",
        description: "How we protect your health information and maintain HIPAA compliance in the digital age.",
        category: "Privacy & Security",
        readTime: "6 min read",
        icon: Shield
    },
    {
        title: "The Science Behind Our AI Models",
        description: "Deep dive into the machine learning algorithms that power our diagnostic platform.",
        category: "Technology",
        readTime: "8 min read",
        icon: Zap
    },
    {
        title: "Patient Stories: Real Impact",
        description: "Hear from users whose lives have been improved by our AI-powered diagnosis platform.",
        category: "Patient Stories",
        readTime: "4 min read",
        icon: Users
    },
    {
        title: "Healthcare Accessibility Worldwide",
        description: "How technology is making quality healthcare accessible to underserved communities.",
        category: "Global Health",
        readTime: "6 min read",
        icon: Heart
    }
];

const blogCategories = [
    {
        name: "AI & Technology",
        description: "Latest developments in AI and healthcare technology",
        count: "12 articles",
        color: "bg-blue-100 text-blue-800"
    },
    {
        name: "Medical Insights",
        description: "Expert medical advice and health information",
        count: "8 articles",
        color: "bg-green-100 text-green-800"
    },
    {
        name: "Privacy & Security",
        description: "Data protection and privacy in healthcare",
        count: "5 articles",
        color: "bg-purple-100 text-purple-800"
    },
    {
        name: "Patient Stories",
        description: "Real experiences from our users",
        count: "10 articles",
        color: "bg-orange-100 text-orange-800"
    }
];

const newsletterBenefits = [
    "Exclusive access to new articles",
    "Weekly health tips and insights",
    "Early access to new features",
    "Expert medical advice",
    "Industry news and updates"
];

export default function BlogPage() {
    return (
        <div className="min-h-screen">
            <Header variant="default" />

            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <div className="mx-auto mb-6 p-4 rounded-full bg-primary/10 w-fit">
                            <FileText className="h-12 w-12 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold gradient-primary-text">
                            Blog Coming Soon
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            We&apos;re working on bringing you insightful articles about AI in healthcare, medical insights, and patient stories.
                        </p>
                        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Launching Q1 2025</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Coming Soon Notice */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <Card className="p-8 border-blue-200 bg-blue-50">
                            <div className="flex items-start space-x-4">
                                <Clock className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold text-blue-900">What to Expect</h2>
                                    <div className="space-y-3 text-blue-800">
                                        <p>
                                            Our blog will feature expert insights, patient stories, and the latest developments in AI-powered healthcare.
                                            We&apos;re currently working on creating valuable content that will help you understand:
                                        </p>
                                        <ul className="space-y-2">
                                            <li className="flex items-start space-x-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                                                <span>How AI is transforming medical diagnosis</span>
                                            </li>
                                            <li className="flex items-start space-x-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                                                <span>Health tips and medical insights from our experts</span>
                                            </li>
                                            <li className="flex items-start space-x-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                                                <span>Real patient stories and experiences</span>
                                            </li>
                                            <li className="flex items-start space-x-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                                                <span>Privacy and security in digital health</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Upcoming Articles Preview */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Coming Soon Articles
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Here&apos;s a preview of the articles we&apos;re working on
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingTopics.map((article, index) => (
                            <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-xs">
                                            {article.category}
                                        </Badge>
                                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            <span>{article.readTime}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                                            <article.icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-semibold text-sm">{article.title}</h3>
                                            <p className="text-xs text-muted-foreground">{article.description}</p>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-border">
                                        <span className="text-xs text-muted-foreground">Coming Soon</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Blog Categories */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Blog Categories
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Content organized by topic for easy navigation
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {blogCategories.map((category, index) => (
                            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
                                <div className="space-y-3">
                                    <Badge className={`${category.color} border-0`}>
                                        {category.name}
                                    </Badge>
                                    <p className="text-sm text-muted-foreground">{category.description}</p>
                                    <p className="text-xs font-medium text-primary">{category.count}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter Signup */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-5xl font-bold">
                                Stay Updated
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Be the first to know when our blog launches and get exclusive access to new articles.
                            </p>
                        </div>

                        <Card className="p-8">
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold">Subscribe to Our Newsletter</h3>
                                    <p className="text-muted-foreground">
                                        Get notified about new articles, health tips, and platform updates.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <input
                                                type="email"
                                                placeholder="Enter your email address"
                                                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                        <Button size="lg" className="w-full md:w-auto">
                                            Subscribe
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">What you&apos;ll get:</h4>
                                        <ul className="space-y-1">
                                            {newsletterBenefits.map((benefit, index) => (
                                                <li key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                                    <span>{benefit}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Contact for Early Access */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center space-y-6">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Want Early Access?
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Have a topic you&apos;d like us to cover? Or want to contribute to our blog? We&apos;d love to hear from you.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="mailto:blog@symptomdx.com"
                                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                <Mail className="h-5 w-5" />
                                <span>blog@symptomdx.com</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
