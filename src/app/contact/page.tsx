'use client';

import React, { useState } from 'react';
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Send,
    MessageCircle,
    HelpCircle,
    Shield,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const contactInfo = [
    {
        title: "Email Support",
        description: "Get help via email within 24 hours",
        icon: Mail,
        contact: "support@symptomdx.com",
        availability: "24/7",
        responseTime: "Within 24 hours"
    },
    {
        title: "Phone Support",
        description: "Speak directly with our support team",
        icon: Phone,
        contact: "+1 (555) 123-4567",
        availability: "Mon-Fri 9AM-6PM EST",
        responseTime: "Immediate"
    },
    {
        title: "Office Address",
        description: "Visit our headquarters",
        icon: MapPin,
        contact: "123 Healthcare Ave, Medical City, MC 12345",
        availability: "Mon-Fri 9AM-5PM",
        responseTime: "By appointment"
    }
];

const supportTopics = [
    {
        title: "General Support",
        description: "General questions about our platform and services",
        icon: HelpCircle,
        topics: ["Account issues", "Platform usage", "Billing questions", "General inquiries"]
    },
    {
        title: "Technical Support",
        description: "Technical issues and troubleshooting",
        icon: MessageCircle,
        topics: ["Login problems", "Diagnosis errors", "Performance issues", "Browser compatibility"]
    },
    {
        title: "Medical Support",
        description: "Medical questions and concerns",
        icon: Shield,
        topics: ["Diagnosis clarification", "Medical advice", "Emergency situations", "Follow-up care"]
    }
];

const faqs = [
    {
        question: "How accurate is the AI diagnosis?",
        answer: "Our AI achieves 94% accuracy in diagnostic suggestions, with all results reviewed by licensed medical professionals."
    },
    {
        question: "Is my health data secure?",
        answer: "Yes, we use enterprise-grade encryption and are fully HIPAA compliant to protect your health information."
    },
    {
        question: "How long does it take to get results?",
        answer: "Most diagnoses are completed within 30 seconds, with medical review taking an additional 5-10 minutes."
    },
    {
        question: "Can I use this for emergency situations?",
        answer: "No, our platform is not for emergencies. If you're experiencing a medical emergency, please call 911 immediately."
    }
];

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: '',
        urgency: 'normal'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsSubmitting(false);
        setSubmitStatus('success');

        // Reset form after success
        setTimeout(() => {
            setFormData({
                name: '',
                email: '',
                subject: '',
                category: '',
                message: '',
                urgency: 'normal'
            });
            setSubmitStatus('idle');
        }, 3000);
    };

    return (
        <div className="min-h-screen">
            <Header variant="default" />

            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <h1 className="text-4xl md:text-6xl font-bold gradient-primary-text">
                            Contact Us
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            We&apos;re here to help! Get in touch with our support team for any questions or concerns.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Methods */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Get in Touch
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Choose the best way to reach us based on your needs
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {contactInfo.map((info, index) => (
                            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
                                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                                    <info.icon className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{info.description}</p>
                                <div className="space-y-2">
                                    <p className="font-medium text-primary">{info.contact}</p>
                                    <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>{info.availability}</span>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {info.responseTime}
                                    </Badge>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center space-y-4 mb-12">
                            <h2 className="text-3xl md:text-5xl font-bold">
                                Send us a Message
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Fill out the form below and we&apos;ll get back to you as soon as possible
                            </p>
                        </div>

                        <Card className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category *</Label>
                                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="general">General Support</SelectItem>
                                                <SelectItem value="technical">Technical Support</SelectItem>
                                                <SelectItem value="medical">Medical Support</SelectItem>
                                                <SelectItem value="billing">Billing</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="urgency">Urgency</Label>
                                        <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select urgency level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low - Can wait 24-48 hours</SelectItem>
                                                <SelectItem value="normal">Normal - Within 24 hours</SelectItem>
                                                <SelectItem value="high">High - Within 4 hours</SelectItem>
                                                <SelectItem value="urgent">Urgent - Within 1 hour</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject *</Label>
                                    <Input
                                        id="subject"
                                        value={formData.subject}
                                        onChange={(e) => handleInputChange('subject', e.target.value)}
                                        placeholder="Brief description of your inquiry"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Message *</Label>
                                    <Textarea
                                        id="message"
                                        value={formData.message}
                                        onChange={(e) => handleInputChange('message', e.target.value)}
                                        placeholder="Please provide detailed information about your inquiry..."
                                        rows={6}
                                        required
                                    />
                                </div>

                                {submitStatus === 'success' && (
                                    <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-4 rounded-lg">
                                        <CheckCircle className="h-5 w-5" />
                                        <span>Message sent successfully! We&apos;ll get back to you soon.</span>
                                    </div>
                                )}

                                {submitStatus === 'error' && (
                                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
                                        <AlertCircle className="h-5 w-5" />
                                        <span>There was an error sending your message. Please try again.</span>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-5 w-5" />
                                            Send Message
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Support Topics */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            What Can We Help With?
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Our support team is trained to assist with various topics
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {supportTopics.map((topic, index) => (
                            <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                                    <topic.icon className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2 text-center">{topic.title}</h3>
                                <p className="text-sm text-muted-foreground mb-4 text-center">{topic.description}</p>
                                <ul className="space-y-1">
                                    {topic.topics.map((item, itemIndex) => (
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

            {/* FAQ Section */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Quick answers to common questions
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto space-y-4">
                        {faqs.map((faq, index) => (
                            <Card key={index} className="p-6">
                                <h3 className="font-semibold mb-2">{faq.question}</h3>
                                <p className="text-sm text-muted-foreground">{faq.answer}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
