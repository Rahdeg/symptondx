"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Heart,
    Shield,
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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ProgressCardComponent } from "@/components/ui/enhanced-cards";
import { toast } from "sonner";
import { api } from "@/trpc/client";

// Patient onboarding schema
const patientOnboardingSchema = z.object({
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    address: z.string().min(5, "Address is required"),
    emergencyContact: z.string().min(2, "Emergency contact name is required"),
    emergencyPhone: z.string().min(10, "Emergency phone number is required"),
    medicalHistory: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    currentMedications: z.array(z.string()).optional(),
});

type PatientOnboardingData = z.infer<typeof patientOnboardingSchema>;

interface StepProps {
    register: UseFormRegister<PatientOnboardingData>;
    errors: FieldErrors<PatientOnboardingData>;
    watch: UseFormWatch<PatientOnboardingData>;
    setValue: UseFormSetValue<PatientOnboardingData>;
}// Step components
const PersonalInfoStep: React.FC<StepProps> = ({ register, errors, setValue, watch }) => {
    const currentGender = watch("gender");

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                        id="dateOfBirth"
                        type="date"
                        {...register("dateOfBirth")}
                        className={errors.dateOfBirth ? "border-red-500" : ""}
                    />
                    {errors.dateOfBirth && (
                        <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
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

            <div className="space-y-2">
                <Label>Gender</Label>
                <RadioGroup
                    value={currentGender}
                    onValueChange={(value) => setValue("gender", value as "male" | "female" | "other" | "prefer_not_to_say")}
                    className="flex flex-wrap gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="prefer_not_to_say" id="prefer_not_to_say" />
                        <Label htmlFor="prefer_not_to_say">Prefer not to say</Label>
                    </div>
                </RadioGroup>
                {errors.gender && (
                    <p className="text-sm text-red-500">{errors.gender.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                    id="address"
                    placeholder="Enter your full address"
                    {...register("address")}
                    className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && (
                    <p className="text-sm text-red-500">{errors.address.message}</p>
                )}
            </div>
        </div>
    );
};

const EmergencyContactStep: React.FC<StepProps> = ({ register, errors }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                <Input
                    id="emergencyContact"
                    placeholder="Full name"
                    {...register("emergencyContact")}
                    className={errors.emergencyContact ? "border-red-500" : ""}
                />
                {errors.emergencyContact && (
                    <p className="text-sm text-red-500">{errors.emergencyContact.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                <Input
                    id="emergencyPhone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    {...register("emergencyPhone")}
                    className={errors.emergencyPhone ? "border-red-500" : ""}
                />
                {errors.emergencyPhone && (
                    <p className="text-sm text-red-500">{errors.emergencyPhone.message}</p>
                )}
            </div>
        </div>
    </div>
);

const MedicalHistoryStep: React.FC<StepProps> = ({ setValue, watch }) => {
    const [customAllergy, setCustomAllergy] = useState("");
    const [customMedication, setCustomMedication] = useState("");
    const [customCondition, setCustomCondition] = useState("");

    const currentAllergies = watch("allergies") || [];
    const currentMedications = watch("currentMedications") || [];
    const currentConditions = watch("medicalHistory") || [];

    const commonAllergies = ["Penicillin", "Peanuts", "Shellfish", "Latex", "Dairy", "Eggs"];
    const commonConditions = ["Diabetes", "Hypertension", "Asthma", "Heart Disease", "Arthritis"];

    const addAllergy = (allergy: string) => {
        if (allergy.trim() && !currentAllergies.includes(allergy.trim())) {
            setValue("allergies", [...currentAllergies, allergy.trim()]);
        }
    };

    const addMedication = (medication: string) => {
        if (medication.trim() && !currentMedications.includes(medication.trim())) {
            setValue("currentMedications", [...currentMedications, medication.trim()]);
        }
    };

    const addCondition = (condition: string) => {
        if (condition.trim() && !currentConditions.includes(condition.trim())) {
            setValue("medicalHistory", [...currentConditions, condition.trim()]);
        }
    };

    const removeCondition = (condition: string) => {
        setValue("medicalHistory", currentConditions.filter(i => i !== condition));
    };

    const removeAllergy = (allergy: string) => {
        setValue("allergies", currentAllergies.filter(i => i !== allergy));
    };

    const removeMedication = (medication: string) => {
        setValue("currentMedications", currentMedications.filter(i => i !== medication));
    };

    const handleAddCondition = () => {
        if (customCondition.trim()) {
            addCondition(customCondition);
            setCustomCondition("");
        }
    };

    const handleAddAllergy = () => {
        if (customAllergy.trim()) {
            addAllergy(customAllergy);
            setCustomAllergy("");
        }
    };

    const handleAddMedication = () => {
        if (customMedication.trim()) {
            addMedication(customMedication);
            setCustomMedication("");
        }
    };

    return (
        <div className="space-y-6">
            {/* Medical Conditions */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Medical Conditions</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {commonConditions.map((condition) => (
                        <Button
                            key={condition}
                            type="button"
                            variant={currentConditions.includes(condition) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                                if (currentConditions.includes(condition)) {
                                    removeCondition(condition);
                                } else {
                                    addCondition(condition);
                                }
                            }}
                            className="justify-start"
                        >
                            {currentConditions.includes(condition) && <Check className="h-3 w-3 mr-1" />}
                            {condition}
                        </Button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="Add custom condition"
                        value={customCondition}
                        onChange={(e) => setCustomCondition(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCondition();
                            }
                        }}
                    />
                    <Button
                        type="button"
                        onClick={handleAddCondition}
                        disabled={!customCondition.trim()}
                    >
                        Add
                    </Button>
                </div>
                {currentConditions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {currentConditions.map((condition: string) => (
                            <span
                                key={condition}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                            >
                                {condition}
                                <button
                                    type="button"
                                    onClick={() => removeCondition(condition)}
                                    className="ml-1 text-blue-600 hover:text-blue-800"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Allergies */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Allergies</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {commonAllergies.map((allergy) => (
                        <Button
                            key={allergy}
                            type="button"
                            variant={currentAllergies.includes(allergy) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                                if (currentAllergies.includes(allergy)) {
                                    removeAllergy(allergy);
                                } else {
                                    addAllergy(allergy);
                                }
                            }}
                            className="justify-start"
                        >
                            {currentAllergies.includes(allergy) && <Check className="h-3 w-3 mr-1" />}
                            {allergy}
                        </Button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="Add custom allergy"
                        value={customAllergy}
                        onChange={(e) => setCustomAllergy(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddAllergy();
                            }
                        }}
                    />
                    <Button
                        type="button"
                        onClick={handleAddAllergy}
                        disabled={!customAllergy.trim()}
                    >
                        Add
                    </Button>
                </div>
                {currentAllergies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {currentAllergies.map((allergy: string) => (
                            <span
                                key={allergy}
                                className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm flex items-center"
                            >
                                {allergy}
                                <button
                                    type="button"
                                    onClick={() => removeAllergy(allergy)}
                                    className="ml-1 text-red-600 hover:text-red-800"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Current Medications */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Current Medications</Label>
                <div className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="Enter medication name and dosage"
                        value={customMedication}
                        onChange={(e) => setCustomMedication(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddMedication();
                            }
                        }}
                    />
                    <Button
                        type="button"
                        onClick={handleAddMedication}
                        disabled={!customMedication.trim()}
                    >
                        Add
                    </Button>
                </div>
                {currentMedications.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {currentMedications.map((medication: string) => (
                            <span
                                key={medication}
                                className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center"
                            >
                                {medication}
                                <button
                                    type="button"
                                    onClick={() => removeMedication(medication)}
                                    className="ml-1 text-green-600 hover:text-green-800"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export function PatientOnboarding() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // tRPC mutation for creating patient
    const createPatientMutation = api.patients.createPatient.useMutation({
        onSuccess: (data) => {
            console.log("Patient created successfully:", data);
            toast.success("Profile created successfully!");
            router.push("/dashboard/patient");
        },
        onError: (error) => {
            console.error("Error creating patient:", error);
            toast.error("Failed to create profile. Please try again.");
        },
    });

    const steps = [
        {
            title: "Personal Information",
            description: "Basic information about you",
            icon: <User className="h-6 w-6" />,
            component: PersonalInfoStep,
        },
        {
            title: "Emergency Contact",
            description: "Someone we can contact in case of emergency",
            icon: <Shield className="h-6 w-6" />,
            component: EmergencyContactStep,
        },
        {
            title: "Medical Information",
            description: "Help us understand your medical background",
            icon: <Heart className="h-6 w-6" />,
            component: MedicalHistoryStep,
        },
    ];

    const form = useForm<PatientOnboardingData>({
        resolver: zodResolver(patientOnboardingSchema),
        defaultValues: {
            allergies: [],
            currentMedications: [],
            medicalHistory: [],
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
            if (!currentValues.dateOfBirth) missingFields.push("Date of Birth");
            if (!currentValues.phoneNumber) missingFields.push("Phone Number");
            if (!currentValues.address) missingFields.push("Address");
            if (!currentValues.gender) missingFields.push("Gender");
        } else if (currentStep === 1) {
            if (!currentValues.emergencyContact) missingFields.push("Emergency Contact Name");
            if (!currentValues.emergencyPhone) missingFields.push("Emergency Contact Phone");
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

    const onSubmit = async (data: PatientOnboardingData) => {
        if (currentStep !== steps.length - 1) {
            return;
        }

        if (!data.dateOfBirth || !data.phoneNumber || !data.address || !data.gender || !data.emergencyContact || !data.emergencyPhone) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        createPatientMutation.mutate(data, {
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
                            Patient Profile Setup
                        </h1>
                        <p className="text-muted-foreground">
                            Help us personalize your healthcare experience
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
                                <div>
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
                                                type="button"
                                                onClick={handleSubmit(onSubmit)}
                                                disabled={isSubmitting || createPatientMutation.isPending}
                                                className="min-w-32"
                                            >
                                                {isSubmitting || createPatientMutation.isPending ? (
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
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
