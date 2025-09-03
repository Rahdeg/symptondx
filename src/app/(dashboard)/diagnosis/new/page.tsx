'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Brain,
    Plus,
    X,
    AlertTriangle,
    Clock,
    User,
    ArrowRight,
    CheckCircle
} from 'lucide-react';
import { api } from '@/trpc/client';
import { toast } from 'sonner';

// Form validation schema
const symptomAnalysisSchema = z.object({
    symptoms: z.array(z.string()).min(1, 'At least one symptom is required'),
    age: z.number().min(1, 'Age is required').max(120, 'Please enter a valid age'),
    gender: z.enum(['male', 'female', 'other']),
    duration: z.string().min(1, 'Duration is required'),
    severity: z.enum(['mild', 'moderate', 'severe']),
    additionalNotes: z.string().optional(),
    predictionMethod: z.enum(['ai', 'ml']),
});

type SymptomAnalysisForm = z.infer<typeof symptomAnalysisSchema>;

// Common symptoms for quick selection
const commonSymptoms = [
    'Fever', 'Headache', 'Cough', 'Fatigue', 'Nausea', 'Vomiting',
    'Diarrhea', 'Chest pain', 'Shortness of breath', 'Dizziness',
    'Muscle aches', 'Joint pain', 'Rash', 'Sore throat', 'Runny nose',
    'Congestion', 'Loss of appetite', 'Weight loss', 'Insomnia',
    'Anxiety', 'Depression', 'Memory problems', 'Vision changes',
    'Hearing problems', 'Abdominal pain', 'Back pain', 'Neck pain'
];

const severityLevels = [
    { value: 'mild', label: 'Mild', description: 'Minimal impact on daily activities', color: 'bg-green-100 text-green-800' },
    { value: 'moderate', label: 'Moderate', description: 'Noticeable impact on daily activities', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'severe', label: 'Severe', description: 'Significant impact on daily activities', color: 'bg-red-100 text-red-800' },
];

export default function NewDiagnosisPage() {
    const router = useRouter();
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [customSymptom, setCustomSymptom] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<SymptomAnalysisForm>({
        resolver: zodResolver(symptomAnalysisSchema),
        defaultValues: {
            symptoms: [],
            age: undefined,
            gender: undefined,
            duration: '',
            severity: undefined,
            additionalNotes: '',
            predictionMethod: 'ml',
        },
    });

    const startDiagnosisMutation = api.diagnosis.startDiagnosis.useMutation({
        onSuccess: (data: { sessionId: string }) => {
            toast.success('Diagnosis analysis completed successfully!');
            router.push(`/diagnosis/results/${data.sessionId}`);
        },
        onError: (error: { message?: string }) => {
            toast.error(error.message || 'Failed to start diagnosis');
        },
        onSettled: () => {
            setIsSubmitting(false);
        },
    });

    const addSymptom = (symptom: string) => {
        if (!selectedSymptoms.includes(symptom)) {
            const newSymptoms = [...selectedSymptoms, symptom];
            setSelectedSymptoms(newSymptoms);
            setValue('symptoms', newSymptoms);
        }
    };

    const removeSymptom = (symptom: string) => {
        const newSymptoms = selectedSymptoms.filter(s => s !== symptom);
        setSelectedSymptoms(newSymptoms);
        setValue('symptoms', newSymptoms);
    };

    const addCustomSymptom = () => {
        if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
            addSymptom(customSymptom.trim());
            setCustomSymptom('');
        }
    };

    const onSubmit = async (data: SymptomAnalysisForm) => {
        setIsSubmitting(true);
        startDiagnosisMutation.mutate({
            symptoms: data.symptoms,
            age: data.age,
            gender: data.gender,
            duration: data.duration,
            severity: data.severity,
            additionalNotes: data.additionalNotes,
            predictionMethod: data.predictionMethod,
        });
    };

    const nextStep = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const progress = (currentStep / 3) * 100;

    return (
        <DashboardLayout
            title="Symptom Analysis"
            description="Get AI-powered health insights from your symptoms"
        >
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Progress Bar */}
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">Analysis Progress</h2>
                                <span className="text-sm text-muted-foreground">Step {currentStep} of 3</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Symptoms</span>
                                <span>Details</span>
                                <span>Review</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Step 1: Symptoms Selection */}
                    {currentStep === 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-blue-500" />
                                    Select Your Symptoms
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Selected Symptoms */}
                                {selectedSymptoms.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Selected Symptoms ({selectedSymptoms.length})</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSymptoms.map((symptom) => (
                                                <Badge
                                                    key={symptom}
                                                    variant="secondary"
                                                    className="flex items-center gap-1 pr-1"
                                                >
                                                    {symptom}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-4 w-4 p-0 hover:bg-transparent"
                                                        onClick={() => removeSymptom(symptom)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Common Symptoms */}
                                <div className="space-y-2">
                                    <Label>Common Symptoms</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {commonSymptoms.map((symptom) => (
                                            <Button
                                                key={symptom}
                                                type="button"
                                                variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                                                size="sm"
                                                className="justify-start"
                                                onClick={() => addSymptom(symptom)}
                                            >
                                                {symptom}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Symptom */}
                                <div className="space-y-2">
                                    <Label>Add Custom Symptom</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Enter a symptom..."
                                            value={customSymptom}
                                            onChange={(e) => setCustomSymptom(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSymptom())}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addCustomSymptom}
                                            disabled={!customSymptom.trim()}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {errors.symptoms && (
                                    <p className="text-sm text-red-600">{errors.symptoms.message}</p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2: Additional Details */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-green-500" />
                                        Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="age">Age *</Label>
                                            <Input
                                                id="age"
                                                type="number"
                                                placeholder="Enter your age"
                                                {...register('age', { valueAsNumber: true })}
                                            />
                                            {errors.age && (
                                                <p className="text-sm text-red-600">{errors.age.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Gender *</Label>
                                            <div className="flex gap-2">
                                                {['male', 'female', 'other'].map((gender) => (
                                                    <Button
                                                        key={gender}
                                                        type="button"
                                                        variant={watch('gender') === gender ? "default" : "outline"}
                                                        size="sm"
                                                        className="capitalize"
                                                        onClick={() => setValue('gender', gender as 'male' | 'female' | 'other')}
                                                    >
                                                        {gender}
                                                    </Button>
                                                ))}
                                            </div>
                                            {errors.gender && (
                                                <p className="text-sm text-red-600">{errors.gender.message}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-orange-500" />
                                        Symptom Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Duration *</Label>
                                        <Input
                                            id="duration"
                                            placeholder="e.g., 2 days, 1 week, 3 months"
                                            {...register('duration')}
                                        />
                                        {errors.duration && (
                                            <p className="text-sm text-red-600">{errors.duration.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Severity Level *</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {severityLevels.map((level) => (
                                                <Button
                                                    key={level.value}
                                                    type="button"
                                                    variant={watch('severity') === level.value ? "default" : "outline"}
                                                    className="h-auto p-4 flex flex-col items-start space-y-2"
                                                    onClick={() => setValue('severity', level.value as 'mild' | 'moderate' | 'severe')}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={level.color}>
                                                            {level.label}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-left">{level.description}</p>
                                                </Button>
                                            ))}
                                        </div>
                                        {errors.severity && (
                                            <p className="text-sm text-red-600">{errors.severity.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                                        <Textarea
                                            id="additionalNotes"
                                            placeholder="Any additional information about your symptoms..."
                                            rows={3}
                                            {...register('additionalNotes')}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Analysis Method</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <Button
                                                type="button"
                                                variant={watch('predictionMethod') === 'ml' ? "default" : "outline"}
                                                className="h-auto p-4 flex flex-col items-start space-y-2"
                                                onClick={() => setValue('predictionMethod', 'ml')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-blue-100 text-blue-800">
                                                        ML Engine
                                                    </Badge>
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-medium">Machine Learning</p>
                                                    <p className="text-sm text-muted-foreground">Fast, rule-based analysis using symptom patterns</p>
                                                </div>
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={watch('predictionMethod') === 'ai' ? "default" : "outline"}
                                                className="h-auto p-4 flex flex-col items-start space-y-2"
                                                onClick={() => setValue('predictionMethod', 'ai')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-purple-100 text-purple-800">
                                                        AI Powered
                                                    </Badge>
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-medium">OpenAI GPT-4</p>
                                                    <p className="text-sm text-muted-foreground">Advanced AI analysis with natural language understanding</p>
                                                </div>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Step 3: Review and Submit */}
                    {currentStep === 3 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    Review Your Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-semibold mb-2">Symptoms</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedSymptoms.map((symptom) => (
                                                    <Badge key={symptom} variant="secondary">
                                                        {symptom}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-2">Personal Information</h3>
                                            <p><strong>Age:</strong> {watch('age')} years</p>
                                            <p><strong>Gender:</strong> {watch('gender')}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-semibold mb-2">Symptom Details</h3>
                                            <p><strong>Duration:</strong> {watch('duration')}</p>
                                            <p><strong>Severity:</strong> {watch('severity')}</p>
                                            <p><strong>Analysis Method:</strong>
                                                <Badge className={`ml-2 ${watch('predictionMethod') === 'ai' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {watch('predictionMethod') === 'ai' ? 'AI Powered (GPT-4)' : 'ML Engine'}
                                                </Badge>
                                            </p>
                                        </div>
                                        {watch('additionalNotes') && (
                                            <div>
                                                <h3 className="font-semibold mb-2">Additional Notes</h3>
                                                <p className="text-sm text-muted-foreground">{watch('additionalNotes')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-blue-900">Important Notice</h4>
                                            <p className="text-sm text-blue-800 mt-1">
                                                This AI analysis is for informational purposes only and should not replace professional medical advice.
                                                Always consult with a healthcare provider for proper diagnosis and treatment.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                        >
                            Previous
                        </Button>

                        {currentStep < 3 ? (
                            <Button
                                type="button"
                                onClick={nextStep}
                                disabled={
                                    (currentStep === 1 && selectedSymptoms.length === 0) ||
                                    (currentStep === 2 && (!watch('age') || !watch('gender') || !watch('duration') || !watch('severity')))
                                }
                            >
                                Next
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-primary hover:bg-primary/90"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Brain className="mr-2 h-4 w-4" />
                                        {watch('predictionMethod') === 'ai' ? 'Start AI Analysis' : 'Start ML Analysis'}
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
