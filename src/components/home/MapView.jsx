import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MapView({ chargers }) {
  return (
    <div className="w-full h-[600px] bg-gradient-to-br from-blue-50 to-green-50 rounded-xl border border-gray-200 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Interactive Map View
        </h3>
        <p className="text-gray-600 mb-6 max-w-md">
          Map integration would show all {chargers.length} charging stations with their exact locations, 
          real-time availability, and easy booking options.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" className="flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            Find My Location
          </Button>
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <MapPin className="w-4 h-4" />
            Enable Location
          </Button>
        </div>
      </div>
    </div>
  );
}