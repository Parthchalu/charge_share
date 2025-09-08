import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Car, Zap, ArrowRight, FileText, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function OnboardingPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(null); // 'driver' or 'host'
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

    const canProceed = agreedToTerms && agreedToPrivacy;

    const handleRoleSelect = async (role) => {
        if (!canProceed) return;
        
        setLoading(role);
        try {
            await User.updateMyUserData({ 
                app_role: role,
                agreed_to_terms: true,
                agreed_to_privacy: true,
                agreement_date: new Date().toISOString()
            });
            // Redirect to account settings to complete profile
            navigate(createPageUrl('AccountSettings'));
        } catch (error) {
            console.error("Failed to update user role:", error);
            // Optionally show an error to the user
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="text-center mb-8 max-w-md">
                <Zap className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <h1 className="text-3xl font-bold text-gray-900">Welcome to ChargePeer!</h1>
                <p className="text-gray-600 mt-2">Let's get you started. To provide the best experience, please tell us what you're here to do.</p>
            </div>

            {/* Privacy Policy Agreement */}
            <Card className="w-full max-w-3xl mb-6">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Agreement & Privacy
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                        Before continuing, please review and agree to our terms and privacy policy to ensure you understand how we handle your data and what to expect from our service.
                    </p>
                    
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="terms-agreement"
                                checked={agreedToTerms}
                                onCheckedChange={setAgreedToTerms}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label
                                    htmlFor="terms-agreement"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    I agree to the{" "}
                                    <a href="#" className="text-blue-600 underline hover:text-blue-800">
                                        Terms of Service
                                    </a>
                                </Label>
                                <p className="text-xs text-gray-500">
                                    This covers how you can use ChargePeer and our responsibilities.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="privacy-agreement"
                                checked={agreedToPrivacy}
                                onCheckedChange={setAgreedToPrivacy}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label
                                    htmlFor="privacy-agreement"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    I agree to the{" "}
                                    <a href="#" className="text-blue-600 underline hover:text-blue-800">
                                        Privacy Policy
                                    </a>
                                </Label>
                                <p className="text-xs text-gray-500">
                                    This explains how we collect, use, and protect your personal information.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
                <Card className={`cursor-pointer transition-all transform hover:-translate-y-1 ${canProceed ? 'hover:shadow-xl hover:border-blue-500' : 'opacity-50 cursor-not-allowed'}`} onClick={() => canProceed && handleRoleSelect('driver')}>
                    <CardContent className="p-8 text-center flex flex-col h-full">
                        <Car className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">I'm a Driver</h2>
                        <p className="text-gray-500 mb-6 flex-grow">I want to find and book charging stations for my electric vehicle.</p>
                        <Button disabled={loading === 'driver' || !canProceed} className="w-full bg-blue-600 hover:bg-blue-700">
                            {loading === 'driver' ? 'Setting up...' : 'Continue as a Driver'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </CardContent>
                </Card>
                <Card className={`cursor-pointer transition-all transform hover:-translate-y-1 ${canProceed ? 'hover:shadow-xl hover:border-green-500' : 'opacity-50 cursor-not-allowed'}`} onClick={() => canProceed && handleRoleSelect('host')}>
                    <CardContent className="p-8 text-center flex flex-col h-full">
                        <Zap className="w-16 h-16 mx-auto text-green-600 mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">I'm a Host</h2>
                        <p className="text-gray-500 mb-6 flex-grow">I want to list my charging station and start earning money.</p>
                        <Button disabled={loading === 'host' || !canProceed} className="w-full bg-green-600 hover:bg-green-700">
                             {loading === 'host' ? 'Setting up...' : 'Continue as a Host'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {!canProceed && (
                <p className="text-sm text-gray-500 mt-4 text-center">
                    Please agree to the terms and privacy policy to continue.
                </p>
            )}
        </div>
    );
}