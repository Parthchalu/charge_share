import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfServicePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>ChargePeer Terms of Service</CardTitle>
                        <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
                    </CardHeader>
                    <CardContent className="prose prose-gray max-w-none">
                        <h3>Acceptance of Terms</h3>
                        <p>
                            By using ChargePeer, you agree to be bound by these Terms of Service. 
                            If you do not agree to these terms, please do not use our service.
                        </p>

                        <h3>Description of Service</h3>
                        <p>
                            ChargePeer is a platform that connects electric vehicle owners with charging station 
                            hosts, facilitating the booking and payment for charging services.
                        </p>

                        <h3>User Responsibilities</h3>
                        <ul>
                            <li>Provide accurate and complete information</li>
                            <li>Use the service in compliance with all applicable laws</li>
                            <li>Respect the property and rights of charging station hosts</li>
                            <li>Make timely payments for bookings</li>
                        </ul>

                        <h3>Host Responsibilities</h3>
                        <ul>
                            <li>Ensure charging stations are safe and functional</li>
                            <li>Provide accurate availability information</li>
                            <li>Allow reasonable access to drivers with confirmed bookings</li>
                            <li>Maintain charging equipment in good working condition</li>
                        </ul>

                        <h3>Payment Terms</h3>
                        <p>
                            Drivers agree to pay the listed rates for charging services. ChargePeer collects 
                            a service fee from each transaction. Hosts receive payment minus platform commission.
                        </p>

                        <h3>Cancellation Policy</h3>
                        <p>
                            Cancellations made at least 2 hours before the booking start time are eligible 
                            for a full refund. Late cancellations may incur fees.
                        </p>

                        <h3>Limitation of Liability</h3>
                        <p>
                            ChargePeer acts as a platform connecting users and is not responsible for the 
                            condition of charging equipment or disputes between users.
                        </p>

                        <h3>Contact Information</h3>
                        <p>
                            For questions about these terms, please contact us at legal@chargepeer.com.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}