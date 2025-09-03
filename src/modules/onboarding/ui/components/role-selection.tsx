"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, HeartPulse, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressCardComponent } from "@/components/ui/enhanced-cards";
import { useRouter } from "next/navigation";

type UserRole = "patient" | "doctor";

interface RoleData {
    label: string;
    value: UserRole;
    description: string;
    features: string[];
    icon: React.ReactElement;
    gradient: string;
    route: string;
}

const rolesData: RoleData[] = [
    {
        label: "Patient",
        value: "patient",
        description: "Get AI-powered symptom analysis and diagnostic suggestions from the comfort of your home",
        features: [
            "Instant symptom analysis",
            "AI-powered diagnosis suggestions",
            "Health history tracking",
            "Secure medical records"
        ],
        icon: <User className="h-8 w-8 text-blue-600" />,
        gradient: "from-blue-500 to-cyan-500",
        route: "/onboarding/patient"
    },
    {
        label: "Healthcare Professional",
        value: "doctor",
        description: "Review AI analyses, collaborate with AI for better diagnosis, and manage patient care efficiently",
        features: [
            "AI-assisted diagnosis review",
            "Patient management dashboard",
            "Clinical decision support",
            "Professional certification required"
        ],
        icon: <HeartPulse className="h-8 w-8 text-green-600" />,
        gradient: "from-green-500 to-emerald-500",
        route: "/onboarding/doctor"
    }
];

export function RoleSelection() {
    const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);
    const router = useRouter();

    const handleRoleSelect = (role: RoleData) => {
        setSelectedRole(role);
    };

    const handleContinue = () => {
        if (!selectedRole) return;

        console.log('Navigating to:', selectedRole.route);

        router.push(selectedRole.route);
    };

    const renderRoleCard = (role: RoleData) => (
        <motion.div
            key={role.value}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            layout
        >
            <Card
                className={`cursor-pointer transition-all duration-300 relative overflow-hidden ${selectedRole?.value === role.value
                    ? "ring-2 ring-primary shadow-xl border-primary/50"
                    : "hover:shadow-lg border-border"
                    }`}
                onClick={() => handleRoleSelect(role)}
            >
                {/* Background gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-5`} />

                {/* Selection indicator */}
                {selectedRole?.value === role.value && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 z-10"
                    >
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                            <CheckCircle className="h-4 w-4" />
                        </div>
                    </motion.div>
                )}

                <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 p-3 rounded-full bg-background shadow-sm">
                        {role.icon}
                    </div>
                    <CardTitle className="text-xl font-bold">{role.label}</CardTitle>
                </CardHeader>

                <CardContent className="pt-0">
                    <p className="text-muted-foreground text-center mb-6 leading-relaxed">
                        {role.description}
                    </p>

                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm flex items-center">
                            <Sparkles className="h-4 w-4 mr-2 text-primary" />
                            Key Features
                        </h4>
                        <div className="space-y-1 text-sm text-muted-foreground">
                            {role.features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center"
                                >
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0" />
                                    {feature}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
                            Welcome to SymptomDx
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground mb-2">
                            AI-Powered Medical Diagnosis Platform
                        </p>
                        <p className="text-base text-muted-foreground/80 max-w-2xl mx-auto">
                            Choose your role to access personalized features and start your journey with intelligent healthcare
                        </p>
                    </motion.div>

                    {/* Progress Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-md mx-auto mb-8"
                    >
                        <ProgressCardComponent
                            title="Onboarding Progress"
                            currentStep={1}
                            totalSteps={3}
                            steps={[
                                { label: "Select Role", completed: selectedRole !== null },
                                { label: "Complete Profile", completed: false },
                                { label: "Setup Preferences", completed: false }
                            ]}
                        />
                    </motion.div>

                    {/* Role Cards */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto"
                    >
                        {rolesData.map(renderRoleCard)}
                    </motion.div>

                    {/* Selected Role Details */}
                    <AnimatePresence>
                        {selectedRole && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="max-w-2xl mx-auto mb-8"
                            >
                                <Card className="border-primary/20 bg-primary/5">
                                    <CardContent className="p-6 text-center">
                                        <h3 className="text-lg font-semibold mb-2">
                                            Perfect! You&apos;ve selected {selectedRole.label}
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Click continue to complete your {selectedRole.label.toLowerCase()} profile setup
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Continue Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-center"
                    >
                        <Button
                            onClick={handleContinue}
                            disabled={!selectedRole}
                            size="lg"
                            type="button"
                            className="px-12 py-6 text-lg font-semibold"
                        >
                            {selectedRole ? `Continue as ${selectedRole.label}` : "Select a Role First"}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
