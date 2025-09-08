
import React, { useState, useEffect } from "react";
import { User, Charger } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Circle,
  CheckCircle,
  Zap,
  Loader,
  HelpCircle,
  LogOut,
  FileText,
  BookOpen,
  MessageSquare,
  User as UserIcon,
  CreditCard,
  Shield,
  Scale,
  Fingerprint,
  Cookie,
  Settings2,
  FileLock,
  Bell // Added Bell icon
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import NotificationSettings from "../components/profile/NotificationSettings";

function ProfileChecklistItem({ text, isCompleted, onClick }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-3">
        {isCompleted ?
          <CheckCircle className="w-6 h-6 text-green-300" /> :
          <Circle className="w-6 h-6 text-white/70" />
        }
        <span className={`${isCompleted ? 'text-white/80' : 'text-white font-medium'}`}>{text}</span>
      </div>
      {!isCompleted &&
        <button onClick={onClick} className="px-3 py-1 text-sm font-medium text-orange-600 bg-white rounded-full hover:bg-gray-100 transition-colors">
          Complete
        </button>
      }
    </div>
  );
}

export default function DriverProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasChargers, setHasChargers] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false); // New state for Legal section
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false); // New state for Privacy section
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false); // New state for Notifications section
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      const userChargers = await Charger.filter({ host_id: userData.id }, '-created_date', 1);
      setHasChargers(userChargers.length > 0);

    } catch (error) {
      console.error("Failed to load user data:", error);
      await User.login();
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToHost = async () => {
    if (switchingRole) return;
    setSwitchingRole(true);
    try {
      await User.updateMyUserData({ app_role: 'host' });
      navigate(createPageUrl('HostProfile'));
    } catch (error) {
      console.error("Failed to switch role to host:", error);
    } finally {
      setSwitchingRole(false);
    }
  };

  const handleLogout = async () => {
    await User.logout();
    setIsLoggedOut(true);
  };

  const handleLoginAgain = async () => {
    await User.login();
  };

  const isProfileComplete = user?.full_name && user?.phone && user?.address;
  const isVerified = user?.is_verified === true;

  if (loading) {
    return (
      <div className="p-4 space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="w-36 h-20" />
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (!user && !isLoggedOut) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Could not load user profile.</p>
      </div>
    );
  }

  if (isLoggedOut) {
    return (
      <div className="bg-white min-h-full flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">You've been logged out</h2>
          <p className="text-gray-600 mb-6">Thanks for using ChargePeer!</p>
          <Button onClick={handleLoginAgain} className="bg-blue-600 hover:bg-blue-700">
            Login Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-full">
      <div className="p-5 pb-24 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20 border-4 border-white shadow-xl ring-2 ring-blue-100">
                <AvatarImage src={user?.profile_image || `https://images.unsplash.com/photo-1639747280804-dd2d6b3d88ac?q=80&w=250&h=250&auto=format&fit=crop`} alt={user?.full_name} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                  {user?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {user?.full_name || 'New User'}
              </h1>
              <Link to={createPageUrl(`AccountSettings`)} className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium">
                View my public profile
              </Link>
            </div>
          </div>
        </div>

        {/* Refer Banner */}
        <Link to="#" className="block">
          <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a832ad0722d741fc6f135b/db9d34068_WhatsAppImage2025-09-03at075253.jpg"
              alt="Refer a Friend"
              className="w-full hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
          </div>
        </Link>

        {/* Profile Completion Card */}
        <Card className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold">Complete your driver profile</h3>
              <div className="bg-white/20 backdrop-blur rounded-full px-3 py-1">
                <span className="text-sm font-semibold">20% OFF</span>
              </div>
            </div>
            <p className="text-white/90 mb-6 text-sm">and benefit from a 20% discount</p>
            <div className="space-y-3 mb-6">
              <ProfileChecklistItem text="Complete my profile" isCompleted={isProfileComplete} onClick={() => navigate(createPageUrl("AccountSettings"))} />
              <ProfileChecklistItem text="Verify my identity" isCompleted={isVerified} onClick={() => navigate(createPageUrl("AccountSettings?view=verification"))} />
            </div>
          </CardContent>
        </Card>

        {/* Switch to Host Card */}
        {user?.app_role === 'driver' && (
          hasChargers ?
            <Card className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1" onClick={handleSwitchToHost}>
              <CardContent className="p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Zap className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-semibold">Switch to host mode</span>
                </div>
                {switchingRole ?
                  <Loader className="w-6 h-6 animate-spin" /> :
                  <ArrowRight className="w-6 h-6" />
                }
              </CardContent>
            </Card> :
            <Link to={createPageUrl("HostDashboard")}>
              <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <CardContent className="p-5 flex items-center gap-4 text-white">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <img src="https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=60&h=60&auto=format&fit=crop" alt="Charging Station" className="w-12 h-12 rounded-lg" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-bold mb-1">Do you have a charging station?</p>
                    <p className="text-white/90 text-sm">List it and generate income.</p>
                  </div>
                  <ChevronRight className="w-6 h-6" />
                </CardContent>
              </Card>
            </Link>
        )}

        {/* Account Settings */}
        <div className="pt-2">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Account settings</h2>
          <div className="space-y-3">
            {/* Personal Information */}
            <div className="bg-white rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <button
                onClick={() => setIsPersonalInfoOpen(!isPersonalInfoOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-800">Personal information</span>
                </div>
                <ChevronRight className={`w-5 h-5 text-blue-600 transition-transform ${isPersonalInfoOpen ? 'rotate-90' : ''}`} />
              </button>
              {isPersonalInfoOpen && (
                <div className="px-4 pb-4">
                  <div className="border-t border-blue-100 pt-3 space-y-1">
                    <Link to={createPageUrl("AccountSettings")} className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <UserIcon className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                        <span className="font-medium text-gray-700 text-sm group-hover:text-gray-900">Profile</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </Link>
                    <Link to={createPageUrl("AccountSettings?view=payment")} className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                        <span className="font-medium text-gray-700 text-sm group-hover:text-gray-900">Payment methods</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </Link>
                    <Link to={createPageUrl("AccountSettings?view=billing")} className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                        <span className="font-medium text-gray-700 text-sm group-hover:text-gray-900">Billing History</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </Link>
                    <Link to={createPageUrl("AccountSettings?view=security")} className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                        <span className="font-medium text-gray-700 text-sm group-hover:text-gray-900">Security</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Bell className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-semibold text-gray-800">Notifications</span>
                </div>
                <ChevronRight className={`w-5 h-5 text-purple-600 transition-transform ${isNotificationsOpen ? 'rotate-90' : ''}`} />
              </button>
              {isNotificationsOpen && (
                <div className="px-4 pb-4">
                  <NotificationSettings user={user} />
                </div>
              )}
            </div>

            {/* Legal */}
            <div className="bg-white rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
              <button
                onClick={() => setIsLegalOpen(!isLegalOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Scale className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="font-semibold text-gray-800">Legal</span>
                </div>
                <ChevronRight className={`w-5 h-5 text-orange-600 transition-transform ${isLegalOpen ? 'rotate-90' : ''}`} />
              </button>
              {isLegalOpen && (
                <div className="px-4 pb-4">
                  <div className="border-t border-orange-100 pt-3 space-y-1">
                    <Link to={createPageUrl("LegalNotice")} className="flex items-center justify-between p-3 rounded-lg hover:bg-orange-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-500 group-hover:text-orange-600 transition-colors" />
                        <span className="font-medium text-gray-700 text-sm group-hover:text-gray-900">Legal Notice</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
                    </Link>
                    <Link to={createPageUrl("TermsOfService")} className="flex items-center justify-between p-3 rounded-lg hover:bg-orange-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-4 h-4 text-gray-500 group-hover:text-orange-600 transition-colors" />
                        <span className="font-medium text-gray-700 text-sm group-hover:text-gray-900">General Terms & Conditions</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
                    </Link>
                    <Link to={createPageUrl("DriverCSU")} className="flex items-center justify-between p-3 rounded-lg hover:bg-orange-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-4 h-4 text-gray-500 group-hover:text-orange-600 transition-colors" />
                        <span className="font-medium text-gray-700 text-sm group-hover:text-gray-900">Driver CSU</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Privacy */}
            <div className="bg-white rounded-xl border border-teal-100 shadow-sm hover:shadow-md transition-shadow">
              <button
                onClick={() => setIsPrivacyOpen(!isPrivacyOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Fingerprint className="w-5 h-5 text-teal-600" />
                  </div>
                  <span className="font-semibold text-gray-800">Privacy</span>
                </div>
                <ChevronRight className={`w-5 h-5 text-teal-600 transition-transform ${isPrivacyOpen ? 'rotate-90' : ''}`} />
              </button>
              {isPrivacyOpen && (
                <div className="px-4 pb-4">
                  <div className="border-t border-teal-100 pt-3 space-y-1">
                    <Link to={createPageUrl("CookiesPolicy")} className="flex items-center justify-between p-3 rounded-lg hover:bg-teal-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <Cookie className="w-4 h-4 text-gray-500 group-hover:text-teal-600 transition-colors" />
                        <span className="font-medium text-gray-700 text-sm group-hover:text-gray-900">Cookies and trackers policy</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
                    </Link>
                    <Link to={createPageUrl("ConfigureCookies")} className="flex items-center justify-between p-3 rounded-lg hover:bg-teal-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <Settings2 className="w-4 h-4 text-gray-500 group-hover:text-teal-600 transition-colors" />
                        <span className="font-medium text-gray-700 text-sm group-hover:text-gray-900">Configure my cookies and trackers</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
                    </Link>
                    <Link to={createPageUrl("PrivacyPolicy")} className="flex items-center justify-between p-3 rounded-lg hover:bg-teal-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <FileLock className="w-4 h-4 text-gray-500 group-hover:text-teal-600 transition-colors" />
                        <span className="font-medium text-gray-700 text-sm group-hover:text-gray-900">Personal data policy</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Help Center */}
            <div className="bg-white rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
              <button
                onClick={() => setIsHelpOpen(!isHelpOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <HelpCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="font-semibold text-gray-800">Help center</span>
                </div>
                <ChevronRight className={`w-5 h-5 text-emerald-600 transition-transform ${isHelpOpen ? 'rotate-90' : ''}`} />
              </button>
              {isHelpOpen && (
                <div className="px-4 pb-4">
                  <div className="border-t border-emerald-100 pt-3 space-y-1">
                    <Link to="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-emerald-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-gray-500 group-hover:text-emerald-600 transition-colors" />
                        <span className="font-medium text-gray-700 text-sm group-hover:text-gray-900">FAQ</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </Link>
                    <Link to="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-emerald-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-gray-500 group-hover:text-emerald-600 transition-colors" />
                        <span className="font-medium text-gray-700 text-sm group-hover:text-gray-900">Contact customer service</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-6 flex justify-center">
          <Button 
            variant="ghost" 
            className="bg-gradient-to-r from-red-50 to-pink-50 text-red-600 border border-red-200 hover:from-red-100 hover:to-pink-100 hover:text-red-700 shadow-sm"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-semibold">Log out</span>
          </Button>
        </div>

      </div>
    </div>
  );
}
