'use client';

import React from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  Stethoscope,
  Shield,
  Zap,
  Users,
  TrendingUp,
  ArrowRight,
  Star,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeatureCardComponent, StatCardComponent } from '@/components/ui/enhanced-cards';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { PrimaryAuthButton } from '@/modules/auth/ui/auth-button';

const heroContent = {
  title: "AI-Powered Medical Diagnosis",
  subtitle: "Get accurate disease diagnosis from symptoms using advanced machine learning",
  description: "Our platform combines cutting-edge AI technology with medical expertise to provide fast, accurate, and reliable symptom analysis and disease diagnosis.",
  stats: [
    { title: "Accuracy Rate", value: "94%", icon: TrendingUp, description: "AI diagnostic accuracy" },
    { title: "Diagnoses", value: "10K+", icon: Stethoscope, description: "Completed analyses" },
    { title: "Users", value: "2.5K+", icon: Users, description: "Active users" },
    { title: "Response Time", value: "< 30s", icon: Clock, description: "Average analysis time" }
  ]
};

const featuresContent = [
  {
    title: "AI-Powered Analysis",
    description: "Advanced machine learning algorithms analyze your symptoms and provide accurate diagnostic suggestions with confidence scores.",
    icon: Zap,
    badge: "AI"
  },
  {
    title: "Medical Professional Review",
    description: "Licensed doctors review AI analyses to ensure accuracy and provide additional medical insights when needed.",
    icon: Stethoscope,
    badge: "Verified"
  },
  {
    title: "Secure & Private",
    description: "Your health data is encrypted and protected with enterprise-grade security. We never share your information.",
    icon: Shield,
    badge: "HIPAA"
  },
  {
    title: "Instant Results",
    description: "Get diagnostic results in under 30 seconds. Our optimized AI models provide fast and reliable analysis.",
    icon: Zap,
    badge: "Fast"
  }
];

const testimonialsContent = [
  {
    name: "Dr. Sarah Chen",
    role: "Emergency Medicine Physician",
    content: "This platform has been incredibly helpful in my practice. The AI accuracy is impressive and helps me make faster decisions.",
    rating: 5
  },
  {
    name: "Michael Rodriguez",
    role: "Patient",
    content: "I was able to get a preliminary diagnosis at 2 AM when no doctors were available. It gave me peace of mind and guidance.",
    rating: 5
  },
  {
    name: "Dr. James Wilson",
    role: "Family Medicine",
    content: "The diagnostic suggestions are well-reasoned and help me consider conditions I might have overlooked.",
    rating: 5
  }
];

type UserRole = "patient" | "doctor" | "admin";

export default function Home() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const navigateToSignUp = () => router.push('/sign-up');

  const navigateToDashboard = () => {
    const userRole = user?.publicMetadata?.role as UserRole | undefined;

    // Role-specific dashboard mapping
    const dashboardRoutes: Record<UserRole, string> = {
      patient: '/dashboard/patient',
      doctor: '/dashboard/doctor',
      admin: '/dashboard/admin'
    };

    // Route to role-specific dashboard or fallback to patient dashboard
    const targetRoute = userRole ? dashboardRoutes[userRole] : '/dashboard/patient';
    router.push(targetRoute);
  };

  return (
    <div className="min-h-screen">
      <Header variant="transparent" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold gradient-primary-text">
                {heroContent.title}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                {heroContent.subtitle}
              </p>
              <p className="text-base md:text-lg text-muted-foreground/80 max-w-3xl mx-auto leading-relaxed">
                {heroContent.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isSignedIn ? (
                <Button
                  size="lg"
                  onClick={navigateToDashboard}
                  className="px-8 py-6 text-lg gradient-primary shadow-primary-lg hover:shadow-primary transition-all duration-300"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={navigateToSignUp}
                    className="px-8 py-6 text-lg gradient-primary shadow-primary-lg hover:shadow-primary transition-all duration-300"
                  >
                    Start Free Analysis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <PrimaryAuthButton className="px-8 py-6 text-lg" />
                </>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
              {heroContent.stats.map((stat, index) => (
                <StatCardComponent
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  description={stat.description}
                  className="border-0 bg-background/60 backdrop-blur-sm"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-muted-foreground">
              Experience the future of medical diagnosis with our advanced AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuresContent.map((feature, index) => (
              <FeatureCardComponent
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                badge={feature.badge}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-lg text-muted-foreground">
              See what doctors and patients are saying about our platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonialsContent.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm space-y-4"
              >
                <div className="flex items-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
