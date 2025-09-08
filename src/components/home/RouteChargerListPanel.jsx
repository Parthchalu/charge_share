import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Zap, Star, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';

// This function checks if a charger is near the route polyline.
// It requires the Google Maps Geometry library.
const findChargersOnRoute = (route, chargers, tolerance = 5000) => { // tolerance in meters (5km)
  if (!route || !chargers || !window.google?.maps?.geometry?.poly) {
    return [];
  }

  const routePath = new window.google.maps.Polyline({
    path: route.overview_path,
  });

  return chargers.filter(charger => {
    const chargerLatLng = new window.google.maps.LatLng(charger.latitude, charger.longitude);
    // isLocationOnEdge second argument is a Polyline or Polygon
    // third is tolerance in degrees. 1 degree of latitude is ~111.132 km.
    // 5km tolerance = 5000m / 111132 m/deg = ~0.045 degrees
    return window.google.maps.geometry.poly.isLocationOnEdge(chargerLatLng, routePath, 0.045);
  });
};


export default function RouteChargerListPanel({ route, allChargers, onBack }) {
  const [chargersOnRoute, setChargersOnRoute] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Wait for geometry library to be available
    const checkGeometry = setInterval(() => {
      if (window.google?.maps?.geometry) {
        clearInterval(checkGeometry);
        const chargersFound = findChargersOnRoute(route, allChargers);
        setChargersOnRoute(chargersFound);
        setLoading(false);
      }
    }, 100);

    return () => clearInterval(checkGeometry);
  }, [route, allChargers]);

  const leg = route.legs[0];

  return (
    <div
      className="bg-white/80 backdrop-blur-xl rounded-t-3xl shadow-[0_-5px_25px_-5px_rgba(0,0,0,0.1)]"
      style={{ height: '60vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Chargers on route</h2>
            <p className="text-xs text-gray-500">
              {leg.distance.text} ({leg.duration.text})
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
           <div className="space-y-4">
             <Skeleton className="h-24 w-full" />
             <Skeleton className="h-24 w-full" />
             <Skeleton className="h-24 w-full" />
           </div>
        ) : chargersOnRoute.length > 0 ? (
          <div className="space-y-3">
            {chargersOnRoute.map((charger) => (
              <div key={charger.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm">{charger.title}</h3>
                     <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{charger.rating?.toFixed(1) || 'New'}</span>
                    </div>
                  </div>
                   <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{charger.address}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">{charger.connector_type}</Badge>
                        <Badge variant="outline" className="text-xs">{charger.power_kw} kW</Badge>
                        <Badge className="bg-green-100 text-green-800 text-xs">₹{charger.price_per_hour}/hr</Badge>
                    </div>
                    <Link to={createPageUrl(`ChargerDetails?id=${charger.id}`)}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Details</Button>
                    </Link>
                  </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 flex flex-col items-center justify-center h-full">
            <Zap className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="font-semibold text-gray-700">No chargers found on this route</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">Try searching for a different route or widening your search area.</p>
          </div>
        )}
      </div>
    </div>
  );
}