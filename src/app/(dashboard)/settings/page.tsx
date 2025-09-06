'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import {
    Bell,
    Shield,
    Palette,
    Lock,
    Trash2,
    Download,
    Upload,
    Save
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        // Notification Settings
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        diagnosisUpdates: true,
        marketingEmails: false,

        // Privacy Settings
        dataSharing: false,
        analyticsTracking: true,
        profileVisibility: 'private',

        // Display Settings
        theme: 'system',
        language: 'en',
        timezone: 'UTC',

        // Security Settings
        twoFactorAuth: false,
        sessionTimeout: '30',

        // Data Settings
        dataRetention: '5',
        exportFormat: 'json'
    });

    const handleSettingChange = (key: string, value: string | boolean) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSaveSettings = () => {
        // In a real app, this would save to the backend
        toast.success('Settings saved successfully!');
    };

    const handleExportData = () => {
        // In a real app, this would trigger data export
        toast.info('Data export started. You will receive an email when ready.');
    };

    const handleDeleteAccount = () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            toast.error('Account deletion requires additional verification. Please contact support.');
        }
    };

    return (
        <DashboardLayout
            title="Settings"
            description="Manage your account preferences and privacy settings"
        >
            <div className="space-y-6">
                {/* Notification Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notification Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                                </div>
                                <Switch
                                    id="emailNotifications"
                                    checked={settings.emailNotifications}
                                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                                    <p className="text-sm text-gray-600">Receive push notifications in your browser</p>
                                </div>
                                <Switch
                                    id="pushNotifications"
                                    checked={settings.pushNotifications}
                                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                                    <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                                </div>
                                <Switch
                                    id="smsNotifications"
                                    checked={settings.smsNotifications}
                                    onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                                />
                            </div>


                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="diagnosisUpdates">Diagnosis Updates</Label>
                                    <p className="text-sm text-gray-600">Get notified when diagnosis results are ready</p>
                                </div>
                                <Switch
                                    id="diagnosisUpdates"
                                    checked={settings.diagnosisUpdates}
                                    onCheckedChange={(checked) => handleSettingChange('diagnosisUpdates', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="marketingEmails">Marketing Emails</Label>
                                    <p className="text-sm text-gray-600">Receive promotional content and health tips</p>
                                </div>
                                <Switch
                                    id="marketingEmails"
                                    checked={settings.marketingEmails}
                                    onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Privacy Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Privacy Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="dataSharing">Data Sharing</Label>
                                    <p className="text-sm text-gray-600">Allow anonymized data to be used for research</p>
                                </div>
                                <Switch
                                    id="dataSharing"
                                    checked={settings.dataSharing}
                                    onCheckedChange={(checked) => handleSettingChange('dataSharing', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="analyticsTracking">Analytics Tracking</Label>
                                    <p className="text-sm text-gray-600">Help improve our service with usage analytics</p>
                                </div>
                                <Switch
                                    id="analyticsTracking"
                                    checked={settings.analyticsTracking}
                                    onCheckedChange={(checked) => handleSettingChange('analyticsTracking', checked)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="profileVisibility">Profile Visibility</Label>
                                <Select
                                    value={settings.profileVisibility}
                                    onValueChange={(value) => handleSettingChange('profileVisibility', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="private">Private</SelectItem>
                                        <SelectItem value="doctors">Doctors Only</SelectItem>
                                        <SelectItem value="public">Public</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-gray-600">Control who can see your profile information</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Display Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            Display Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="theme">Theme</Label>
                                <Select
                                    value={settings.theme}
                                    onValueChange={(value) => handleSettingChange('theme', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">Light</SelectItem>
                                        <SelectItem value="dark">Dark</SelectItem>
                                        <SelectItem value="system">System</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="language">Language</Label>
                                <Select
                                    value={settings.language}
                                    onValueChange={(value) => handleSettingChange('language', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="es">Spanish</SelectItem>
                                        <SelectItem value="fr">French</SelectItem>
                                        <SelectItem value="de">German</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timezone">Timezone</Label>
                                <Select
                                    value={settings.timezone}
                                    onValueChange={(value) => handleSettingChange('timezone', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="UTC">UTC</SelectItem>
                                        <SelectItem value="EST">Eastern Time</SelectItem>
                                        <SelectItem value="PST">Pacific Time</SelectItem>
                                        <SelectItem value="CST">Central Time</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Security Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                                </div>
                                <Switch
                                    id="twoFactorAuth"
                                    checked={settings.twoFactorAuth}
                                    onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sessionTimeout">Session Timeout</Label>
                                <Select
                                    value={settings.sessionTimeout}
                                    onValueChange={(value) => handleSettingChange('sessionTimeout', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="15">15 minutes</SelectItem>
                                        <SelectItem value="30">30 minutes</SelectItem>
                                        <SelectItem value="60">1 hour</SelectItem>
                                        <SelectItem value="240">4 hours</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-gray-600">Automatically log out after inactivity</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Management */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5" />
                            Data Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="dataRetention">Data Retention Period</Label>
                                <Select
                                    value={settings.dataRetention}
                                    onValueChange={(value) => handleSettingChange('dataRetention', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 year</SelectItem>
                                        <SelectItem value="3">3 years</SelectItem>
                                        <SelectItem value="5">5 years</SelectItem>
                                        <SelectItem value="10">10 years</SelectItem>
                                        <SelectItem value="forever">Forever</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-gray-600">How long to keep your health data</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="exportFormat">Export Format</Label>
                                <Select
                                    value={settings.exportFormat}
                                    onValueChange={(value) => handleSettingChange('exportFormat', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="json">JSON</SelectItem>
                                        <SelectItem value="csv">CSV</SelectItem>
                                        <SelectItem value="pdf">PDF</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-gray-600">Format for data exports</p>
                            </div>

                            <div className="flex gap-4">
                                <Button onClick={handleExportData} className="flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    Export My Data
                                </Button>
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Upload className="h-4 w-4" />
                                    Import Data
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-5 w-5" />
                            Danger Zone
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-4 bg-red-50 rounded-lg">
                                <h3 className="font-semibold text-red-900 mb-2">Delete Account</h3>
                                <p className="text-sm text-red-700 mb-4">
                                    Permanently delete your account and all associated data. This action cannot be undone.
                                </p>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteAccount}
                                    className="flex items-center gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Account
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button onClick={handleSaveSettings} className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save All Settings
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
