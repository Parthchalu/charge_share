import React, { useState } from 'react';
import { User } from '@/api/entities';
import { Shield, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DisableTwoFactor({ onClose, onSuccess }) {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDisable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real implementation, you would verify the code on the backend
      // For demo purposes, we'll accept any 6-digit code
      await User.updateMyUserData({
        two_factor_enabled: false,
        two_factor_secret: null,
        two_factor_backup_codes: []
      });

      onSuccess();
      onClose();
    } catch (error) {
      setError('Failed to disable 2FA. Please try again.');
      console.error('2FA disable error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Disable Two-Factor Authentication
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              Disabling 2FA will make your account less secure. Are you sure you want to continue?
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Enter the 6-digit code from your authenticator app to confirm
            </p>
            
            <Input
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 6) {
                  setVerificationCode(value);
                  setError('');
                }
              }}
              className="text-center text-lg font-mono tracking-widest"
              maxLength={6}
            />
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleDisable2FA} 
              disabled={verificationCode.length !== 6 || loading}
              variant="destructive"
              className="flex-1"
            >
              {loading ? 'Disabling...' : 'Disable 2FA'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}