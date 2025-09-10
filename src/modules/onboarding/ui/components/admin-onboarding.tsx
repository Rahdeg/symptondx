"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building,
    User,
    Settings,
    ArrowRight,
    ArrowLeft,
    Check,
    Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressCardComponent } from "@/components/ui/enhanced-cards";
import { toast } from "sonner";
import { api } from "@/trpc/client";
import { adminOnboardingSchema } from "../../schema";

type AdminOnboardingData = z.infer<typeof adminOnboardingSchema>;

interface StepProps {
    register: UseFormRegister<AdminOnboardingData>;
    errors: FieldErrors<AdminOnboardingData>;
    watch: UseFormWatch<AdminOnboardingData>;
    setValue: UseFormSetValue<AdminOnboardingData>;
}

// Step components
const OrganizationInfoStep: React.FC<StepProps> = ({ register, errors }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name</Label>
                <Input
                    id="organizationName"
                    placeholder="Enter your organization name"
                    {...register("organizationName")}
                    className={errors.organizationName ? "border-red-500" : ""}
                />
                {errors.organizationName && (
                    <p className="text-sm text-red-500">{errors.organizationName.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                    id="jobTitle"
                    placeholder="e.g., System Administrator, IT Manager"
                    {...register("jobTitle")}
                    className={errors.jobTitle ? "border-red-500" : ""}
                />
                {errors.jobTitle && (
                    <p className="text-sm text-red-500">{errors.jobTitle.message}</p>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="phoneNumber">Business Phone Number</Label>
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

            <div className="space-y-2">
                <Label htmlFor="department">Department (Optional)</Label>
                <Input
                    id="department"
                    placeholder="e.g., IT, Operations, Healthcare"
                    {...register("department")}
                />
            </div>
        </div>
    </div>
);

const ManagementInfoStep: React.FC<StepProps> = ({ setValue, watch }) => {
    const currentLevel = watch("managementLevel");

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <Label className="text-base font-semibold">Management Level</Label>
                <RadioGroup
                    value={currentLevel}
                    onValueChange={(value) => setValue("managementLevel", value as "senior" | "mid" | "junior" | "executive")}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="executive" id="executive" />
                        <div>
                            <Label htmlFor="executive" className="font-medium">Executive Level</Label>
                            <p className="text-sm text-muted-foreground">C-suite, VP, Director</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="senior" id="senior" />
                        <div>
                            <Label htmlFor="senior" className="font-medium">Senior Management</Label>
                            <p className="text-sm text-muted-foreground">Senior Manager, Lead</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="mid" id="mid" />
                        <div>
                            <Label htmlFor="mid" className="font-medium">Mid-Level</Label>
                            <p className="text-sm text-muted-foreground">Manager, Supervisor</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="junior" id="junior" />
                        <div>
                            <Label htmlFor="junior" className="font-medium">Junior Level</Label>
                            <p className="text-sm text-muted-foreground">Coordinator, Specialist</p>
                        </div>
                    </div>
                </RadioGroup>
            </div>
        </div>
    );
};

const SystemPreferencesStep: React.FC<StepProps> = ({ setValue, watch }) => {
    const currentPermissions = watch("systemPermissions") || [];
    const currentNotifications = watch("preferredNotifications") || [];

    const systemPermissions = [
        { id: "user_management", label: "User Management", description: "Create, edit, and manage user accounts" },
        { id: "system_analytics", label: "System Analytics", description: "Access platform analytics and reports" },
        { id: "ai_model_management", label: "AI Model Management", description: "Manage AI models and configurations" },
        { id: "audit_logs", label: "Audit Logs", description: "View system audit logs and activities" },
        { id: "billing_management", label: "Billing Management", description: "Manage billing and subscription settings" },
        { id: "security_settings", label: "Security Settings", description: "Configure security policies and settings" }
    ];

    const notificationTypes = [
        { id: "system_alerts", label: "System Alerts", description: "Critical system notifications" },
        { id: "user_activities", label: "User Activities", description: "Important user activity notifications" },
        { id: "ai_performance", label: "AI Performance", description: "AI model performance alerts" },
        { id: "security_events", label: "Security Events", description: "Security-related notifications" },
        { id: "billing_updates", label: "Billing Updates", description: "Billing and payment notifications" }
    ];

    const togglePermission = (permissionId: string) => {
        const updated = currentPermissions.includes(permissionId)
            ? currentPermissions.filter(p => p !== permissionId)
            : [...currentPermissions, permissionId];
        setValue("systemPermissions", updated);
    };

    const toggleNotification = (notificationId: string) => {
        const updated = currentNotifications.includes(notificationId)
            ? currentNotifications.filter(n => n !== notificationId)
            : [...currentNotifications, notificationId];
        setValue("preferredNotifications", updated);
    };

    return (
        <div className="space-y-8">
            {/* System Permissions */}
            <div className="space-y-4">
                <Label className="text-base font-semibold">System Permissions</Label>
                <p className="text-sm text-muted-foreground">Select the permissions you need for your role</p>
                <div className="space-y-3">
                    {systemPermissions.map((permission) => (
                        <div
                            key={permission.id}
                            className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                togglePermission(permission.id);
                            }}
                        >
                            <Checkbox
                                id={permission.id}
                                checked={currentPermissions.includes(permission.id)}
                                className="pointer-events-none"
                            />
                            <div className="flex-1">
                                <div className="font-medium">
                                    {permission.label}
                                </div>
                                <p className="text-sm text-muted-foreground">{permission.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Notification Preferences */}
            <div className="space-y-4">
                <Label className="text-base font-semibold">Notification Preferences</Label>
                <p className="text-sm text-muted-foreground">Choose which notifications you want to receive</p>
                <div className="space-y-3">
                    {notificationTypes.map((notification) => (
                        <div
                            key={notification.id}
                            className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleNotification(notification.id);
                            }}
                        >
                            <Checkbox
                                id={notification.id}
                                checked={currentNotifications.includes(notification.id)}
                                className="pointer-events-none"
                            />
                            <div className="flex-1">
                                <div className="font-medium">
                                    {notification.label}
                                </div>
                                <p className="text-sm text-muted-foreground">{notification.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export function AdminOnboarding() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // tRPC mutations for admin onboarding
    const createAdminMutation = api.admin.createAdmin.useMutation({
        onSuccess: () => {
            // After successfully creating admin profile, complete the onboarding
            completeOnboardingMutation.mutate({ role: "admin" });
        },
        onError: (error) => {
            console.error("Error creating admin profile:", error);
            toast.error("Failed to create admin profile. Please try again.");
            setIsSubmitting(false);
        },
    });

    const completeOnboardingMutation = api.onboarding.completeOnboarding.useMutation({
        onSuccess: () => {
            toast.success("Administrator profile setup completed!");
            // Clear any existing admin session to ensure fresh authentication
            sessionStorage.removeItem('admin-authenticated');
            // Small delay to ensure session storage is cleared, then redirect
            setTimeout(() => {
                toast.info("Please authenticate to access the admin dashboard.");
                router.push("/dashboard");
            }, 1000);
        },
        onError: (error) => {
            console.error("Error completing admin onboarding:", error);
            toast.error("Failed to complete setup. Please try again.");
            setIsSubmitting(false);
        },
    });

    const steps = [
        {
            title: "Organization Information",
            description: "Tell us about your organization and role",
            icon: <Building className="h-6 w-6" />,
            component: OrganizationInfoStep,
        },
        {
            title: "Management Level",
            description: "Help us understand your management level",
            icon: <User className="h-6 w-6" />,
            component: ManagementInfoStep,
        },
        {
            title: "System Preferences",
            description: "Configure your permissions and notifications",
            icon: <Settings className="h-6 w-6" />,
            component: SystemPreferencesStep,
        },
    ];

    const form = useForm<AdminOnboardingData>({
        resolver: zodResolver(adminOnboardingSchema),
        defaultValues: {
            systemPermissions: [],
            preferredNotifications: [],
        },
    });

    const { register, handleSubmit, formState: { errors }, watch, setValue } = form;

    const handleNext = (e?: React.MouseEvent) => {
        // Explicitly prevent any form submission
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const currentValues = watch();
        const missingFields: string[] = [];

        if (currentStep === 0) {
            if (!currentValues.organizationName) missingFields.push("Organization Name");
            if (!currentValues.jobTitle) missingFields.push("Job Title");
            if (!currentValues.phoneNumber) missingFields.push("Phone Number");
        } else if (currentStep === 1) {
            if (!currentValues.managementLevel) missingFields.push("Management Level");
        }

        if (missingFields.length > 0) {
            toast.error(`Please fill in: ${missingFields.join(", ")}`);
            return;
        }

        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    };

    const handlePrevious = (e?: React.MouseEvent) => {
        // Explicitly prevent any form submission
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const onSubmit = async (data: AdminOnboardingData) => {
        // Only allow form submission on the last step
        if (currentStep !== steps.length - 1) {
            console.warn("Form submission attempted on non-final step, preventing submission");
            return;
        }

        setIsSubmitting(true);

        // Create admin profile first, then complete onboarding
        createAdminMutation.mutate(data);
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
                            Administrator Setup
                        </h1>
                        <p className="text-muted-foreground">
                            Complete your administrator profile configuration
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
                                <div className="mx-auto mb-4 p-3 rounded-full bg-purple-100 text-purple-600 w-fit">
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
                                <form
                                    onSubmit={(e) => {
                                        // Extra protection: prevent submission if not on last step
                                        if (currentStep !== steps.length - 1) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            console.warn("Form submission blocked: not on final step");
                                            return false;
                                        }
                                        // Let react-hook-form handle it if we're on the last step
                                        handleSubmit(onSubmit)(e);
                                    }}
                                >
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
                                                watch={watch}
                                                setValue={setValue}
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
                                                disabled={isSubmitting || createAdminMutation.isPending || completeOnboardingMutation.isPending}
                                                className="min-w-32"
                                            >
                                                {isSubmitting || createAdminMutation.isPending || completeOnboardingMutation.isPending ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        {createAdminMutation.isPending ? "Creating Profile..." : "Completing..."}
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
