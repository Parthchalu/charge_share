import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DriverCSUPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">Driver Customer Service User Agreement</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Driver CSU Agreement</CardTitle>
                        <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
                    </CardHeader>
                    <CardContent className="prose prose-gray max-w-none">
                        <h3>Driver Responsibilities</h3>
                        <p>As a driver using ChargePeer, you agree to:</p>
                        <ul>
                            <li>Provide accurate vehicle and contact information</li>
                            <li>Arrive at the charging location on time for your booking</li>
                            <li>Use charging equipment responsibly and as intended</li>
                            <li>Report any issues or damages immediately</li>
                            <li>Respect the host's property and any specific instructions</li>
                            <li>Pay all charges and fees as agreed</li>
                        </ul>

                        <h3>Booking and Payment Terms</h3>
                        <p>
                            Drivers are responsible for making accurate bookings and ensuring timely payment. 
                            Late arrivals may result in booking cancellation or additional charges. 
                            Cancellations must be made at least 2 hours before the scheduled time to avoid fees.
                        </p>

                        <h3>Vehicle Requirements</h3>
                        <p>
                            Drivers must ensure their electric vehicle is compatible with the selected charging 
                            connector type. ChargePeer is not responsible for compatibility issues or charging failures 
                            due to vehicle-specific problems.
                        </p>

                        <h3>Safety and Liability</h3>
                        <p>
                            Drivers use charging stations at their own risk. While hosts are expected to maintain 
                            safe equipment, drivers should inspect charging stations before use and report any 
                            safety concerns immediately.
                        </p>

                        <h3>Customer Support</h3>
                        <p>
                            For assistance during charging sessions, drivers can contact our 24/7 support team 
                            through the app or at support@chargepeer.com. Emergency situations should be reported 
                            to local authorities first, then to ChargePeer support.
                        </p>

                        <h3>Dispute Resolution</h3>
                        <p>
                            Any disputes regarding bookings, payments, or service quality will be handled through 
                            ChargePeer's customer service team. We aim to resolve all issues within 48 hours of reporting.
                        </p>

                        <h3>Data Usage</h3>
                        <p>
                            Charging session data, including energy consumption and duration, may be collected 
                            for billing and service improvement purposes. This data is handled according to our Privacy Policy.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}