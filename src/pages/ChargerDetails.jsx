
import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { Charger, Review, User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import {
  Star,
  MapPin,
  Zap,
  Clock,
  ArrowLeft,
  Calendar,
  Phone,
  MessageCircle,
  Share2,
  Heart,
  IndianRupee, // New import
  CheckCircle, // New import
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

import PhotoGallery from "../components/charger/PhotoGallery";
import ReviewList from "../components/charger/ReviewList";

// Helper function to determine availability
const getAvailabilityStatus = (availability) => {
  if (!availability || Object.keys(availability).length === 0) {
    return { text: 'Availability not set', color: 'text-gray-500' };
  }

  const now = new Date();
  // Get day of week (0 for Sunday, 1 for Monday, etc.)
  const dayOfWeekNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const currentDayName = dayOfWeekNames[now.getDay()];
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const daySlots = availability[currentDayName];

  if (!daySlots || daySlots.length === 0 || daySlots.every(slot => slot === "Closed")) {
    return { text: 'Closed today', color: 'text-red-600' };
  }

  for (const slot of daySlots) {
    if (slot === "24/7") {
        return { text: 'Open now • 24/7', color: 'text-green-600' };
    }
    const [start, end] = slot.split('-');
    if (currentTime >= start && currentTime < end) {
      return { text: `Open now • Closes at ${end}`, color: 'text-green-600' };
    }
  }

  // If not open now, find the next opening time today
  for (const slot of daySlots) {
      const [start] = slot.split('-');
      if (currentTime < start) {
          return { text: `Closed • Opens at ${start}`, color: 'text-orange-600' };
      }
  }

  return { text: 'Closed for the day', color: 'text-red-600' };
};


export default function ChargerDetailsPage() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const chargerId = urlParams.get('id');
  
  const [charger, setCharger] = useState(null);
  const [host, setHost] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const loadChargerDetails = useCallback(async () => {
    setLoading(true);

    // Handle demo charger IDs
    if (chargerId && (chargerId.includes('demo') || chargerId.includes('placeholder'))) {
      const demoCharger = {
        id: chargerId,
        title: 'Demo Charging Station',
        description: 'This is a sample charging station for demonstration purposes. Fast charging available with multiple connector types.',
        address: 'Sample Location, Mumbai',
        latitude: 19.0760,
        longitude: 72.8777,
        connector_type: 'CCS',
        power_kw: 150,
        price_per_hour: 200,
        photos: [
          'https://images.unsplash.com/photo-1621452683101-393475f3b7f3?q=80&w=600',
          'https://images.unsplash.com/photo-1627816435338-b6b4e1a0d844?q=80&w=600'
        ],
        auto_accept: true,
        is_active: true,
        rating: 4.5,
        total_reviews: 89,
        host_id: 'demo_host_id',
        availability_hours: {
          monday: ["09:00-17:00"],
          tuesday: ["09:00-17:00"],
          wednesday: ["09:00-17:00"],
          thursday: ["09:00-17:00"],
          friday: ["09:00-17:00"],
          saturday: ["10:00-14:00"],
          sunday: [] // Closed
        },
      };
      
      const demoHost = {
        id: 'demo_host_id',
        full_name: 'Demo Host',
        profile_image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=250',
      };
      
      setCharger(demoCharger);
      setHost(demoHost);
      setReviews([]); // No reviews for demo chargers
      setLoading(false);
      return;
    }

    try {
      const chargerData = await Charger.get(chargerId);
      setCharger(chargerData);

      // Load host information with fallback
      if (chargerData && chargerData.host_id) {
        // Prevent API calls for placeholder host IDs
        if (chargerData.host_id.includes('placeholder') || chargerData.host_id.includes('demo')) {
          setHost({
            id: chargerData.host_id,
            full_name: "Verified Host",
            profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250&h=250&auto=format&fit=crop'
          });
        } else {
          try {
            const hostData = await User.get(chargerData.host_id);
            setHost(hostData);
          } catch (hostError) {
            console.warn("Could not load host data:", hostError);
            setHost({
              id: chargerData.host_id,
              full_name: "Verified Host",
              profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250&h=250&auto=format&fit=crop'
            });
          }
        }
      }

      // Load reviews with fallback
      try {
        const reviewsData = await Review.filter({ charger_id: chargerId }, '-created_date', 10);
        setReviews(reviewsData);
      } catch (reviewError) {
        console.warn("Could not load reviews:", reviewError);
        setReviews([]);
      }

    } catch (error) {
      console.error("Failed to load charger details:", error);
      setCharger(null);
    } finally {
      setLoading(false);
    }
  }, [chargerId]);

  useEffect(() => {
    if (chargerId) {
      loadChargerDetails();
    }
  }, [chargerId, loadChargerDetails]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-48 md:h-64 bg-gray-200"></div>
          <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
            <Skeleton className="h-6 md:h-8 w-1/2 md:w-1/3 mb-2 md:mb-4" />
            <Skeleton className="h-4 w-2/3 mb-4 md:mb-6" />
            <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                <Skeleton className="h-24 md:h-32" />
                <Skeleton className="h-32 md:h-48" />
              </div>
              <Skeleton className="h-48 md:h-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!charger) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Charger Not Found</h2>
          <p className="text-gray-600 mb-4">The charging station you're looking for doesn't exist.</p>
          <Link to={createPageUrl("Home")}>
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const availabilityStatus = getAvailabilityStatus(charger.availability_hours);

  const connectorColors = {
    "Type-2": "bg-blue-100 text-blue-800",
    "CCS": "bg-purple-100 text-purple-800", 
    "CHAdeMO": "bg-orange-100 text-orange-800",
    "GB/T": "bg-red-100 text-red-800",
    "Tesla-Supercharger": "bg-green-100 text-green-800"
  };

  const getPowerBadgeColor = (power) => {
    if (power >= 150) return "bg-red-100 text-red-800";
    if (power >= 50) return "bg-orange-100 text-orange-800";
    if (power >= 22) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative">
        <PhotoGallery photos={charger.photos || []} title={charger.title} />
        
        {/* Back Button */}
        <div className="absolute top-3 md:top-4 left-3 md:left-4 z-10">
          <Link to={createPageUrl("Home")}>
            <Button variant="outline" size="icon" className="bg-white/90 backdrop-blur-sm h-8 w-8 md:h-10 md:w-10">
              <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 md:top-4 right-3 md:right-4 z-10 flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-white/90 backdrop-blur-sm h-8 w-8 md:h-10 md:w-10"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className={`w-3 h-3 md:w-4 md:h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button variant="outline" size="icon" className="bg-white/90 backdrop-blur-sm h-8 w-8 md:h-10 md:w-10">
            <Share2 className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-3 md:px-4 lg:px-6">
        <div className="p-4 lg:p-6 -mt-16 relative z-10">
          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl lg:text-3xl font-bold">{charger.title}</CardTitle>
                  <div className="flex items-center gap-2 text-gray-600 mt-2">
                    <MapPin className="w-5 h-5" />
                    <span>{charger.address}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-2xl font-bold">₹{charger.price_per_hour}<span className="text-base font-normal text-gray-500">/hr</span></p>
                  {charger.rating > 0 && (
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="font-semibold">{charger.rating.toFixed(1)}</span>
                      <span className="text-gray-500 text-sm">({charger.total_reviews} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-t pt-4">
                  <div className="flex items-center gap-2">
                      <Clock className={`w-5 h-5 ${availabilityStatus.color}`} />
                      <p className={`font-semibold ${availabilityStatus.color}`}>{availabilityStatus.text}</p>
                  </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{charger.description || 'No description provided.'}</p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className={connectorColors[charger.connector_type]}>
                  {charger.connector_type}
                </Badge>
                <Badge className={getPowerBadgeColor(charger.power_kw)}>
                  <Zap className="w-3 h-3 mr-1" />
                  {charger.power_kw} kW
                </Badge>
                {/* Available 24/7 badge removed as availability logic is now handled by getAvailabilityStatus */}
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8 pt-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Host Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Host Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Avatar className="w-12 h-12 md:w-16 md:h-16">
                      <AvatarImage src={host?.profile_image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250&h=250&auto=format&fit=crop'} alt={host?.full_name} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-sm md:text-lg">
                        {host?.full_name?.charAt(0) || 'H'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base md:text-lg">{host?.full_name || 'Verified Host'}</h3>
                      <p className="text-gray-600 text-sm md:text-base">Joined in 2024</p>
                      <Badge variant="outline" className="mt-1 text-green-600 border-green-200 text-xs">
                        ✓ Verified Host
                      </Badge>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                        <MessageCircle className="w-4 h-4 mr-1 md:mr-2" />
                        <span className="hidden sm:inline">Message</span>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                        <Phone className="w-4 h-4 mr-1 md:mr-2" />
                        <span className="hidden sm:inline">Call</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews */}
              <ReviewList reviews={reviews} />
            </div>

            {/* Right Column - Booking */}
            <div className="space-y-4 md:space-y-6">
              {/* Booking Card */}
              <Card className="lg:sticky lg:top-4">
                <CardContent className="p-4 md:p-6">
                  <div className="text-center mb-4 md:mb-6">
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                      ₹{charger.price_per_hour}
                      <span className="text-base md:text-lg font-normal text-gray-600">/hour</span>
                    </div>
                    <p className="text-gray-600 text-sm md:text-base">
                      {charger.auto_accept ? 'Instant booking available' : 'Host approval required'}
                    </p>
                  </div>

                  <div className="space-y-4 mb-4 md:mb-6">
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div className="text-center p-2 md:p-3 bg-gray-50 rounded-lg">
                        <Zap className="w-5 h-5 md:w-6 md:h-6 text-blue-600 mx-auto mb-1" />
                        <div className="text-xs md:text-sm font-medium">{charger.power_kw} kW</div>
                        <div className="text-xs text-gray-500">Power</div>
                      </div>
                      <div className="text-center p-2 md:p-3 bg-gray-50 rounded-lg">
                        <Clock className="w-5 h-5 md:w-6 md:h-6 text-green-600 mx-auto mb-1" />
                        <div className="text-xs md:text-sm font-medium">
                          {availabilityStatus.text.includes("24/7") ? "24/7" : "Hours"}
                        </div>
                        <div className="text-xs text-gray-500">Availability</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Link to={createPageUrl(`Booking?charger_id=${charger.id}`)}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 h-10 md:h-12 text-sm md:text-base">
                        <Calendar className="w-4 h-4 mr-2" />
                        Book This Charger
                      </Button>
                    </Link>
                    <Button className="w-full h-10 md:h-12 text-sm md:text-base" variant="outline">
                      Check Availability
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full h-10 md:h-12 text-sm md:text-base"
                      onClick={() => {
                        const googleMapsUrl = `https://maps.google.com/?q=${charger.latitude},${charger.longitude}&ll=${charger.latitude},${charger.longitude}&z=15`;
                        window.open(googleMapsUrl, '_blank');
                      }}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  </div>

                  <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t text-center">
                    <p className="text-xs text-gray-500">
                      Free cancellation up to 1 hour before booking
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Facts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Quick Facts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 md:space-y-3">
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="text-gray-600">Connector Type</span>
                    <span className="font-medium">{charger.connector_type}</span>
                  </div>
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="text-gray-600">Charging Power</span>
                    <span className="font-medium">{charger.power_kw} kW</span>
                  </div>
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="text-gray-600">Price per hour</span>
                    <span className="font-medium">₹{charger.price_per_hour}</span>
                  </div>
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="text-gray-600">Booking Type</span>
                    <span className="font-medium">
                      {charger.auto_accept ? 'Instant' : 'Host approval'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="text-gray-600">Reviews</span>
                    <span className="font-medium">
                      {charger.total_reviews} review{charger.total_reviews !== 1 ? 's' : ''}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
