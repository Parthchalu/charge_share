import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Zap, Clock, Wifi } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const connectorColors = {
  "Type-2": "bg-blue-100 text-blue-800",
  "CCS": "bg-purple-100 text-purple-800", 
  "CHAdeMO": "bg-orange-100 text-orange-800",
  "GB/T": "bg-red-100 text-red-800",
  "Tesla-Supercharger": "bg-green-100 text-green-800"
};

export default function ChargerCard({ charger }) {
  const getPowerBadgeColor = (power) => {
    if (power >= 150) return "bg-red-100 text-red-800";
    if (power >= 50) return "bg-orange-100 text-orange-800";
    if (power >= 22) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Image */}
          <div className="lg:w-80 h-48 lg:h-auto bg-gradient-to-br from-blue-500 to-green-500 relative">
            {charger.photos && charger.photos.length > 0 ? (
              <img
                src={charger.photos[0]}
                alt={charger.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Zap className="w-16 h-16 text-white" />
              </div>
            )}
            
            {/* Rating Badge */}
            <div className="absolute top-4 left-4 bg-white rounded-full px-3 py-1 flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">
                {charger.rating > 0 ? charger.rating.toFixed(1) : 'New'}
              </span>
            </div>

            {/* Price Badge */}
            <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 rounded-full px-3 py-1">
              <span className="text-sm font-bold">₹{charger.price_per_hour}/hr</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {charger.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{charger.address}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={connectorColors[charger.connector_type]}>
                    {charger.connector_type}
                  </Badge>
                  <Badge className={getPowerBadgeColor(charger.power_kw)}>
                    <Zap className="w-3 h-3 mr-1" />
                    {charger.power_kw} kW
                  </Badge>
                  <Badge variant="outline" className="text-gray-600">
                    <Clock className="w-3 h-3 mr-1" />
                    Available 24/7
                  </Badge>
                </div>

                {charger.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {charger.description}
                  </p>
                )}

                {charger.total_reviews > 0 && (
                  <div className="text-sm text-gray-500 mb-4">
                    {charger.total_reviews} review{charger.total_reviews !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <Link 
                  to={createPageUrl(`ChargerDetails?id=${charger.id}`)}
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
                <Link 
                  to={createPageUrl(`Booking?charger_id=${charger.id}`)}
                  className="flex-1"
                >
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Book Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}