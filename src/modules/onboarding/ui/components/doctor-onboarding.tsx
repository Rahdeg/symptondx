"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    HeartPulse,
    Shield,
    ArrowRight,
    ArrowLeft,
    Check,
    Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, UseFormRegister, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProgressCardComponent } from "@/components/ui/enhanced-cards";
import { toast } from "sonner";
import { api } from "@/trpc/client";

// Doctor onboarding schema
const doctorOnboardingSchema = z.object({
    licenseNumber: z.string().min(5, "License number is required"),
    specialization: z.string().min(2, "Specialization is required"),
    yearsOfExperience: z.number().min(0, "Years of experience must be 0 or greater"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    qualifications: z.string().min(10, "Please provide your qualifications"),
    hospitalAffiliations: z.string().optional(),
});

type DoctorOnboardingData = z.infer<typeof doctorOnboardingSchema>;

interface StepProps {
    register: UseFormRegister<DoctorOnboardingData>;
    errors: FieldErrors<DoctorOnboardingData>;
}

// Step components
const LicenseInfoStep: React.FC<StepProps> = ({ register, errors }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="licenseNumber">Medical License Number</Label>
                <Input
                    id="licenseNumber"
                    placeholder="Enter your license number"
                    {...register("licenseNumber")}
                    className={errors.licenseNumber ? "border-red-500" : ""}
                />
                {errors.licenseNumber && (
                    <p className="text-sm text-red-500">{errors.licenseNumber.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="phoneNumber">Professional Phone Number</Label>
                <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    {...register("phoneNumber")}
                    className={errors.phoneNumber ? "border-red-500" : ""}
                />
                {errors.phoneNumber && (
                    <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                )}
            </div>
        </div>
    </div>
);

const ProfessionalInfoStep: React.FC<StepProps> = ({ register, errors }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="specialization">Medical Specialization</Label>
                <Input
                    id="specialization"
                    placeholder="e.g., Cardiology, Pediatrics, etc."
                    {...register("specialization")}
                    className={errors.specialization ? "border-red-500" : ""}
                />
                {errors.specialization && (
                    <p className="text-sm text-red-500">{errors.specialization.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input
                    id="yearsOfExperience"
                    type="number"
                    min="0"
                    placeholder="0"
                    {...register("yearsOfExperience", { valueAsNumber: true })}
                    className={errors.yearsOfExperience ? "border-red-500" : ""}
                />
                {errors.yearsOfExperience && (
                    <p className="text-sm text-red-500">{errors.yearsOfExperience.message}</p>
                )}
            </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="qualifications">Medical Qualifications</Label>
            <Textarea
                id="qualifications"
                placeholder="List your medical degrees, certifications, and qualifications"
                {...register("qualifications")}
                className={errors.qualifications ? "border-red-500" : ""}
                rows={4}
            />
            {errors.qualifications && (
                <p className="text-sm text-red-500">{errors.qualifications.message}</p>
            )}
        </div>

        <div className="space-y-2">
            <Label htmlFor="hospitalAffiliations">Hospital Affiliations (Optional)</Label>
            <Textarea
                id="hospitalAffiliations"
                placeholder="List hospitals or clinics you are affiliated with"
                {...register("hospitalAffiliations")}
                rows={3}
            />
        </div>
    </div>
);

export function DoctorOnboarding() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // tRPC mutation for creating doctor
    const createDoctorMutation = api.doctors.createDoctor.useMutation({
        onSuccess: (data) => {
            console.log("Doctor created successfully:", data);
            toast.success("Profile created successfully! Awaiting verification.");
            router.push("/dashboard/doctor");
        },
        onError: (error) => {
            console.error("Error creating doctor:", error);
            toast.error("Failed to create profile. Please try again.");
        },
    });

    const steps = [
        {
            title: "License Information",
            description: "Verify your medical license and contact information",
            icon: <Shield className="h-6 w-6" />,
            component: LicenseInfoStep,
        },
        {
            title: "Professional Details",
            description: "Tell us about your medical background and expertise",
            icon: <HeartPulse className="h-6 w-6" />,
            component: ProfessionalInfoStep,
        },
    ];

    const form = useForm<DoctorOnboardingData>({
        resolver: zodResolver(doctorOnboardingSchema),
        defaultValues: {
            yearsOfExperience: 0,
        },
    });

    const { register, handleSubmit, formState: { errors }, watch } = form;

    const handleNext = () => {
        const currentValues = watch();
        const isValid = true;
        const missingFields: string[] = [];

        if (currentStep === 0) {
            if (!currentValues.licenseNumber) missingFields.push("License Number");
            if (!currentValues.phoneNumber) missingFields.push("Phone Number");
        } else if (currentStep === 1) {
            if (!currentValues.specialization) missingFields.push("Specialization");
            if (!currentValues.qualifications) missingFields.push("Qualifications");
            if (currentValues.yearsOfExperience === undefined || currentValues.yearsOfExperience < 0) {
                missingFields.push("Years of Experience");
            }
        }

        if (missingFields.length > 0) {
            toast.error(`Please fill in: ${missingFields.join(", ")}`);
            return;
        }

        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const onSubmit = async (data: DoctorOnboardingData) => {
        setIsSubmitting(true);
        createDoctorMutation.mutate(data, {
            onSettled: () => {
                setIsSubmitting(false);
            },
        });
    };

    const CurrentStepComponent = steps[currentStep].component;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                            Doctor Profile Setup
                        </h1>
                        <p className="text-muted-foreground">
                            Complete your professional verification process
                        </p>
                    </motion.div>

                    {/* Progress */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-md mx-auto mb-8"
                    >
                        <ProgressCardComponent
                            title="Setup Progress"
                            currentStep={currentStep + 1}
                            totalSteps={steps.length}
                            steps={steps.map((step, index) => ({
                                label: step.title,
                                completed: index < currentStep,
                            }))}
                        />
                    </motion.div>

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="max-w-3xl mx-auto">
                            <CardHeader className="text-center">
                                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 text-primary w-fit">
                                    {steps[currentStep].icon}
                                </div>
                                <CardTitle className="text-xl">
                                    {steps[currentStep].title}
                                </CardTitle>
                                <p className="text-muted-foreground">
                                    {steps[currentStep].description}
                                </p>
                            </CardHeader>

                            <CardContent>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentStep}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <CurrentStepComponent
                                                register={register}
                                                errors={errors}
                                            />
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* Navigation */}
                                    <div className="flex justify-between mt-8">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handlePrevious}
                                            disabled={currentStep === 0}
                                        >
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Previous
                                        </Button>

                                        {currentStep === steps.length - 1 ? (
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="min-w-32"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Creating...
                                                    </>
                                                ) : (
                                                    <>
                                                        Complete Setup
                                                        <Check className="h-4 w-4 ml-2" />
                                                    </>
                                                )}
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                onClick={handleNext}
                                            >
                                                Next
                                                <ArrowRight className="h-4 w-4 ml-2" />
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
