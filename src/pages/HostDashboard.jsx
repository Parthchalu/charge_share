
import React, { useState, useEffect } from "react";
import { Charger, Booking, User } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Plus, 
  Zap, 
  IndianRupee, // Changed from DollarSign to IndianRupee for Rupiah symbol
  Calendar, 
  Eye,
  Edit,
  ToggleLeft,
  ToggleRight,
  Star,
  MapPin,
  Clock,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function HostDashboardPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [chargers, setChargers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    thisMonthBookings: 0,
    activeChargers: 0,
    avgRating: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Load chargers for this host
      const chargersData = await Charger.filter({ host_id: user.id }, '-created_date', 20);
      setChargers(chargersData);

      // Load bookings for the chargers (simplified - get all recent bookings)
      try {
        const bookingsData = await Booking.list('-created_date', 50);
        // Filter bookings that belong to this host's chargers
        const hostBookings = bookingsData.filter(booking => 
          chargersData.some(charger => charger.id === booking.charger_id)
        );
        setBookings(hostBookings);

        // Calculate stats
        const totalEarnings = hostBookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.host_earnings || 0), 0);

        const thisMonth = new Date();
        thisMonth.setDate(1);
        const thisMonthBookings = hostBookings
          .filter(b => new Date(b.created_date) >= thisMonth).length;

        const activeChargers = chargersData.filter(c => c.is_active).length;
        
        const ratedChargers = chargersData.filter(c => c.rating > 0);
        const totalRating = ratedChargers.reduce((sum, c) => sum + (c.rating || 0), 0);
        const avgRating = ratedChargers.length > 0 ? totalRating / ratedChargers.length : 0;

        setStats({
          totalEarnings,
          thisMonthBookings,
          activeChargers,
          avgRating
        });
      } catch (bookingError) {
        console.warn("Could not load bookings:", bookingError);
        setBookings([]);
      }

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      active: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <Skeleton className="h-8 w-1/3" />
            <div className="grid lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Host Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your charging stations and bookings</p>
          </div>
          <Link to={createPageUrl("AddCharger")}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New Charger
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <IndianRupee className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From completed bookings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonthBookings}</div>
              <p className="text-xs text-muted-foreground">
                New bookings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Chargers</CardTitle>
              <Zap className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeChargers}</div>
              <p className="text-xs text-muted-foreground">
                Out of {chargers.length} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Across all chargers
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Chargers */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>My Charging Stations</CardTitle>
                <Link to={createPageUrl("MyChargers")}>
                  <Button variant="link" className="text-blue-600">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {chargers.length > 0 ? (
                  <div className="space-y-4">
                    {chargers.slice(0, 3).map((charger) => (
                      <div key={charger.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{charger.title}</h3>
                          </div>
                          <div className={`text-sm font-medium ${charger.is_active ? 'text-green-600' : 'text-red-600'}`}>
                            {charger.is_active ? '● Active' : '● Inactive'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{charger.address}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{charger.connector_type}</Badge>
                            <Badge variant="outline">
                              <Zap className="w-3 h-3 mr-1" />
                              {charger.power_kw} kW
                            </Badge>
                            <Badge variant="outline">₹{charger.price_per_hour}/hr</Badge>
                          </div>
                          <div className="flex gap-2">
                            <Link to={createPageUrl(`ChargerDetails?id=${charger.id}`)}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No chargers yet</h3>
                    <p className="text-gray-500 mb-4">Start earning by adding your first charging station</p>
                    <Link to={createPageUrl("AddCharger")}>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Charger
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Bookings */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => {
                      const charger = chargers.find(c => c.id === booking.charger_id);
                      return (
                        <div key={booking.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-sm font-medium">
                              {charger?.title || 'Charger Booking'}
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(booking.start_time), 'MMM d, HH:mm')}
                            </div>
                            <div className="flex justify-between">
                              <span>Earnings:</span>
                              <span className="font-medium">₹{booking.host_earnings?.toFixed(2) || '0'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No bookings yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
