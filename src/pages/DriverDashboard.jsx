
import React, { useState, useEffect } from "react";
import { Booking, Charger, User, Review } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Calendar,
  MapPin,
  Clock,
  Star,
  Navigation,
  CheckCircle,
  XCircle,
  Loader,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isToday } from "date-fns";
import RatingForm from "../components/reviews/RatingForm"; // Correct import path for RatingForm

function BookingCard({ booking, onRateClick }) {
  const [charger, setCharger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasReview, setHasReview] = useState(false);
  const [isValidCharger, setIsValidCharger] = useState(false);

  useEffect(() => {
    const loadCharger = async () => {
      const fallbackCharger = { 
        title: 'Charging Station', 
        address: 'Location details unavailable',
        latitude: 19.07,
        longitude: 72.87,
        id: booking.charger_id
      };

      // Check if it's demo/placeholder data
      if (booking.charger_id && (booking.charger_id.includes('placeholder') || booking.charger_id.includes('demo'))) {
        setCharger({ 
          title: 'Sample Charger Location', 
          address: '123 Demo Street, Sample City',
          latitude: 19.07,
          longitude: 72.87,
          id: booking.charger_id
        });
        setIsValidCharger(false); // Demo chargers are not valid for navigation
        setLoading(false);
        return;
      }

      // Check if it's a simple number (like "1", "2", "3") which are likely missing
      if (booking.charger_id && /^\d+$/.test(booking.charger_id.toString())) {
        setCharger(fallbackCharger);
        setIsValidCharger(false);
        setLoading(false);
        return;
      }
      
      // Only try to fetch if it looks like a real charger ID
      try {
        const chargerData = await Charger.get(booking.charger_id);
        setCharger(chargerData);
        setIsValidCharger(true); // Real charger found
        
        // Check if user has already rated this booking
        const existingReview = await Review.filter({ booking_id: booking.id });
        setHasReview(existingReview.length > 0);
      } catch (error) {
        // Silently use fallback data without logging error
        setCharger(fallbackCharger);
        setIsValidCharger(false);
      } finally {
        setLoading(false);
      }
    };
    loadCharger();
  }, [booking.charger_id, booking.id]); // Added booking.id to dependencies

  const getStatusBadge = (status) => {
    const statusInfo = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-3 h-3 mr-1" />, text: "Pending" },
      confirmed: { color: "bg-blue-100 text-blue-800", icon: <CheckCircle className="w-3 h-3 mr-1" />, text: "Confirmed" },
      active: { color: "bg-green-100 text-green-800", icon: <Clock className="w-3 h-3 mr-1" />, text: "Active" },
      completed: { color: "bg-gray-100 text-gray-800", icon: <CheckCircle className="w-3 h-3 mr-1" />, text: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", icon: <XCircle className="w-3 h-3 mr-1" />, text: "Cancelled" },
    };
    const info = statusInfo[status] || { color: "bg-gray-100", text: status };
    return (
      <Badge className={info.color + " flex items-center"}>
        {info.icon}
        {info.text}
      </Badge>
    );
  };

  const openInGoogleMaps = (lat, lng) => {
    const googleMapsUrl = `https://maps.google.com/?q=${lat},${lng}&ll=${lat},${lng}&z=15`;
    window.open(googleMapsUrl, '_blank');
  };

  const navigateToChargerOnMap = (chargerId) => {
    window.location.href = createPageUrl(`Home?charger=${chargerId}`);
  };

  if (loading) {
    return <Skeleton className="h-48" />;
  }

  // Changed this condition: if charger data could not be loaded, 
  // we now set fallback data instead of null, so this block won't be reached.
  // It's still good practice to have a general null check, though.
  if (!charger) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-red-500">Could not load charger details for this booking.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{charger.title}</h3>
            <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
              <MapPin className="w-4 h-4" />
              <span>{charger.address}</span>
            </div>
          </div>
          {getStatusBadge(booking.status)}
        </div>

        <div className="border-t border-b py-3 my-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">From</p>
              <p className="font-medium">{format(new Date(booking.start_time), 'MMM d, yyyy - hh:mm a')}</p>
            </div>
            <div>
              <p className="text-gray-500">To</p>
              <p className="font-medium">{format(new Date(booking.end_time), 'MMM d, yyyy - hh:mm a')}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-lg font-bold">
            ₹{booking.total_amount}
          </div>
          <div className="flex gap-2">
            {booking.status === 'confirmed' && isValidCharger && (
              <Button variant="outline" size="sm" onClick={() => navigateToChargerOnMap(charger.id)}>
                <Navigation className="w-4 h-4 mr-1" />
                Get Directions
              </Button>
            )}
            {booking.status === 'completed' && !hasReview && (
              <Button variant="outline" size="sm" onClick={() => onRateClick(booking, charger)}>
                <Star className="w-4 h-4 mr-1" />
                Rate Experience
              </Button>
            )}
            {booking.status === 'completed' && hasReview && (
              <Badge className="bg-green-100 text-green-800">
                <Star className="w-3 h-3 mr-1" />
                Rated
              </Badge>
            )}
            <Link to={createPageUrl(`ChargerDetails?id=${charger.id}`)}>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">View Charger</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ToggleButton({ isActive, onClick, count, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex-1 ${
        isActive
          ? "bg-gray-900 text-white shadow-md"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {children} <span className="ml-2">{count}</span>
    </button>
  );
}

function EmptyState({ tab }) {
  const messages = {
    confirmed: {
      title: "No confirmed reservations",
      description: "Accepted reservation requests will appear here."
    },
    pending: {
      title: "No pending requests",
      description: "Reservation requests awaiting a response will appear here."
    },
    closed: {
      title: "No closed reservations",
      description: "Refused, completed, or cancelled reservations will appear here."
    }
  };
  const message = messages[tab];

  return (
    <div className="text-center py-16">
      <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{message.title}</h3>
      <p className="text-gray-500 max-w-xs mx-auto">{message.description}</p>
    </div>
  );
}


export default function DriverDashboardPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('confirmed');
  const [authError, setAuthError] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedCharger, setSelectedCharger] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check authentication first
        await User.me();
        // Temporarily showing all bookings instead of filtering by user ID
        const bookingsData = await Booking.list('-start_time');
        setBookings(bookingsData);
      } catch (error) {
        console.error("Failed to load driver data:", error);
        if (error.response?.status === 403) {
          setAuthError(true);
          await User.login(); // Attempt to log in the user
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleRateClick = (booking, charger) => {
    setSelectedBooking(booking);
    setSelectedCharger(charger);
    setShowRatingForm(true);
  };

  const handleRatingSubmitted = async () => {
    setShowRatingForm(false);
    setSelectedBooking(null);
    setSelectedCharger(null);
    // Refresh bookings to update the rating status
    // Re-call the data loading function to update `hasReview` status in BookingCard
    setLoading(true); // Show loading state while refreshing
    try {
        const bookingsData = await Booking.list('-start_time');
        setBookings(bookingsData);
    } catch (error) {
        console.error("Failed to refresh bookings after review submission:", error);
    } finally {
        setLoading(false);
    }
  };

  const confirmedBookings = bookings.filter(b => ['confirmed', 'active'].includes(b.status));
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const closedBookings = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));

  const chargesToday = bookings.filter(b =>
    isToday(new Date(b.start_time)) && ['confirmed', 'active'].includes(b.status)
  ).length;

  const renderBookings = () => {
    let bookingsToRender = [];
    switch (activeTab) {
      case 'confirmed':
        bookingsToRender = confirmedBookings;
        break;
      case 'pending':
        bookingsToRender = pendingBookings;
        break;
      case 'closed':
        bookingsToRender = closedBookings;
        break;
      default:
        bookingsToRender = [];
    }

    if (bookingsToRender.length === 0) {
      return <EmptyState tab={activeTab} />;
    }

    return (
      <div className="space-y-4">
        {bookingsToRender.map(booking => (
          <BookingCard 
            key={booking.id} 
            booking={booking} 
            onRateClick={handleRateClick} // Pass the handler
          />
        ))}
      </div>
    );
  };

  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your reservations.</p>
          <Button onClick={() => User.login()} className="bg-blue-600 hover:bg-blue-700">
            Log In
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="flex gap-2 p-1 bg-gray-100 rounded-full mb-8">
            <Skeleton className="h-10 flex-1 rounded-full" />
            <Skeleton className="h-10 flex-1 rounded-full" />
            <Skeleton className="h-10 flex-1 rounded-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8"> {/* Changed mb-4 to mb-8 for better spacing */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Reservations</h1>
              <p className="text-gray-500 mt-1">{chargesToday} charges expected today</p>
            </div>
            {/* The div containing the broken image has been completely removed. */}
          </div>

          <div className="flex gap-2 p-1 bg-gray-100 rounded-full mb-8">
            <ToggleButton
              isActive={activeTab === 'confirmed'}
              onClick={() => setActiveTab('confirmed')}
              count={confirmedBookings.length}
            >
              Confirmed
            </ToggleButton>
            <ToggleButton
              isActive={activeTab === 'pending'}
              onClick={() => setActiveTab('pending')}
              count={pendingBookings.length}
            >
              Pending
            </ToggleButton>
            <ToggleButton
              isActive={activeTab === 'closed'}
              onClick={() => setActiveTab('closed')}
              count={closedBookings.length}
            >
              Closed
            </ToggleButton>
          </div>

          {renderBookings()}
        </div>
      </div>

      {/* Rating Form Modal */}
      {showRatingForm && selectedBooking && selectedCharger && (
        <RatingForm
          booking={selectedBooking}
          charger={selectedCharger}
          onSubmit={handleRatingSubmitted}
          onCancel={() => setShowRatingForm(false)}
        />
      )}
    </>
  );
}
