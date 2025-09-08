import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CookiesPolicyPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">Cookies and Trackers Policy</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>ChargePeer Cookies Policy</CardTitle>
                        <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
                    </CardHeader>
                    <CardContent className="prose prose-gray max-w-none">
                        <h3>What are cookies?</h3>
                        <p>
                            Cookies are small data files that are placed on your computer or mobile device when you visit a website. 
                            Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, 
                            as well as to provide reporting information.
                        </p>

                        <h3>How do we use cookies?</h3>
                        <p>We use cookies for several reasons:</p>
                        <ul>
                            <li><strong>Essential cookies:</strong> Required for the website to function properly</li>
                            <li><strong>Performance cookies:</strong> Help us understand how visitors interact with our website</li>
                            <li><strong>Functional cookies:</strong> Remember your preferences and settings</li>
                            <li><strong>Analytics cookies:</strong> Help us improve our service by analyzing usage patterns</li>
                        </ul>

                        <h3>Types of cookies we use</h3>
                        <h4>Essential Cookies</h4>
                        <p>
                            These cookies are necessary for the website to function and cannot be switched off in our systems. 
                            They are usually only set in response to actions made by you which amount to a request for services, 
                            such as setting your privacy preferences, logging in or filling in forms.
                        </p>

                        <h4>Performance and Analytics Cookies</h4>
                        <p>
                            These cookies allow us to count visits and traffic sources so we can measure and improve the 
                            performance of our site. They help us to know which pages are the most and least popular and 
                            see how visitors move around the site.
                        </p>

                        <h3>Managing your cookie preferences</h3>
                        <p>
                            You can control and/or delete cookies as you wish. You can delete all cookies that are already 
                            on your computer and you can set most browsers to prevent them from being placed.
                        </p>

                        <h3>Contact us</h3>
                        <p>
                            If you have any questions about our use of cookies, please contact us at privacy@chargepeer.com.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}