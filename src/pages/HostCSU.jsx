import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HostCSUPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">Host Customer Service User Agreement</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Host CSU Agreement</CardTitle>
                        <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
                    </CardHeader>
                    <CardContent className="prose prose-gray max-w-none">
                        <h3>Host Responsibilities</h3>
                        <p>As a charging station host on ChargePeer, you agree to:</p>
                        <ul>
                            <li>Maintain charging equipment in safe, working condition</li>
                            <li>Provide accurate availability schedules and pricing</li>
                            <li>Ensure clear access instructions for drivers</li>
                            <li>Respond promptly to booking requests and driver inquiries</li>
                            <li>Report any equipment issues or safety concerns immediately</li>
                            <li>Comply with local regulations and safety standards</li>
                        </ul>

                        <h3>Equipment Standards</h3>
                        <p>
                            All listed charging equipment must meet relevant safety standards and be regularly 
                            inspected. Hosts are responsible for ensuring electrical safety, proper grounding, 
                            and weather protection where applicable.
                        </p>

                        <h3>Availability and Access</h3>
                        <p>
                            Hosts must maintain accurate availability calendars and provide reasonable access 
                            to confirmed bookings. Any changes to availability should be updated immediately 
                            to avoid inconveniencing drivers.
                        </p>

                        <h3>Payment and Commission</h3>
                        <p>
                            ChargePeer collects a 15% commission on all successful bookings. Payments to hosts 
                            are processed within 7 business days after booking completion. Hosts are responsible 
                            for applicable taxes on their earnings.
                        </p>

                        <h3>Insurance and Liability</h3>
                        <p>
                            Hosts are encouraged to maintain appropriate insurance coverage for their property 
                            and charging equipment. ChargePeer provides limited liability coverage during active 
                            booking periods, but hosts should verify their individual insurance needs.
                        </p>

                        <h3>Quality Standards</h3>
                        <p>
                            Hosts are expected to maintain high service quality standards. Consistent poor 
                            reviews or safety issues may result in listing suspension or removal from the platform.
                        </p>

                        <h3>Customer Support</h3>
                        <p>
                            Hosts have access to dedicated support for technical issues, payment inquiries, 
                            and dispute resolution. Our host support team is available at hosts@chargepeer.com 
                            or through the app's messaging system.
                        </p>

                        <h3>Dispute Resolution</h3>
                        <p>
                            Any disputes with drivers regarding bookings, property damage, or service issues 
                            will be mediated by ChargePeer's customer service team. Documentation and evidence 
                            should be provided promptly to facilitate resolution.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}