
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Charger, User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Search } from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion';

import InteractiveMapView from "../components/home/InteractiveMapView";
import SearchPanel from "../components/home/SearchPanel";
import RouteSelectionPanel from "../components/home/RouteSelectionPanel";
import RouteChargerListPanel from "../components/home/RouteChargerListPanel"; // New import

export default function HomePage() {
  const [chargers, setChargers] = useState([]);
  const [filteredChargers, setFilteredChargers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [requestingLocation, setRequestingLocation] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [selectedChargerId, setSelectedChargerId] = useState(null);
  const [user, setUser] = useState(null);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true); // Fixed: Changed from `true` to `useState(true)`
  const [mapRecenterTrigger, setMapRecenterTrigger] = useState(0);
  const [route, setRoute] = useState(null);
  const [calculatedRoutes, setCalculatedRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [step, setStep] = useState('search'); // 'search', 'routeSelect', 'chargerList'

  const ignoreMapInteractionRef = useRef(true);
  const intentionalPanelShowRef = useRef(false); // New ref to track intentional panel shows

  const handleMapInteract = useCallback(() => {
    if (ignoreMapInteractionRef.current || intentionalPanelShowRef.current) return;
    setIsPanelVisible(false);
  }, []);

  const loadChargers = useCallback(async (specificChargerId = null) => {
    try {
      const data = await Charger.filter({ is_active: true }, '-rating', 50);

      if (specificChargerId && !data.some(c => c.id === specificChargerId)) {
        try {
          const specificCharger = await Charger.get(specificChargerId);
          if (specificCharger) {
            data.unshift(specificCharger);
          }
        } catch (e) {
          console.error(`Could not fetch specific charger ${specificChargerId}`, e);
        }
      }

      setChargers(data);
    } catch (error) {
      console.error("Failed to load chargers:", error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        setAuthError(true);
      }
    } finally {
      setLoading(false);
    }
  }, []); // Added useCallback with empty dependency array

  const requestLocationPermission = useCallback(() => {
    if (navigator.geolocation) {
      setRequestingLocation(true);
      setLocationError(null);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError(null);
          setRequestingLocation(false);
          setMapRecenterTrigger(prev => prev + 1);
        },
        (error) => {
          console.error("Geolocation error:", error);
          let errorMessage = "Could not determine your location. Please enable location services in your browser and system settings.";
          if (error.code === 1) { // PERMISSION_DENIED
            errorMessage = "Location access was denied. Please enable it in your browser settings to find nearby chargers.";
          } else if (error.code === 2) { // POSITION_UNAVAILABLE
            errorMessage = "Your location is currently unavailable. Please check your connection or try again later.";
          } else if (error.code === 3) { // TIMEOUT
            errorMessage = "Finding your location took too long. Please try again.";
          }
          setLocationError(errorMessage);
          
          // Set a default location only if one doesn't exist
          setUserLocation(currentLocation => currentLocation || { lat: 19.0760, lng: 72.8777 }); 
          
          setRequestingLocation(false);
          setMapRecenterTrigger(prev => prev + 1); // Center on default if needed
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, // Increased timeout to 15 seconds
          maximumAge: 0  // Don't use cached location
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
      setUserLocation(currentLocation => currentLocation || { lat: 19.0760, lng: 72.8777 });
      setMapRecenterTrigger(prev => prev + 1);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const chargerParam = urlParams.get('charger');
    if (chargerParam) {
      setSelectedChargerId(chargerParam);
    }

    const initPageData = async () => {
      // Temporarily ignore map interactions on initial load to prevent panel from hiding
      ignoreMapInteractionRef.current = true;
      const timer = setTimeout(() => {
        ignoreMapInteractionRef.current = false;
      }, 500); // Ignore for 0.5 seconds

      try {
        const currentUser = await User.me();
        if (currentUser && currentUser.id) {
          setUser(currentUser);
        } else {
          setAuthError(true);
        }
      } catch (error) {
        console.log("User not authenticated, redirecting to login");
        setAuthError(true);
      }
      setLoading(false); // Set overall loading to false after auth check
      await loadChargers(chargerParam); // Load chargers after auth status is known
      requestLocationPermission(); // Request location after auth status is known
    initPageData();
  }, [loadChargers, requestLocationPermission]);
  
  const retryLocation = () => {
    requestLocationPermission();
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const processChargers = useCallback(() => {
    let processed = chargers;

    if (userLocation) {
      processed = processed.map(charger => ({
        ...charger,
        distance: calculateDistance(
          userLocation.lat, userLocation.lng,
          charger.latitude, charger.longitude
        )
      }));

      processed.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    setFilteredChargers(processed);
  }, [chargers, userLocation]);

  useEffect(() => {
    processChargers();
  }, [processChargers]);

  const handleRouteSearch = (newRoute) => {
    setCalculatedRoutes([]); // Reset previous routes
    setSelectedRouteIndex(0);
    setRoute(newRoute);
    
    // Set flag to prevent map interactions from hiding the panel
    intentionalPanelShowRef.current = true;
    setIsPanelVisible(true); // Ensure panel is visible for route selection
    setStep('routeSelect');
    
    // Clear the flag after a delay to allow normal map interactions
    setTimeout(() => {
      intentionalPanelShowRef.current = false;
    }, 2000); // 2 second delay
  };

  const handleBackToSearch = () => {
    setRoute(null);
    setCalculatedRoutes([]);
    setStep('search');
  };
  
  const handleRouteSelected = (index) => {
    setSelectedRouteIndex(index);
    
    // Set flag again when showing charger list
    intentionalPanelShowRef.current = true;
    setStep('chargerList');
    
    // Clear the flag after a delay
    setTimeout(() => {
      intentionalPanelShowRef.current = false;
    }, 1500); // 1.5 second delay
  }

  const handleBackToRouteSelect = () => {
    setStep('routeSelect');
  }

  const refreshLocationAndCenter = useCallback(() => {
    // This function will now trigger a fresh location request.
    requestLocationPermission();
  }, [requestLocationPermission]);

  if (loading && !chargers.length) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-pulse w-full h-full bg-gray-200"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <InteractiveMapView 
        chargers={filteredChargers} 
        userLocation={userLocation}
        selectedChargerId={selectedChargerId}
        onChargerSelect={(charger) => {
          window.location.href = createPageUrl(`ChargerDetails?id=${charger.id}`);
        }}
        onMapInteract={handleMapInteract}
        mapRecenterTrigger={mapRecenterTrigger}
        isPanelVisible={isPanelVisible}
        setIsPanelVisible={setIsPanelVisible}
        onCenterUser={refreshLocationAndCenter} // Pass the new function
        isRequestingLocation={requestingLocation} // Pass loading state
        route={route}
        onRoutesCalculated={setCalculatedRoutes}
        selectedRouteIndex={selectedRouteIndex}
      />
      
      <AnimatePresence>
        {locationError && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="absolute top-4 left-4 right-4 z-10"
            >
              <Alert variant="destructive" className="bg-white/80 backdrop-blur-md shadow-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span className="text-xs">{locationError}</span>
                  <Button onClick={retryLocation} size="sm" variant="destructive" className="ml-4 flex-shrink-0">
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {authError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-8 m-4 max-w-sm w-full text-center shadow-xl"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sign In Required</h2>
              <p className="text-gray-600 mb-6">Please log in to access all features and personalized content.</p>
              <div className="space-y-3">
                <Button onClick={() => User.login()} className="w-full bg-blue-600 hover:bg-blue-700">
                  Log In
                </Button>
                <Button 
                  onClick={() => setAuthError(false)} 
                  variant="outline" 
                  className="w-full"
                >
                  Continue as Guest
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isPanelVisible && step === 'search' && (
          <motion.div
            key="search-panel"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            className="fixed bottom-16 left-0 right-0 z-10"
          >
            <SearchPanel 
              user={user} 
              userLocation={userLocation}
              onHideNavigation={() => setIsNavVisible(false)}
              onShowNavigation={() => setIsNavVisible(true)}
              onRouteSearch={handleRouteSearch}
            />
          </motion.div>
        )}

        {isPanelVisible && step === 'routeSelect' && (
          <RouteSelectionPanel
            routes={calculatedRoutes}
            departure={route.departure}
            destination={route.destination}
            selectedRouteIndex={selectedRouteIndex}
            onSelectRoute={handleRouteSelected}
            onBack={handleBackToSearch}
          />
        )}

        {isPanelVisible && step === 'chargerList' && calculatedRoutes[selectedRouteIndex] && (
           <motion.div
            key="charger-list-panel"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            className="fixed bottom-16 left-0 right-0 z-10"
          >
            <RouteChargerListPanel
              route={calculatedRoutes[selectedRouteIndex]}
              allChargers={chargers}
              onBack={handleBackToRouteSelect}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`fixed bottom-0 left-0 right-0 z-[9999] transition-all duration-300 ${isNavVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      </div>
    </div>
  );
}
