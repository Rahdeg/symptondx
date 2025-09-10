'use client';

import React, { useState } from 'react';
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Brain,
    Settings,
    TrendingUp,
    Zap,
    Database,
    AlertTriangle,
    CheckCircle,
    Pause,
    RotateCcw
} from "lucide-react";

export default function AdminAIModelsPage() {
    const [selectedModel, setSelectedModel] = useState<typeof aiModels[0] | null>(null);
    const [actionDialog, setActionDialog] = useState<string | null>(null);

    // Mock AI model data (in real implementation, this would come from the database)
    const aiModels = [
        {
            id: '1',
            name: 'GPT-4 Diagnosis',
            version: 'v1.2.0',
            status: 'active',
            accuracy: 94.2,
            precision: 92.8,
            recall: 96.1,
            f1Score: 94.4,
            totalPredictions: 15420,
            successRate: 98.7,
            avgResponseTime: 2.8,
            lastUpdated: new Date('2024-01-15'),
            description: 'Primary AI model for medical diagnosis',
            apiCost: 156.78
        },
        {
            id: '2',
            name: 'Symptom Classifier',
            version: 'v2.1.0',
            status: 'active',
            accuracy: 89.5,
            precision: 87.2,
            recall: 91.8,
            f1Score: 89.4,
            totalPredictions: 8920,
            successRate: 97.3,
            avgResponseTime: 1.2,
            lastUpdated: new Date('2024-01-12'),
            description: 'Specialized model for symptom categorization',
            apiCost: 89.45
        },
        {
            id: '3',
            name: 'Risk Assessment',
            version: 'v1.0.0',
            status: 'testing',
            accuracy: 91.7,
            precision: 90.1,
            recall: 93.2,
            f1Score: 91.6,
            totalPredictions: 450,
            successRate: 99.1,
            avgResponseTime: 3.5,
            lastUpdated: new Date('2024-01-10'),
            description: 'Beta model for patient risk assessment',
            apiCost: 12.34
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'testing':
                return 'bg-yellow-100 text-yellow-800';
            case 'inactive':
                return 'bg-red-100 text-red-800';
            case 'training':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="h-4 w-4" />;
            case 'testing':
                return <AlertTriangle className="h-4 w-4" />;
            case 'inactive':
                return <Pause className="h-4 w-4" />;
            case 'training':
                return <RotateCcw className="h-4 w-4" />;
            default:
                return <Brain className="h-4 w-4" />;
        }
    };

    const totalCost = aiModels.reduce((sum, model) => sum + model.apiCost, 0);
    const totalPredictions = aiModels.reduce((sum, model) => sum + model.totalPredictions, 0);
    const avgAccuracy = aiModels.reduce((sum, model) => sum + model.accuracy, 0) / aiModels.length;

    return (
        <DashboardLayout
            title="Admin - AI Models Management"
            description="Monitor and manage AI models, performance metrics, and configurations"
        >
            <div className="space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
                            <Brain className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {aiModels.filter(m => m.status === 'active').length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {aiModels.length} total models
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{avgAccuracy.toFixed(1)}%</div>
                            <p className="text-xs text-muted-foreground">
                                Across all models
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
                            <Zap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalPredictions.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                This month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">API Costs</CardTitle>
                            <Database className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">
                                This month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Models Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5" />
                            AI Models
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Model</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Accuracy</TableHead>
                                        <TableHead>Predictions</TableHead>
                                        <TableHead>Response Time</TableHead>
                                        <TableHead>Cost</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {aiModels.map((model) => (
                                        <TableRow key={model.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{model.name}</div>
                                                    <div className="text-sm text-gray-500">{model.version}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(model.status)}>
                                                    <span className="flex items-center gap-1">
                                                        {getStatusIcon(model.status)}
                                                        {model.status}
                                                    </span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{model.accuracy}%</div>
                                                    <div className="text-sm text-gray-500">F1: {model.f1Score}%</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{model.totalPredictions.toLocaleString()}</div>
                                                    <div className="text-sm text-gray-500">{model.successRate}% success</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{model.avgResponseTime}s</TableCell>
                                            <TableCell>${model.apiCost.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setSelectedModel(model)}
                                                    >
                                                        <Settings className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedModel(model);
                                                            setActionDialog('restart');
                                                        }}
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Model Performance Details */}
                {selectedModel && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Model Performance - {selectedModel.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Accuracy</label>
                                    <div className="text-2xl font-bold">{selectedModel.accuracy}%</div>
                                    <Progress value={selectedModel.accuracy} className="mt-2" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Precision</label>
                                    <div className="text-2xl font-bold">{selectedModel.precision}%</div>
                                    <Progress value={selectedModel.precision} className="mt-2" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Recall</label>
                                    <div className="text-2xl font-bold">{selectedModel.recall}%</div>
                                    <Progress value={selectedModel.recall} className="mt-2" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">F1 Score</label>
                                    <div className="text-2xl font-bold">{selectedModel.f1Score}%</div>
                                    <Progress value={selectedModel.f1Score} className="mt-2" />
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">{selectedModel.description}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Last updated: {selectedModel.lastUpdated.toLocaleDateString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* System Alerts */}
                <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                        Model &quot;Risk Assessment&quot; is currently in testing phase. Performance metrics may fluctuate.
                    </AlertDescription>
                </Alert>
            </div>

            {/* Action Confirmation Dialog */}
            <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Action</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to restart the model &quot;{selectedModel?.name}&quot;?</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionDialog(null)}>
                            Cancel
                        </Button>
                        <Button onClick={() => setActionDialog(null)}>
                            Confirm Restart
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
