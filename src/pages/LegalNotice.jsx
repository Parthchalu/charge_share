import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LegalNoticePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">Legal Notice</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>ChargePeer Legal Notice</CardTitle>
                        <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
                    </CardHeader>
                    <CardContent className="prose prose-gray max-w-none">
                        <h3>Company Information</h3>
                        <p>
                            ChargePeer is a platform operated by ChargePeer Technologies Private Limited, 
                            a company incorporated under the laws of India.
                        </p>
                        <p>
                            <strong>Registered Office:</strong><br />
                            ChargePeer Technologies Pvt. Ltd.<br />
                            [Company Address]<br />
                            [City, State, PIN Code]<br />
                            India
                        </p>

                        <h3>Contact Information</h3>
                        <p>
                            <strong>Email:</strong> legal@chargepeer.com<br />
                            <strong>Phone:</strong> +91-XXXX-XXXXXX<br />
                            <strong>Customer Support:</strong> support@chargepeer.com
                        </p>

                        <h3>Business Registration</h3>
                        <p>
                            <strong>CIN:</strong> [Corporate Identity Number]<br />
                            <strong>GST Registration:</strong> [GST Number]<br />
                            <strong>PAN:</strong> [PAN Number]
                        </p>

                        <h3>Intellectual Property</h3>
                        <p>
                            All content, trademarks, service marks, trade names, logos, and icons are proprietary 
                            to ChargePeer Technologies Private Limited or its licensors. Unauthorized use of any 
                            content or materials is strictly prohibited.
                        </p>

                        <h3>Jurisdiction</h3>
                        <p>
                            Any disputes arising from the use of this platform shall be subject to the exclusive 
                            jurisdiction of the courts located in [City, State], India.
                        </p>

                        <h3>Regulatory Compliance</h3>
                        <p>
                            ChargePeer operates in compliance with applicable Indian laws and regulations, 
                            including but not limited to the Information Technology Act, 2000, and relevant 
                            consumer protection laws.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}