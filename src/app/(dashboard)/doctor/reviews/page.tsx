'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Stethoscope,
    Clock,
    CheckCircle,
    Brain,
    FileText
} from 'lucide-react';
import { api } from '@/trpc/client';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function DoctorReviewsPage() {
    const [selectedSession, setSelectedSession] = useState<string | null>(null);
    const [doctorNotes, setDoctorNotes] = useState('');
    const [doctorDiagnosis, setDoctorDiagnosis] = useState('');
    const [confidence, setConfidence] = useState(0.8);
    const [recommendedTreatment, setRecommendedTreatment] = useState('');

    // Fetch assigned sessions
    const { data: sessions, isLoading, refetch } = api.doctors.getAssignedSessions.useQuery({
        page: 1,
        limit: 20,
    });

    // Fetch session details
    const { data: sessionDetails } = api.diagnosis.getDiagnosisSession.useQuery(
        { sessionId: selectedSession! },
        { enabled: !!selectedSession }
    );

    // Fetch predictions for the session
    const { data: predictions } = api.diagnosis.getMLPredictions.useQuery(
        { sessionId: selectedSession! },
        { enabled: !!selectedSession }
    );

    // Submit review mutation
    const submitReviewMutation = api.doctors.submitDiagnosisReview.useMutation({
        onSuccess: () => {
            toast.success('Review submitted successfully');
            setSelectedSession(null);
            setDoctorNotes('');
            setDoctorDiagnosis('');
            setRecommendedTreatment('');
            refetch();
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to submit review');
        },
    });

    const handleSubmitReview = () => {
        if (!selectedSession || !doctorDiagnosis.trim()) {
            toast.error('Please provide a diagnosis');
            return;
        }

        submitReviewMutation.mutate({
            diagnosisSessionId: selectedSession,
            doctorDiagnosis: doctorDiagnosis.trim(),
            confidence,
            recommendedTreatment: recommendedTreatment.trim() || undefined,
            notes: doctorNotes.trim() || undefined,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'reviewed': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <DashboardLayout
            title="Patient Reviews"
            description="Review AI diagnoses and provide medical oversight"
        >
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sessions List */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Stethoscope className="h-5 w-5 text-blue-500" />
                                    Assigned Cases
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                        <p className="text-muted-foreground">Loading cases...</p>
                                    </div>
                                ) : sessions?.sessions && sessions.sessions.length > 0 ? (
                                    <div className="space-y-3">
                                        {sessions.sessions.map((session) => (
                                            <div
                                                key={session.id}
                                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedSession === session.id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'hover:border-primary/50'
                                                    }`}
                                                onClick={() => setSelectedSession(session.id)}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-sm">
                                                            {session.chiefComplaint || 'Symptom Analysis'}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {session.additionalInfo}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <Badge className={getStatusColor(session.status)}>
                                                            {session.status}
                                                        </Badge>
                                                        <Badge className={getUrgencyColor(session.urgencyLevel || 'medium')}>
                                                            {session.urgencyLevel || 'medium'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {session.createdAt ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true }) : 'Unknown'}
                                                    </div>
                                                    {session.confidence_score && (
                                                        <div className="flex items-center gap-1">
                                                            <Brain className="h-3 w-3" />
                                                            {(parseFloat(session.confidence_score) * 100).toFixed(1)}% AI confidence
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No cases assigned yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Review Interface */}
                    <div className="space-y-4">
                        {selectedSession && sessionDetails ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-green-500" />
                                        Case Review
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Patient Information */}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold">Patient Information</h4>
                                        <div className="bg-muted/50 p-3 rounded-lg space-y-2 text-sm">
                                            <p><strong>Chief Complaint:</strong> {sessionDetails.chiefComplaint}</p>
                                            <p><strong>Additional Info:</strong> {sessionDetails.additionalInfo}</p>
                                            <p><strong>Urgency:</strong>
                                                <Badge className={`ml-2 ${getUrgencyColor(sessionDetails.urgencyLevel || 'medium')}`}>
                                                    {sessionDetails.urgencyLevel || 'medium'}
                                                </Badge>
                                            </p>
                                        </div>
                                    </div>

                                    {/* AI Predictions */}
                                    {predictions && predictions.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="font-semibold">AI Predictions</h4>
                                            <div className="space-y-2">
                                                {predictions.slice(0, 3).map((prediction) => (
                                                    <div key={prediction.id} className="p-3 border rounded-lg">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h5 className="font-medium">{prediction.disease.name}</h5>
                                                            <Badge variant="outline">
                                                                {(parseFloat(prediction.confidence) * 100).toFixed(1)}%
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {prediction.disease.description}
                                                        </p>
                                                        {prediction.reasoning && prediction.reasoning.length > 0 && (
                                                            <div className="mt-2">
                                                                <p className="text-xs font-medium text-muted-foreground mb-1">AI Reasoning:</p>
                                                                <ul className="text-xs space-y-1">
                                                                    {prediction.reasoning.map((reason, idx) => (
                                                                        <li key={idx} className="flex items-start gap-1">
                                                                            <span className="text-primary">•</span>
                                                                            {reason}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <Separator />

                                    {/* Doctor Review Form */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold">Your Medical Review</h4>

                                        <div className="space-y-2">
                                            <Label htmlFor="doctorDiagnosis">Final Diagnosis *</Label>
                                            <Input
                                                id="doctorDiagnosis"
                                                placeholder="Enter your diagnosis..."
                                                value={doctorDiagnosis}
                                                onChange={(e) => setDoctorDiagnosis(e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confidence">Confidence Level: {(confidence * 100).toFixed(0)}%</Label>
                                            <input
                                                type="range"
                                                id="confidence"
                                                min="0.1"
                                                max="1"
                                                step="0.1"
                                                value={confidence}
                                                onChange={(e) => setConfidence(parseFloat(e.target.value))}
                                                className="w-full"
                                                aria-label="Confidence level slider"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="recommendedTreatment">Recommended Treatment</Label>
                                            <Input
                                                id="recommendedTreatment"
                                                placeholder="Enter treatment recommendations..."
                                                value={recommendedTreatment}
                                                onChange={(e) => setRecommendedTreatment(e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="doctorNotes">Clinical Notes</Label>
                                            <Textarea
                                                id="doctorNotes"
                                                placeholder="Add any additional clinical observations..."
                                                rows={3}
                                                value={doctorNotes}
                                                onChange={(e) => setDoctorNotes(e.target.value)}
                                            />
                                        </div>

                                        <div className="flex gap-2 pt-4">
                                            <Button
                                                onClick={handleSubmitReview}
                                                disabled={submitReviewMutation.isPending || !doctorDiagnosis.trim()}
                                                className="flex-1"
                                            >
                                                {submitReviewMutation.isPending ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Submit Review
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setSelectedSession(null)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Select a Case to Review</h3>
                                    <p className="text-muted-foreground">
                                        Choose a case from the list to begin your medical review
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
