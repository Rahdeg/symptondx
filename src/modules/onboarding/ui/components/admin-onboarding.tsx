'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export const AdminOnboarding: React.FC = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-500" />
                    Administrator Setup
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">
                    Welcome to the administrator panel. You have full access to system management and monitoring.
                </p>
                <Button className="w-full">
                    Complete Setup
                </Button>
            </CardContent>
        </Card>
    );
};
