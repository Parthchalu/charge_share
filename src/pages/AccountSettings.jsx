
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User, Transaction } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { format } from 'date-fns';
import TwoFactorSetup from '../components/security/TwoFactorSetup';
import DisableTwoFactor from '../components/security/DisableTwoFactor';
import {
  ArrowLeft,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Save,
  X,
  Plus,
  Shield,
  Camera,
  CreditCard,
  Lock,
  Trash2,
  FileText,
  Wallet,
  Loader,
  Star,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

function BillingHistory({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const data = await Transaction.filter({ user_id: user.id }, '-created_date');
        setTransactions(data);
      } catch (error) {
        console.error("Failed to load transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
  }, [user?.id]);

  if (loading) {
    return <div className="space-y-3"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-16" /></div>;
  }

  return (
    <Card>
      <CardHeader><CardTitle>Billing History</CardTitle></CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {transactions.map(tx => (
              <div key={tx.id} className="py-3 grid grid-cols-3 md:grid-cols-4 gap-4 items-center">
                <div className="col-span-2 md:col-span-2">
                  <p className="font-medium text-gray-800">{tx.description}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(tx.created_date), 'MMM d, yyyy')} • {tx.invoice_number}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${tx.type === 'payment' ? 'text-red-600' : 'text-green-600'}`}>
                    {tx.type === 'payment' ? '-' : '+'} ₹{tx.amount.toFixed(2)}
                  </p>
                  <Badge variant={tx.status === 'completed' ? 'default' : 'destructive'}>{tx.status}</Badge>
                </div>
                <div className="text-right">
                  <Link to={createPageUrl(`InvoiceDetails?id=${tx.id}`)}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No transactions found.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AccountSettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const view = urlParams.get('view') || 'info';

  const [showCardDetails, setShowCardDetails] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const handleBackNavigation = () => {
    const returnPage = user?.app_role === 'host' ? 'HostProfile' : 'DriverProfile';
    navigate(createPageUrl(returnPage));
  };

  const loadUserData = async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      const formData = {
        ...userData,
        first_name: userData.first_name || userData.full_name?.split(' ')[0] || '',
        last_name: userData.last_name || userData.full_name?.split(' ').slice(1).join(' ') || '',
        phone: userData.phone || '',
        billing_address: userData.billing_address || userData.address || '',
        payment_details: userData.payment_details || {
          upi_id: '',
          card_holder: '',
          card_number: '',
          expiry_date: '',
          cvv: ''
        },
        bank_details: userData.bank_details || {
          account_holder: '',
          account_number: '',
          ifsc_code: ''
        }
      };
      setEditForm(formData);
      
      if (userData.billing_address === userData.address) {
        setUseSameAddress(true);
      } else {
        setUseSameAddress(!userData.billing_address);
      }

    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      await User.updateMyUserData({ profile_image: file_url });
      setUser((prev) => ({ ...prev, profile_image: file_url }));
      setEditForm((prev) => ({ ...prev, profile_image: file_url }));
    } catch (error) {
      console.error("Failed to upload profile photo:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (saving) return;
    
    setSaving(true);
    try {
      const wasOnboarding = !user.first_name;
      
      const updateData = {
        ...editForm,
        full_name: `${editForm.first_name || ''} ${editForm.last_name || ''}`.trim(),
        phone: editForm.phone,
        billing_address: useSameAddress ? editForm.address : editForm.billing_address,
        payment_details: editForm.payment_details,
        bank_details: editForm.bank_details
      };
      
      await User.updateMyUserData(updateData);
      setUser(updateData);
      setShowCardDetails(false);

      if (wasOnboarding) {
        if (updateData.app_role === 'host') {
          navigate(createPageUrl('HostDashboard'));
        } else if (updateData.app_role === 'driver') {
          navigate(createPageUrl('Home'));
        }
      }

    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await User.logout();
      navigate(createPageUrl('Home'));
    } catch (error) {
      console.error("Failed to delete account:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handle2FASuccess = () => {
    loadUserData();
  };

  const handleRechargeWallet = async () => {
    const amount = parseFloat(rechargeAmount);
    if (!amount || amount <= 0) return;

    try {
      const newBalance = (user.wallet_balance || 0) + amount;
      await User.updateMyUserData({ wallet_balance: newBalance });
      setUser(prev => ({ ...prev, wallet_balance: newBalance }));
      setShowRechargeModal(false);
      setRechargeAmount("");
    } catch (error) {
      console.error("Failed to recharge wallet:", error);
    }
  };

  const authenticateForCardAccess = async () => {
    setAuthenticating(true);
    setAuthError('');

    try {
      if ('credentials' in navigator && 'create' in navigator.credentials) {
        try {
          const challenge = new Uint8Array(32);
          crypto.getRandomValues(challenge);

          const publicKeyCredentialRequestOptions = {
            challenge: challenge,
            rpId: window.location.hostname,
            userVerification: 'required',
            timeout: 60000,
            allowCredentials: [],
          };

          const credential = await navigator.credentials.get({
            publicKey: publicKeyCredentialRequestOptions
          });

          if (credential) {
            setShowCardDetails(true);
            setAuthenticating(false);
            return;
          }
        } catch (biometricError) {
          console.log('Biometric auth not available or failed:', biometricError);
          setAuthError('');
        }
      }

      const userPin = prompt('Enter your 4-digit security PIN to view card details:');
      if (userPin && userPin.length === 4) {
        setShowCardDetails(true);
      } else {
        setAuthError('Authentication failed. PIN must be 4 digits.');
      }
    } catch (error) {
      setAuthError('Authentication failed. Please try again.');
      console.error('Authentication error:', error);
    } finally {
      setAuthenticating(false);
    }
  };

  const maskCardNumber = (cardNumber) => {
    if (!cardNumber || cardNumber.length < 4) return '••••';
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 4) return '••••';
    return '•••• •••• •••• ' + cleaned.slice(-4);
  };

  if (loading) return <div className="p-8"><Skeleton className="h-64 w-full" /></div>;

  const getPageTitle = () => {
    switch (view) {
      case 'payment':
        return 'Payment Methods';
      case 'security':
        return 'Security';
      case 'billing':
        return 'Billing & Invoices';
      default:
        return 'Personal Information';
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'billing':
        return <BillingHistory user={user} />;
      case 'payment':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>ChargePeer Wallet</span>
                  <Wallet className="w-5 h-5 text-gray-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Available Balance</p>
                    <p className="text-2xl font-bold">₹{user?.wallet_balance?.toFixed(2) || '0.00'}</p>
                  </div>
                  <Button onClick={() => setShowRechargeModal(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Money
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>UPI Payment (Primary)</CardTitle>
                <CardDescription>
                  {user?.app_role === 'host' ? 'Your primary UPI ID for receiving payments.' : 'Your UPI ID for quick payments and refunds.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="upi_id">UPI ID *</Label>
                  <Input
                    id="upi_id"
                    placeholder="e.g., user@upi"
                    value={editForm.payment_details?.upi_id || ''}
                    onChange={(e) => setEditForm((p) => ({
                      ...p,
                      payment_details: {
                        ...p.payment_details,
                        upi_id: e.target.value
                      }
                    }))}
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-1" /> 
                  {saving ? 'Saving...' : 'Save UPI Details'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Card Details (Optional)</CardTitle>
                <CardDescription>
                  Add a backup payment method for transactions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user?.payment_details?.card_number && !showCardDetails ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Saved Card</span>
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-500">Protected</span>
                        </div>
                      </div>
                      <p className="font-mono text-lg">{maskCardNumber(user.payment_details.card_number)}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {user.payment_details.card_holder || 'Card Holder'}
                      </p>
                    </div>

                    {authError && (
                      <div className="text-red-500 text-sm">{authError}</div>
                    )}

                    <Button
                      onClick={authenticateForCardAccess}
                      disabled={authenticating}
                      variant="outline"
                      className="w-full"
                    >
                      {authenticating ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Authenticating...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          View/Edit Card Details
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="card_holder">Cardholder Name</Label>
                      <Input
                        id="card_holder"
                        placeholder="Name as printed on card"
                        value={editForm.payment_details?.card_holder || ''}
                        onChange={(e) => setEditForm((p) => ({
                          ...p,
                          payment_details: {
                            ...p.payment_details,
                            card_holder: e.target.value
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="card_number">Card Number</Label>
                      <Input
                        id="card_number"
                        placeholder="1234 5678 9012 3456"
                        value={editForm.payment_details?.card_number || ''}
                        onChange={(e) => setEditForm((p) => ({
                            ...p,
                            payment_details: {
                              ...p.payment_details,
                              card_number: e.target.value
                            }
                        }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry_date">Expiry Date</Label>
                        <Input
                          id="expiry_date"
                          placeholder="MM/YY"
                          value={editForm.payment_details?.expiry_date || ''}
                          onChange={(e) => setEditForm((p) => ({
                            ...p,
                            payment_details: {
                              ...p.payment_details,
                              expiry_date: e.target.value
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          type="password"
                          value={editForm.payment_details?.cvv || ''}
                          onChange={(e) => setEditForm((p) => ({
                            ...p,
                            payment_details: {
                              ...p.payment_details,
                              cvv: e.target.value
                            }
                          }))}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700">
                        <Save className="w-4 h-4 mr-1" /> 
                        {saving ? 'Saving...' : 'Save Card Details'}
                      </Button>
                      {showCardDetails && (
                        <Button
                          onClick={() => setShowCardDetails(false)}
                          variant="outline"
                          className="flex-1"
                        >
                          <Lock className="w-4 h-4 mr-1" /> Lock Details
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <AlertDialog open={showRechargeModal} onOpenChange={setShowRechargeModal}>
              <AlertDialogContent className="w-[90vw] max-w-sm rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Add Money to Wallet</AlertDialogTitle>
                  <AlertDialogDescription>
                    Enter the amount you'd like to add. This will be added to your available balance.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Label htmlFor="recharge_amount" className="text-sm font-medium">Amount (₹)</Label>
                  <Input
                    id="recharge_amount"
                    type="number"
                    placeholder="e.g., 500"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRechargeWallet}>
                    Proceed
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <span className="font-medium text-gray-700">Change Password</span>
                  <Button variant="outline">Change</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-700">Two-Factor Authentication</span>
                    {user?.two_factor_enabled && (
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => user?.two_factor_enabled ? setShowDisable2FA(true) : setShow2FASetup(true)}
                    className={user?.two_factor_enabled ? 'text-red-600 border-red-300 hover:bg-red-50' : ''}
                  >
                    {user?.two_factor_enabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 text-base font-semibold leading-none tracking-tight flex items-center gap-2">Delete Account</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <AlertDialogContent className="w-[90vw] max-w-sm rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    <strong>Warning:</strong> This action cannot be undone. All your data, bookings, and account information will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? "Deleting..." : "Yes, Delete My Account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>);

      default:
        return (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Identity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                   <input
                    type="file"
                    id="profile-photo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                  />
                  {editForm.profile_image ? (
                    <div className="relative group">
                      <label htmlFor="profile-photo-upload" className="cursor-pointer">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={editForm.profile_image} alt={user?.full_name} />
                          <AvatarFallback>{user?.full_name?.charAt(0) || editForm.first_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           {uploading ? (
                              <Loader className="w-5 h-5 text-white animate-spin" />
                           ) : (
                              <Camera className="w-5 h-5 text-white" />
                           )}
                        </div>
                      </label>
                    </div>
                   ) : (
                     <label htmlFor="profile-photo-upload" className="cursor-pointer">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex flex-col items-center justify-center border-2 border-dashed hover:bg-gray-200 transition-colors">
                          {uploading ? (
                              <Loader className="w-6 h-6 text-gray-500 animate-spin" />
                          ) : (
                              <>
                                  <Camera className="w-6 h-6 text-gray-500 mb-1" />
                                  <span className="text-xs text-gray-600 font-medium">Add Photo</span>
                              </>
                          )}
                        </div>
                     </label>
                   )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="text-sm font-medium text-gray-700 mb-1 block">First name *</label>
                    <Input
                      id="first_name"
                      placeholder="First name"
                      value={editForm.first_name || ''}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, first_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="last_name" className="text-sm font-medium text-gray-700 mb-1 block">Last name *</label>
                    <Input
                      id="last_name"
                      placeholder="Last name"
                      value={editForm.last_name || ''}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, last_name: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">Your email will be used to keep you informed of service developments.</p>
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
                  <Input
                    id="email"
                    placeholder="Email Address"
                    value={editForm.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Phone number</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">Your phone number can be used to log in to ChargePeer.</p>
                <div>
                  <label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1 block">Phone number *</label>
                  <div className="flex">
                    <div className="flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md text-sm text-gray-600">
                      +91
                    </div>
                    <Input
                      id="phone"
                      placeholder="Phone Number"
                      value={editForm.phone?.replace('+91', '') || ''}
                      onChange={(e) => {
                        const phoneValue = e.target.value.replace(/\D/g, '');
                        if (phoneValue.length <= 10) {
                          setEditForm((prev) => ({ ...prev, phone: phoneValue ? `+91${phoneValue}` : '' }));
                        }
                      }}
                      className="rounded-l-none"
                      maxLength={10}
                    />
                  </div>
                </div>

                {editForm.phone && editForm.phone.replace('+91', '').length > 0 && editForm.phone.replace('+91', '').length !== 10 && (
                  <div className="text-red-500 text-sm">
                    Phone number must be exactly 10 digits
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="address" className="text-sm font-medium text-gray-700 mb-1 block">Address *</label>
                  <Textarea
                    id="address"
                    placeholder="Your full address"
                    value={editForm.address || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
                    className="h-20"
                  />
                </div>
                
                {user?.app_role === 'host' && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="use_same_address"
                        checked={useSameAddress}
                        onCheckedChange={setUseSameAddress}
                      />
                      <Label htmlFor="use_same_address" className="text-sm">Use same address for billing</Label>
                    </div>
                    
                    {!useSameAddress && (
                      <div>
                        <label htmlFor="billing_address" className="text-sm font-medium text-gray-700 mb-1 block">Billing Address</label>
                        <Textarea
                          id="billing_address"
                          placeholder="Billing address (if different from above)"
                          value={editForm.billing_address || ''}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, billing_address: e.target.value }))}
                          className="h-20"
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mb-6">
              <p className="text-xs text-gray-500 mb-4">* Required fields</p>
              <Button 
                onClick={handleSaveProfile} 
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          </>
        );
    }
  };

  return (
    <>
      <div className="bg-gray-50 min-h-full p-4 lg:p-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={handleBackNavigation}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">{getPageTitle()}</h1>
          </div>
          {renderContent()}
        </div>
      </div>

      {show2FASetup && (
        <TwoFactorSetup
          onClose={() => setShow2FASetup(false)}
          onSuccess={handle2FASuccess}
        />
      )}

      {showDisable2FA && (
        <DisableTwoFactor
          onClose={() => setShowDisable2FA(false)}
          onSuccess={handle2FASuccess}
        />
      )}
    </>
  );
}
