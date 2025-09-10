'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { api } from '@/trpc/client';

interface AdminAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const authenticateAdmin = api.admin.authenticateAdmin.useMutation({
        onSuccess: () => {
            setError('');
            setPassword('');
            onSuccess();
            onClose();
        },
        onError: (error) => {
            setError(error.message);
            setPassword('');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!password.trim()) {
            setError('Password is required');
            return;
        }

        authenticateAdmin.mutate({ password });
    };

    const handleClose = () => {
        setPassword('');
        setError('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-500" />
                        Admin Access Required
                    </DialogTitle>
                </DialogHeader>

                <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-red-800">
                            <Lock className="h-4 w-4" />
                            Security Verification
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-red-700 mb-4">
                            This area contains sensitive administrative functions. Please enter the admin password to proceed.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Input
                                    type="password"
                                    placeholder="Enter admin password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full"
                                    disabled={authenticateAdmin.isPending}
                                />
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="flex gap-2 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={authenticateAdmin.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={authenticateAdmin.isPending}
                                >
                                    {authenticateAdmin.isPending ? 'Verifying...' : 'Access Admin Panel'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
};
