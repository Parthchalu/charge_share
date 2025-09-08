
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/api/entities';
import { Shield, Copy, Check, X, Smartphone, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function TwoFactorSetup({ onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Setup, 2: Verify, 3: Backup Codes
  const [secretKey, setSecretKey] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generateRandomSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateSecret = useCallback(async () => {
    // Generate a random secret (in real app, this would be done securely on backend)
    const secret = generateRandomSecret();
    setSecretKey(secret);
    
    // Generate QR code URL for authenticator apps
    const qrUrl = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/ChargePeer?secret=${secret}&issuer=ChargePeer`;
    setQrCodeUrl(qrUrl);
  }, []); // generateRandomSecret is a stable function reference here, or could be moved outside component

  useEffect(() => {
    generateSecret();
  }, [generateSecret]); // Add generateSecret to dependencies due to useCallback

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substr(2, 8).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secretKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy secret:', err);
    }
  };

  const verifyAndEnable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real implementation, you would verify the code on the backend
      // For demo purposes, we'll accept any 6-digit code
      const codes = generateBackupCodes();
      setBackupCodes(codes);

      await User.updateMyUserData({
        two_factor_enabled: true,
        two_factor_secret: secretKey, // In real app, this would be encrypted
        two_factor_backup_codes: codes
      });

      setStep(3); // Show backup codes
    } catch (error) {
      setError('Failed to enable 2FA. Please try again.');
      console.error('2FA setup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const finish2FASetup = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Two-Factor Authentication
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 1 && (
            <>
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                
                <div className="bg-white p-4 rounded-lg border inline-block">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Or enter this secret key manually:</p>
                  <div className="flex gap-2">
                    <Input 
                      value={secretKey} 
                      readOnly 
                      className="font-mono text-xs"
                    />
                    <Button variant="outline" size="icon" onClick={copySecret}>
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button onClick={() => setStep(2)} className="w-full">
                I've Added the Account
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center space-y-4">
                <Smartphone className="w-12 h-12 text-blue-600 mx-auto" />
                <p className="text-gray-600">
                  Enter the 6-digit code from your authenticator app to verify the setup
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
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={verifyAndEnable2FA} 
                  disabled={verificationCode.length !== 6 || loading}
                  className="flex-1"
                >
                  {loading ? 'Verifying...' : 'Verify & Enable'}
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-600">2FA Enabled Successfully!</h3>
                <p className="text-gray-600 text-sm">
                  Save these backup codes in a safe place. You can use them to access your account if you lose your device.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Backup Codes</span>
                  <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(backupCodes.join('\n'))}>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy All
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <Badge key={index} variant="outline" className="font-mono justify-center">
                      {code}
                    </Badge>
                  ))}
                </div>
              </div>

              <Alert>
                <Key className="w-4 h-4" />
                <AlertDescription>
                  Store these codes securely. Each code can only be used once.
                </AlertDescription>
              </Alert>

              <Button onClick={finish2FASetup} className="w-full bg-green-600 hover:bg-green-700">
                Complete Setup
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
