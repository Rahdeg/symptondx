'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Brain,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp,
    ArrowLeft,
    Share,
    Stethoscope,
    FileText,
    Calendar
} from 'lucide-react';
import { api } from '@/trpc/client';
import { toast } from 'sonner';
import { PDFExportService, type DiagnosisData } from '@/lib/pdf-export-service';

export default function DiagnosisResultsPage() {
    const params = useParams();
    const router = useRouter();
    const sessionId = params.sessionId as string;

    // Fetch diagnosis session data
    const { data: session, isLoading: sessionLoading } = api.diagnosis.getDiagnosisSession.useQuery(
        { sessionId },
        { enabled: !!sessionId }
    );

    // Fetch ML predictions
    const { data: predictions, isLoading: predictionsLoading } = api.diagnosis.getMLPredictions.useQuery(
        { sessionId },
        { enabled: !!sessionId }
    );

    // Fetch doctor review
    const { data: doctorReview, isLoading: doctorReviewLoading } = api.diagnosis.getDoctorReview.useQuery(
        { sessionId },
        { enabled: !!sessionId }
    );

    const isLoading = sessionLoading || predictionsLoading || doctorReviewLoading;

    if (isLoading) {
        return (
            <DashboardLayout
                title="Analyzing Symptoms"
                description="Our AI is processing your symptoms..."
            >
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardContent className="p-12 text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
                            <h2 className="text-2xl font-semibold mb-2">AI Analysis in Progress</h2>
                            <p className="text-muted-foreground">
                                Our advanced machine learning models are analyzing your symptoms and generating predictions...
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    if (!session || !predictions) {
        return (
            <DashboardLayout
                title="Analysis Not Found"
                description="The requested analysis could not be found"
            >
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardContent className="p-12 text-center">
                            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                            <h2 className="text-2xl font-semibold mb-2">Analysis Not Found</h2>
                            <p className="text-muted-foreground mb-6">
                                The diagnosis session you&apos;re looking for could not be found or may have expired.
                            </p>
                            <Button onClick={() => router.push('/diagnosis/new')}>
                                Start New Analysis
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    const topPrediction = predictions[0];
    const confidence = parseFloat(topPrediction?.confidence || '0') * 100;

    const getConfidenceColor = (conf: number) => {
        if (conf >= 80) return 'text-green-600 bg-green-100';
        if (conf >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'mild': return 'text-green-600 bg-green-100';
            case 'moderate': return 'text-yellow-600 bg-yellow-100';
            case 'severe': return 'text-red-600 bg-red-100';
            case 'critical': return 'text-red-800 bg-red-200';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };

    const handleExportPDF = async () => {
        if (!session || !predictions) {
            toast.error('Unable to export: Missing diagnosis data');
            return;
        }

        try {
            const diagnosisData: DiagnosisData = {
                session: {
                    id: session.id,
                    chiefComplaint: session.chiefComplaint || '',
                    additionalInfo: session.additionalInfo || '',
                    status: session.status,
                    urgencyLevel: session.urgencyLevel || '',
                    createdAt: session.createdAt || new Date()
                },
                predictions: predictions.map(pred => ({
                    disease: {
                        name: pred.disease.name,
                        description: pred.disease.description || '',
                        severityLevel: pred.disease.severityLevel,
                        icdCode: pred.disease.icdCode || undefined
                    },
                    confidence: pred.confidence,
                    reasoning: pred.reasoning || undefined,
                    riskFactors: pred.riskFactors || undefined,
                    recommendations: pred.recommendations || undefined
                })),
                doctorReview: doctorReview ? {
                    finalDiagnosis: doctorReview.finalDiagnosis,
                    doctorName: doctorReview.doctorName || undefined,
                    doctorSpecialization: doctorReview.doctorSpecialization || undefined,
                    confidence: doctorReview.confidence || undefined,
                    notes: doctorReview.notes || undefined,
                    recommendedActions: doctorReview.recommendedActions || undefined
                } : undefined
            };

            await PDFExportService.downloadDiagnosisPDF(diagnosisData);
            toast.success('PDF report downloaded successfully');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF report');
        }
    };

    return (
        <DashboardLayout
            title="Diagnosis Results"
            description="AI-powered analysis of your symptoms"
        >
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/diagnosis/new')}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        New Analysis
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleExportPDF}>
                            <Share className="mr-2 h-4 w-4" />
                            Share
                        </Button>
                    </div>
                </div>

                {/* Analysis Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-blue-500" />
                            Analysis Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-primary mb-2">
                                    {confidence.toFixed(1)}%
                                </div>
                                <p className="text-sm text-muted-foreground">AI Confidence</p>
                                <Progress value={confidence} className="mt-2" />
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600 mb-2">
                                    {predictions.length}
                                </div>
                                <p className="text-sm text-muted-foreground">Possible Conditions</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600 mb-2">
                                    {session.urgencyLevel}
                                </div>
                                <p className="text-sm text-muted-foreground">Urgency Level</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600 mb-2">
                                    {predictions[0]?.modelVersion?.includes('gpt-3.5-turbo') ? 'AI' : 'ML'}
                                </div>
                                <p className="text-sm text-muted-foreground">Analysis Method</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Top Prediction */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                    Most Likely Condition
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {topPrediction && (
                                    <>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-xl font-semibold mb-2">
                                                    {topPrediction.disease.name}
                                                </h3>
                                                <div className="flex gap-2 mb-3">
                                                    <Badge className={getConfidenceColor(confidence)}>
                                                        {confidence.toFixed(1)}% Confidence
                                                    </Badge>
                                                    <Badge className={getSeverityColor(topPrediction.disease.severityLevel)}>
                                                        {topPrediction.disease.severityLevel}
                                                    </Badge>
                                                    {topPrediction.disease.icdCode && (
                                                        <Badge variant="outline">
                                                            {topPrediction.disease.icdCode}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <h4 className="font-semibold mb-2">Description</h4>
                                                <p className="text-muted-foreground">
                                                    {topPrediction.disease.description || 'No description available.'}
                                                </p>
                                            </div>

                                            {topPrediction.reasoning && topPrediction.reasoning.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold mb-2">AI Reasoning</h4>
                                                    <ul className="space-y-1">
                                                        {topPrediction.reasoning.map((reason, index) => (
                                                            <li key={index} className="flex items-start gap-2 text-sm">
                                                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                                {reason}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {topPrediction.riskFactors && topPrediction.riskFactors.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold mb-2">Risk Factors</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {topPrediction.riskFactors.map((factor, index) => (
                                                            <Badge key={index} variant="outline">
                                                                {factor}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Other Predictions */}
                        {predictions.length > 1 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Other Possible Conditions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {predictions.slice(1, 4).map((prediction) => {
                                            const predConfidence = parseFloat(prediction.confidence) * 100;
                                            return (
                                                <div
                                                    key={prediction.id}
                                                    className="flex items-center justify-between p-3 border rounded-lg"
                                                >
                                                    <div>
                                                        <h4 className="font-medium">{prediction.disease.name}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {prediction.disease.severityLevel}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={getConfidenceColor(predConfidence)}>
                                                            {predConfidence.toFixed(1)}%
                                                        </Badge>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Recommendations */}
                        {topPrediction?.recommendations && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Stethoscope className="h-5 w-5 text-blue-500" />
                                        Recommendations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {topPrediction.recommendations.map((recommendation, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm">
                                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                {recommendation}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Session Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-gray-500" />
                                    Session Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>Created: {session.createdAt ? formatDate(session.createdAt) : 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>Status: {session.status}</span>
                                </div>
                                {doctorReview ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-green-600">
                                            <CheckCircle className="h-4 w-4" />
                                            <span>Doctor reviewed</span>
                                        </div>
                                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Stethoscope className="h-4 w-4 text-green-600" />
                                                <span className="font-semibold text-green-900">Doctor&apos;s Diagnosis</span>
                                            </div>
                                            <p className="text-sm text-green-800 font-medium mb-1">
                                                {doctorReview.finalDiagnosis}
                                            </p>
                                            {doctorReview.doctorName && (
                                                <p className="text-xs text-green-700">
                                                    Reviewed by Dr. {doctorReview.doctorName}
                                                    {doctorReview.doctorSpecialization && ` (${doctorReview.doctorSpecialization})`}
                                                </p>
                                            )}
                                            {doctorReview.confidence && (
                                                <div className="mt-2">
                                                    <div className="flex items-center justify-between text-xs text-green-700 mb-1">
                                                        <span>Confidence</span>
                                                        <span>{doctorReview.confidence}/10</span>
                                                    </div>
                                                    <Progress value={(doctorReview.confidence / 10) * 100} className="h-1" />
                                                </div>
                                            )}
                                        </div>
                                        {doctorReview.notes && (
                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <h4 className="font-semibold text-blue-900 mb-1 text-sm">Doctor&apos;s Notes</h4>
                                                <p className="text-sm text-blue-800">{doctorReview.notes}</p>
                                            </div>
                                        )}
                                        {doctorReview.recommendedActions && doctorReview.recommendedActions.length > 0 && (
                                            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                                <h4 className="font-semibold text-purple-900 mb-2 text-sm">Recommended Actions</h4>
                                                <ul className="space-y-1">
                                                    {doctorReview.recommendedActions.map((action, index) => (
                                                        <li key={index} className="flex items-start gap-2 text-sm text-purple-800">
                                                            <CheckCircle className="h-3 w-3 text-purple-600 mt-1 flex-shrink-0" />
                                                            {action}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ) : session.requiresDoctorReview ? (
                                    <div className="flex items-center gap-2 text-sm text-orange-600">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span>Doctor review recommended</span>
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>

                        {/* Important Notice */}
                        <Card className="border-orange-200 bg-orange-50">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-orange-900 mb-1">Important Notice</h4>
                                        <p className="text-sm text-orange-800">
                                            This AI analysis is for informational purposes only. Always consult with a healthcare provider for proper diagnosis and treatment.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
