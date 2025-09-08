
import React, { useState, useEffect } from "react";
import { Booking, Charger, User } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  MapPin, 
  Clock, 
  CheckCircle,
  XCircle,
  Loader,
  Zap,
  Check,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isToday } from "date-fns";

function HostBookingCard({ booking, onStatusChange }) {
  const [charger, setCharger] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const [chargerData, driverData] = await Promise.all([
          Charger.get(booking.charger_id),
          User.get(booking.driver_id),
        ]);
        setCharger(chargerData);
        setDriver(driverData);
      } catch (error) {
        console.error("Failed to load booking details", error);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [booking.charger_id, booking.driver_id]);

  const getStatusBadge = (status) => {
    const statusInfo = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      confirmed: { color: "bg-blue-100 text-blue-800", text: "Confirmed" },
      active: { color: "bg-green-100 text-green-800", text: "Active" },
      completed: { color: "bg-gray-100 text-gray-800", text: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", text: "Cancelled" },
    };
    const info = statusInfo[status] || { color: "bg-gray-100", text: status };
    return <Badge className={info.color}>{info.text}</Badge>;
  };

  if (loading) {
    return <Skeleton className="h-48" />;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{charger?.title || 'Charger'}</h3>
            <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
              {driver && <span className="font-medium">{driver.full_name}</span>}
            </div>
          </div>
          {getStatusBadge(booking.status)}
        </div>

        <div className="border-t border-b py-3 my-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">From</p>
              <p className="font-medium">{format(new Date(booking.start_time), 'MMM d, hh:mm a')}</p>
            </div>
            <div>
              <p className="text-gray-500">To</p>
              <p className="font-medium">{format(new Date(booking.end_time), 'MMM d, hh:mm a')}</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
            <div>
                 <p className="text-gray-500 text-sm">Your Earnings</p>
                 <p className="text-lg font-bold">₹{booking.host_earnings?.toFixed(2) || '0.00'}</p>
            </div>
          {booking.status === 'pending' && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => onStatusChange(booking.id, 'cancelled')}>
                <X className="w-4 h-4 mr-1" />
                Reject
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onStatusChange(booking.id, 'confirmed')}>
                <Check className="w-4 h-4 mr-1" />
                Accept
              </Button>
            </div>
          )}
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
      description: "New reservation requests will appear here for you to accept or reject."
    },
    closed: {
      title: "No closed reservations",
      description: "Your rejected, completed, or cancelled reservations will appear here."
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

export default function HostReservationsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      const hostChargers = await Charger.filter({ host_id: user.id });
      const chargerIds = hostChargers.map(c => c.id);
      
      if (chargerIds.length > 0) {
        // This is not ideal, but we'll filter client side as there is no server-side `in` filter
        const allBookings = await Booking.list('-created_date', 200);
        const hostBookings = allBookings.filter(b => chargerIds.includes(b.charger_id));
        setBookings(hostBookings);
      } else {
        setBookings([]); // If no chargers, no bookings
      }
    } catch (error) {
      console.error("Failed to load host data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
        await Booking.update(bookingId, { status: newStatus });
        loadData(); // Refresh data after update
    } catch (error) {
        console.error(`Failed to update booking ${bookingId} to ${newStatus}`, error);
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
          <HostBookingCard key={booking.id} booking={booking} onStatusChange={handleStatusChange} />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-24 w-full mb-8" />
          <Skeleton className="h-12 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Reservations</h1>
            <p className="text-gray-500 mt-1">{chargesToday} charges expected today</p>
          </div>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden">
             <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/5ca3fd7c6_3896559.jpg" alt="Reservations" className="w-full h-full object-cover"/>
          </div>
        </div>

        <div className="flex gap-2 p-1 bg-gray-100 rounded-full mb-8">
          <ToggleButton 
            isActive={activeTab === 'pending'} 
            onClick={() => setActiveTab('pending')}
            count={pendingBookings.length}
          >
            Pending
          </ToggleButton>
          <ToggleButton 
            isActive={activeTab === 'confirmed'} 
            onClick={() => setActiveTab('confirmed')}
            count={confirmedBookings.length}
          >
            Confirmed
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
  );
}
