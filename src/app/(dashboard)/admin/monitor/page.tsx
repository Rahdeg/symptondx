'use client';

import React, { useState } from 'react';
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Server,
    Database,
    Cpu,
    Zap,
    HardDrive,
    Activity,
    Wifi,
    AlertTriangle,
    CheckCircle,
    RefreshCw
} from "lucide-react";

export default function AdminMonitorPage() {
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const handleRefresh = () => {
        setLastUpdated(new Date());
        // In a real implementation, this would trigger a refresh of system metrics
    };

    // Mock system metrics (in real implementation, these would come from actual system monitoring)
    const systemMetrics = {
        cpu: { usage: 45, status: 'normal' },
        memory: { usage: 68, total: 16, used: 10.88, status: 'normal' },
        disk: { usage: 32, total: 500, used: 160, status: 'normal' },
        network: { status: 'connected', latency: '12ms' },
        database: { status: 'healthy', connections: 23, maxConnections: 100 },
        services: [
            { name: 'Web Server', status: 'running', uptime: '7d 14h' },
            { name: 'Database', status: 'running', uptime: '7d 14h' },
            { name: 'AI Service', status: 'running', uptime: '2d 8h' },
            { name: 'Background Jobs', status: 'running', uptime: '7d 14h' },
            { name: 'File Storage', status: 'running', uptime: '7d 14h' }
        ]
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running':
            case 'healthy':
            case 'connected':
            case 'normal':
                return 'bg-green-100 text-green-800';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800';
            case 'error':
            case 'down':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'running':
            case 'healthy':
            case 'connected':
            case 'normal':
                return <CheckCircle className="h-4 w-4" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4" />;
            case 'error':
            case 'down':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

    return (
        <DashboardLayout
            title="Admin - System Monitor"
            description="Real-time system health and performance monitoring"
        >
            <div className="space-y-6">
                {/* Header with Refresh */}
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </p>
                    </div>
                    <Button onClick={handleRefresh} variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {/* System Status Alert */}
                <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                        All systems operational. No critical issues detected.
                    </AlertDescription>
                </Alert>

                {/* Resource Usage */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* CPU Usage */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                            <Cpu className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{systemMetrics.cpu.usage}%</div>
                            <Progress value={systemMetrics.cpu.usage} className="mt-2" />
                            <p className="text-xs text-muted-foreground mt-2">
                                Normal operation range
                            </p>
                        </CardContent>
                    </Card>

                    {/* Memory Usage */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                            <Zap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{systemMetrics.memory.usage}%</div>
                            <Progress value={systemMetrics.memory.usage} className="mt-2" />
                            <p className="text-xs text-muted-foreground mt-2">
                                {systemMetrics.memory.used}GB / {systemMetrics.memory.total}GB
                            </p>
                        </CardContent>
                    </Card>

                    {/* Disk Usage */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{systemMetrics.disk.usage}%</div>
                            <Progress value={systemMetrics.disk.usage} className="mt-2" />
                            <p className="text-xs text-muted-foreground mt-2">
                                {systemMetrics.disk.used}GB / {systemMetrics.disk.total}GB
                            </p>
                        </CardContent>
                    </Card>

                    {/* Network Status */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Network</CardTitle>
                            <Wifi className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{systemMetrics.network.latency}</div>
                            <Badge className={getStatusColor(systemMetrics.network.status)} >
                                <span className="flex items-center gap-1">
                                    {getStatusIcon(systemMetrics.network.status)}
                                    Connected
                                </span>
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-2">
                                Response time
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Services Status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Server className="h-5 w-5" />
                                System Services
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {systemMetrics.services.map((service, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(service.status)}
                                                <span className="font-medium">{service.name}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gray-500">Uptime: {service.uptime}</span>
                                            <Badge className={getStatusColor(service.status)}>
                                                {service.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                Database Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Status</span>
                                    <Badge className={getStatusColor(systemMetrics.database.status)}>
                                        <span className="flex items-center gap-1">
                                            {getStatusIcon(systemMetrics.database.status)}
                                            {systemMetrics.database.status}
                                        </span>
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Active Connections</span>
                                    <span className="text-sm">{systemMetrics.database.connections} / {systemMetrics.database.maxConnections}</span>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Connection Pool</span>
                                        <span className="text-sm">{(systemMetrics.database.connections / systemMetrics.database.maxConnections * 100).toFixed(1)}%</span>
                                    </div>
                                    <Progress value={systemMetrics.database.connections / systemMetrics.database.maxConnections * 100} />
                                </div>

                                <div className="pt-4 border-t">
                                    <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div>• Database backup completed at 03:00 AM</div>
                                        <div>• Performance optimization completed</div>
                                        <div>• Index maintenance scheduled for tonight</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* System Logs Preview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Recent System Logs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 p-2 text-sm font-mono bg-gray-50 rounded">
                                <Badge className="bg-green-100 text-green-800">INFO</Badge>
                                <span className="text-gray-500">{new Date().toISOString()}</span>
                                <span>System health check completed successfully</span>
                            </div>
                            <div className="flex items-center gap-3 p-2 text-sm font-mono bg-gray-50 rounded">
                                <Badge className="bg-blue-100 text-blue-800">INFO</Badge>
                                <span className="text-gray-500">{new Date(Date.now() - 5 * 60 * 1000).toISOString()}</span>
                                <span>AI service processing new diagnosis request</span>
                            </div>
                            <div className="flex items-center gap-3 p-2 text-sm font-mono bg-gray-50 rounded">
                                <Badge className="bg-green-100 text-green-800">INFO</Badge>
                                <span className="text-gray-500">{new Date(Date.now() - 10 * 60 * 1000).toISOString()}</span>
                                <span>Database connection pool optimized</span>
                            </div>
                            <div className="flex items-center gap-3 p-2 text-sm font-mono bg-gray-50 rounded">
                                <Badge className="bg-yellow-100 text-yellow-800">WARN</Badge>
                                <span className="text-gray-500">{new Date(Date.now() - 15 * 60 * 1000).toISOString()}</span>
                                <span>High memory usage detected - within normal range</span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Button variant="outline" size="sm">
                                View Full Logs
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
