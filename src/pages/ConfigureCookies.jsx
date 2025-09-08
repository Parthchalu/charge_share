import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/api/entities';
import { ArrowLeft, Cookie, Shield, BarChart3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function ConfigureCookiesPage() {
    const navigate = useNavigate();
    const [settings, setSettings] = useState({
        essential_cookies: true, // Always enabled
        performance_cookies: true,
        functional_cookies: true,
        analytics_cookies: true
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadUserSettings = async () => {
            try {
                const user = await User.me();
                if (user.cookie_preferences) {
                    setSettings({
                        essential_cookies: true, // Always true
                        performance_cookies: user.cookie_preferences.performance_cookies ?? true,
                        functional_cookies: user.cookie_preferences.functional_cookies ?? true,
                        analytics_cookies: user.cookie_preferences.analytics_cookies ?? true
                    });
                }
            } catch (error) {
                console.error("Failed to load user settings:", error);
            }
        };
        loadUserSettings();
    }, []);

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await User.updateMyUserData({
                cookie_preferences: settings
            });
        } catch (error) {
            console.error("Failed to save cookie preferences:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = (key, value) => {
        if (key === 'essential_cookies') return; // Cannot disable essential cookies
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">Configure Cookies & Trackers</h1>
                </div>

                <div className="space-y-6">
                    <Card className="border-green-200 bg-green-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-800">
                                <Shield className="w-5 h-5" />
                                Essential Cookies
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <Label className="text-sm font-medium text-green-800">Always Active</Label>
                                    <p className="text-sm text-green-700 mt-1">
                                        These cookies are necessary for the website to function and cannot be disabled.
                                    </p>
                                </div>
                                <Switch checked={true} disabled />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-800">
                                <BarChart3 className="w-5 h-5" />
                                Performance Cookies
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <Label htmlFor="performance" className="text-sm font-medium text-gray-800">Enable Performance Tracking</Label>
                                    <p className="text-sm text-gray-600 mt-1">
                                        These cookies help us understand how you interact with our website.
                                    </p>
                                </div>
                                <Switch 
                                    id="performance"
                                    checked={settings.performance_cookies}
                                    onCheckedChange={(value) => handleToggle('performance_cookies', value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-purple-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-800">
                                <Settings className="w-5 h-5" />
                                Functional Cookies
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <Label htmlFor="functional" className="text-sm font-medium text-gray-800">Enable Enhanced Functionality</Label>
                                    <p className="text-sm text-gray-600 mt-1">
                                        These cookies enable enhanced functionality and personalization.
                                    </p>
                                </div>
                                <Switch 
                                    id="functional"
                                    checked={settings.functional_cookies}
                                    onCheckedChange={(value) => handleToggle('functional_cookies', value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-orange-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-800">
                                <Cookie className="w-5 h-5" />
                                Analytics Cookies
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <Label htmlFor="analytics" className="text-sm font-medium text-gray-800">Enable Analytics</Label>
                                    <p className="text-sm text-gray-600 mt-1">
                                        These cookies help us improve our service by analyzing usage patterns.
                                    </p>
                                </div>
                                <Switch 
                                    id="analytics"
                                    checked={settings.analytics_cookies}
                                    onCheckedChange={(value) => handleToggle('analytics_cookies', value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button 
                            onClick={handleSaveSettings}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {saving ? 'Saving...' : 'Save Preferences'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}