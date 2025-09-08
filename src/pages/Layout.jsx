

import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Home,
  Calendar,
  User as UserIcon,
  Zap,
  PlusCircle,
  BarChart3,
  Menu,
  X,
  List,
  Search,
  MessageSquare,
  Smile
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { User, Message } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MessageToast from "@/components/notifications/MessageToast";

// Pages where users can function even with incomplete profiles
const allowedPagesWithIncompleteProfile = [
  'Home', 'HostDashboard', 'DriverDashboard', 'DriverProfile', 'HostProfile',
  'MyChargers', 'AddCharger', 'ChargerDetails', 'Messages', 'HostReservations',
  'AccountSettings', 'Onboarding', 'LegalNotice', 'TermsOfService', 'DriverCSU', 'HostCSU',
  'PrivacyPolicy', 'CookiesPolicy', 'ConfigureCookies'
];

// Function to check if user profile is complete - moved outside component to be a stable function
const isProfileComplete = (user) => {
  if (!user) return false;

  // Basic required fields for all users
  const hasBasicInfo = user.first_name && user.phone && user.address && user.app_role;

  if (!hasBasicInfo) return false;

  // Additional requirements for hosts
  if (user.app_role === 'host') {
    const hasHostRequirements = user.payment_details?.upi_id || user.bank_details?.account_number;
    return hasHostRequirements;
  }

  return true;
};

export default function Layout({ children, currentPageName, hideNav = false }) {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [hasUnreadMessages, setHasUnreadMessages] = React.useState(false);
  const [isNavVisible, setIsNavVisible] = React.useState(true);
  const [newNotification, setNewNotification] = React.useState(null);
  const notifiedMessageIdsRef = React.useRef(new Set());
  const isInitialFetch = React.useRef(true);
  const lastScrollY = React.useRef(0);
  const mainContentRef = React.useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Effect 1: User authentication and profile completion check
  React.useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser); // Update user state

        // Redirect logic
        const profileComplete = isProfileComplete(currentUser);
        const onAllowedPage = allowedPagesWithIncompleteProfile.includes(currentPageName);

        // Only redirect if user has no role (completely new)
        if (!currentUser.app_role && currentPageName !== 'Onboarding' && currentPageName !== 'AccountSettings') {
            console.log("User has no role, redirecting to onboarding");
            navigate(createPageUrl('Onboarding'));
        }
        // Only redirect for profile completion if user is NOT on an allowed page
        else if (currentUser.app_role && !profileComplete && !onAllowedPage) {
            console.log(`Redirecting from ${currentPageName} to AccountSettings because profile is incomplete.`);
            navigate(createPageUrl('AccountSettings'));
        }
        
      } catch (error) {
        console.warn("User not logged in or session expired.", error);
        setUser(null); // Set user to null if not logged in
        // For public pages, we don't need to do anything.
        // For protected pages, this could be where a redirect to a login page would happen
        // if the app wasn't handling it automatically.
      } finally {
        setLoading(false); // Always set loading to false after attempt
      }
    };
    checkUser();
  }, [currentPageName, location.key, navigate]);

  // Effect 2: Message notifications and polling (extracted from original useEffect)
  React.useEffect(() => {
    // Only fetch messages if user is logged in
    if (!user) {
      setHasUnreadMessages(false); // Clear messages if user logs out or isn't there
      return;
    }

    const fetchNotifications = async () => {
      try {
        const allMessages = await Message.list('-created_date', 100);
        const userMessages = allMessages.filter((msg) =>
          msg.sender_id === user.id || msg.receiver_id === user.id || msg.receiver_id === 'all_users'
        );
        const unreadMessages = userMessages.filter((msg) => !msg.is_read);
        setHasUnreadMessages(unreadMessages.length > 0);

        if (isInitialFetch.current) {
          userMessages.forEach((msg) => notifiedMessageIdsRef.current.add(msg.id));
          isInitialFetch.current = false;
        } else {
          const newUnseenMessages = userMessages.filter((msg) => !notifiedMessageIdsRef.current.has(msg.id));

          if (newUnseenMessages.length > 0) {
            const latestMessage = newUnseenMessages[0];
            setNewNotification(latestMessage);
            newUnseenMessages.forEach((msg) => notifiedMessageIdsRef.current.add(msg.id));
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchNotifications(); // Initial fetch
    const interval = setInterval(fetchNotifications, 15000); // Polling

    return () => clearInterval(interval); // Cleanup interval
  }, [user]); // Depend on 'user' state, so it re-runs if user changes (e.g., logs in/out)

  // Existing useEffect for Navbar visibility on scroll
  React.useEffect(() => {
    const mainEl = mainContentRef.current;

    const controlNavbar = () => {
      if (!mainEl) return;
      const currentScrollY = mainEl.scrollTop;

      if (currentScrollY < lastScrollY.current || currentScrollY < 10) {
        setIsNavVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsNavVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    if (mainEl) {
      mainEl.addEventListener('scroll', controlNavbar);
    }

    return () => {
      if (mainEl) {
        mainEl.removeEventListener('scroll', controlNavbar);
      }
    };
  }, []);

  // Existing useEffect for global navigation events
  React.useEffect(() => {
    const handleHideNav = () => setIsNavVisible(false);
    const handleShowNav = () => setIsNavVisible(true);

    window.addEventListener('hideNavigation', handleHideNav);
    window.addEventListener('showNavigation', handleShowNav);

    return () => {
      window.removeEventListener('hideNavigation', handleHideNav);
      window.removeEventListener('showNavigation', handleShowNav);
    };
  }, []);

  const getMobileNavItems = () => {
    if (!user) return [];

    if (user.app_role === 'host') {
      return [
        { title: "Dashboard", pageNames: ["HostDashboard", "HostReservations"], url: createPageUrl("HostDashboard"), icon: BarChart3 },
        { title: "Chargers", pageNames: ["MyChargers", "AddCharger", "ChargerDetails"], url: createPageUrl("MyChargers"), icon: List },
        { title: "Messages", pageNames: ["Messages"], url: createPageUrl("Messages"), icon: MessageSquare, hasNotification: hasUnreadMessages },
        { title: "Profile", pageNames: ["HostProfile", "AccountSettings"], url: createPageUrl("HostProfile"), icon: Smile }
      ];
    }

    return [
      { title: "Search", pageNames: ["Home", "ChargerDetails"], url: createPageUrl("Home"), icon: Search },
      { title: "Reservations", pageNames: ["DriverDashboard", "Booking"], url: createPageUrl("DriverDashboard"), icon: Zap },
      { title: "Messages", pageNames: ["Messages"], url: createPageUrl("Messages"), icon: MessageSquare, hasNotification: hasUnreadMessages },
      { title: "Profile", pageNames: ["DriverProfile", "AccountSettings"], url: createPageUrl("DriverProfile"), icon: Smile }
    ];
  };

  const mobileNavItems = getMobileNavItems();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700">
        <p>Loading application data...</p>
      </div>
    );
  }

  if (currentPageName === 'Onboarding') {
    return <>{children}</>;
  }

  const navClasses = `fixed bottom-0 left-0 right-0 bg-white/20 backdrop-blur-xl text-gray-800 h-16 flex justify-around items-center z-[9999] border-t border-white/30 shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${isNavVisible && !hideNav ? 'translate-y-0' : 'translate-y-full'}`;

  const finalNavClasses = currentPageName === 'Home'
    ? navClasses
    : `${navClasses} rounded-t-3xl`;


  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <MessageToast
        message={newNotification}
        onDismiss={() => setNewNotification(null)} />

      <main ref={mainContentRef} className="bg-gray-50 flex-grow overflow-y-auto">
        {children}
      </main>

      <nav className={finalNavClasses}>
        {mobileNavItems.map((item) => {
          const isActive = item.pageNames.includes(currentPageName);
          return (
            <Link
              key={item.title}
              to={item.url} className="text-slate-950 flex flex-col items-center justify-center w-full h-full transition-all duration-200 hover:text-gray-800 hover:bg-white/10 rounded-xl">

              <div className="relative">
                <item.icon className="w-6 h-6" />
                {item.hasNotification &&
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
                }
              </div>
              <span className="text-xs mt-1">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

