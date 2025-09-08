
import React, { useState, useEffect } from "react";
import { User, Booking, Charger } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowRight,
  ChevronRight,
  User as UserIcon,
  CreditCard,
  Shield,
  HelpCircle,
  LogOut,
  Loader,
  FileText,
  BookOpen,
  MessageSquare,
  Scale,
  Fingerprint,
  Cookie,
  Settings2,
  FileLock,
  Bell, // Added for notifications section
  TrendingUp, // Added for activity summary title and earned stat
  Zap, // Added for avatar decoration
  Calendar, // Added for reservations stat
  Clock // Added for charge hours stat
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import NotificationSettings from "../components/profile/NotificationSettings";

// Updated StatCard to accept icon and color for visual appeal
const StatCard = ({ value, label, icon, color }) => (
  <div className="text-center">
    <div className={`p-3 ${color} rounded-xl mb-2 inline-block`}>
      {icon}
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-sm text-gray-300">{label}</div>
  </div>
);

export default function HostProfilePage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    reservations: 0,
    chargeHours: 0,
    earned: 0
  });
  const [loading, setLoading] = useState(true);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false); // New state for Notifications section
  const navigate = useNavigate();

  useEffect(() => {
    loadHostData();
  }, []);

  const loadHostData = async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      const hostChargers = await Charger.filter({ host_id: userData.id });
      const chargerIds = hostChargers.map((c) => c.id);

      if (chargerIds.length > 0) {
        const allBookings = await Booking.list('-created_date', 200);
        const hostBookings = allBookings.filter((b) => chargerIds.includes(b.charger_id) && b.status === 'completed');

        const totalReservations = hostBookings.length;
        const totalEarnings = hostBookings.reduce((sum, b) => sum + (b.host_earnings || 0), 0);
        const totalHours = hostBookings.reduce((sum, b) => {
          const start = new Date(b.start_time);
          const end = new Date(b.end_time);
          return sum + (end - start) / (1000 * 60 * 60);
        }, 0);

        setStats({
          reservations: totalReservations,
          chargeHours: totalHours.toFixed(1),
          earned: totalEarnings.toFixed(2)
        });
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
      await User.login();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await User.logout();
    setIsLoggedOut(true);
  };

  const handleLoginAgain = async () => {
    await User.login();
  };

  const handleSwitchToDriver = async () => {
    if (switchingRole) return;
    setSwitchingRole(true);
    try {
      await User.updateMyUserData({ app_role: 'driver' });
      navigate(createPageUrl('Home'));
    } catch (error) {
      console.error("Failed to switch role:", error);
    } finally {
      setSwitchingRole(false);
    }
  };

  const isProfileComplete = user?.bank_details?.account_holder && user?.bank_details?.account_number;

  if (isLoggedOut) {
    return (
      <div className="bg-gray-50 min-h-full flex items-center justify-center">
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

  if (loading) {
    return (
      <div className="p-4 space-y-6 animate-pulse">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-green-50 via-white to-blue-50 min-h-full">
      <div className="p-5 pb-24 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20 border-4 border-white shadow-xl ring-2 ring-green-100">
                <AvatarImage src={user?.profile_image || `https://avatar.vercel.sh/${user?.email}.png`} alt={user?.full_name} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-green-400 to-blue-500 text-white">
                  {user?.full_name?.charAt(0) || 'H'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {user?.full_name || 'Host'}
              </h1>
              <p className="text-sm text-green-600 font-medium">Host Profile</p>
            </div>
          </div>
        </div>

        {/* Profile Completion Alert */}
        {!isProfileComplete &&
          <Card className="bg-gradient-to-r from-red-500 to-pink-600 text-white border-0 shadow-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold">Complete your profile</h3>
                <div className="bg-white/20 backdrop-blur rounded-full px-3 py-1">
                  <span className="text-sm font-semibold">Required</span>
                </div>
              </div>
              <p className="text-white/90 mb-4 text-sm">You must complete your profile so that drivers can reserve your station.</p>
              <Button variant="secondary" className="w-full bg-white text-red-600 hover:bg-gray-50" onClick={() => navigate(createPageUrl('AccountSettings?view=payment'))}>
                Complete Now
              </Button>
            </CardContent>
          </Card>
        }

        {/* Switch to Driver Mode */}
        <Card
          className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all cursor-pointer"
          onClick={handleSwitchToDriver}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <UserIcon className="w-6 h-6" />
              </div>
              <span className="text-lg font-semibold">Switch to driver mode</span>
            </div>
            {switchingRole ?
              <Loader className="w-6 h-6 animate-spin" /> :
              <ArrowRight className="w-6 h-6" />
            }
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" />
              <h2 className="text-xl font-bold">My activity summary</h2>
            </div>
            <p className="text-white/80 text-sm mb-6">{format(new Date(), 'MMMM yyyy')}</p>
            <div className="grid grid-cols-3 gap-6">
              <StatCard 
                value={stats.reservations} 
                label="Reservations" 
                icon={<Calendar className="w-5 h-5 text-blue-600" />}
                color="bg-blue-100"
              />
              <StatCard 
                value={stats.chargeHours} 
                label="Charge hours" 
                icon={<Clock className="w-5 h-5 text-purple-600" />}
                color="bg-purple-100"
              />
              <StatCard 
                value={`₹${stats.earned}`} 
                label="Earned" 
                icon={<TrendingUp className="w-5 h-5 text-green-600" />}
                color="bg-green-100"
              />
            </div>
          </CardContent>
        </Card>

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
                        <span className="font-medium text-gray-700 text-sm group-hover:text-gray-900">My information</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </Link>
                    <Link to={createPageUrl("AccountSettings?view=payment")} className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                        <span className="font-medium text-gray-700 text-sm group-hover:text-gray-900">Bank details</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </Link>
                    <Link to={createPageUrl("AccountSettings?view=billing")} className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                        <span className="font-medium text-gray-700 text-sm group-hover:text-gray-900">Transaction History</span>
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
                    <Link to={createPageUrl("HostCSU")} className="flex items-center justify-between p-3 rounded-lg hover:bg-orange-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-4 h-4 text-gray-500 group-hover:text-orange-600 transition-colors" />
                        <span className="font-medium text-gray-700 text-sm group-hover:text-gray-900">Host CSU</span>
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
            className="bg-gradient-to-r from-red-50 to-pink-50 text-red-600 border border-red-200 hover:from-red-100 hover:to-pink-100 hover:text-red-700 shadow-sm px-8 py-3"
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
