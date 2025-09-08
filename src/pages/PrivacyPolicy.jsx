import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">Personal Data Policy</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>ChargePeer Privacy Policy</CardTitle>
                        <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
                    </CardHeader>
                    <CardContent className="prose prose-gray max-w-none">
                        <h3>1. Introduction</h3>
                        <p>
                            Welcome to ChargePeer. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at privacy@chargepeer.com.
                        </p>

                        <h3>2. What Information Do We Collect?</h3>
                        <p>
                            We collect personal information that you voluntarily provide to us when you register on the app, express an interest in obtaining information about us or our products and services, when you participate in activities on the app or otherwise when you contact us.
                        </p>
                        <ul>
                            <li><strong>Personal Identification Information:</strong> Name, email address, phone number, physical address.</li>
                            <li><strong>Payment Data:</strong> We may collect data necessary to process your payment if you make purchases, such as your payment instrument number (such as a credit card number), and the security code associated with your payment instrument. All payment data is stored by our payment processor.</li>
                            <li><strong>Location Data:</strong> We collect location data when you use our services to help you find charging stations or to show your station to drivers.</li>
                            <li><strong>Usage Data:</strong> Information about how you use our app, products, and services.</li>
                        </ul>

                        <h3>3. How Do We Use Your Information?</h3>
                        <p>
                            We use personal information collected via our app for a variety of business purposes described below.
                        </p>
                        <ul>
                            <li>To facilitate account creation and logon process.</li>
                            <li>To send administrative information to you.</li>
                            <li>To fulfill and manage your bookings and payments.</li>
                            <li>To request feedback and to contact you about your use of our app.</li>
                            <li>To protect our Services (e.g., for fraud monitoring and prevention).</li>
                        </ul>

                        <h3>4. Will Your Information Be Shared With Anyone?</h3>
                        <p>
                            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. For example, we may share your name and booking details with a host when you book a charger.
                        </p>

                        <h3>5. How Long Do We Keep Your Information?</h3>
                        <p>
                            We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law.
                        </p>

                        <h3>6. What Are Your Privacy Rights?</h3>
                        <p>
                            You may review, change, or terminate your account at any time. You have the right to opt-out of our marketing communications at any time.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}