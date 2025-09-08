
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Zap, Navigation, MapPin, LocateFixed, List, ArrowRight, Layers, Search, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function InteractiveMapView({ chargers, userLocation, onChargerSelect, selectedChargerId, onMapInteract, isPanelVisible, setIsPanelVisible, route, onRoutesCalculated, selectedRouteIndex, onCenterUser, isRequestingLocation }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const ripplesRef = useRef([]); // Use ref to manage multiple ripple intervals
  const [infoWindow, setInfoWindow] = useState(null);
  const [isListOpen, setIsListOpen] = useState(false);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const compassPermissionRef = useRef(false);
  const [mapType, setMapType] = useState('roadmap');
  const directionsRendererRef = useRef(null);

  const defaultCenter = useMemo(() =>
    userLocation || { lat: 19.0760, lng: 72.8777 },
    [userLocation]
  );

  const zoom = userLocation ? 13 : 11;

  const handleShowSearchFromList = () => {
    setIsListOpen(false); // Close the list view
    setIsPanelVisible(true); // Show the search panel
  };

  const connectorColors = useMemo(() => ({
    "Type-2": "#3B82F6",
    "CCS": "#8B5CF6",
    "CHAdeMO": "#F97316",
    "GB/T": "#EF4444",
    "Tesla-Supercharger": "#10B981"
  }), []);

  // Define colors for the badge styling in the info window
  const connectorBadgeColors = useMemo(() => ({
    "Type-2": { bg: "#DBEAFE", text: "#1E40AF" }, // bg-blue-100, text-blue-800
    "CCS": { bg: "#EDE9FE", text: "#5B21B6" },    // bg-purple-100, text-purple-800
    "CHAdeMO": { bg: "#FFEDD5", text: "#9A3412" }, // bg-orange-100, text-orange-800
    "GB/T": { bg: "#FEE2E2", text: "#991B1B" },    // bg-red-100, text-red-800
    "Tesla-Supercharger": { bg: "#DCFCE7", text: "#166534" }, // bg-green-100, text-green-800
    "default": { bg: "#E5E7EB", text: "#4B5563" } // bg-gray-200, text-gray-700
  }), []);

  // Create precise Google-style user location icon with directional cone
  const createUserLocationIcon = useCallback((heading) => {
    const svg = `
      <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="coneGradient" cx="50%" cy="0%" r="100%">
            <stop offset="0%" style="stop-color:#4285F4;stop-opacity:0.8"/>
            <stop offset="100%" style="stop-color:#4285F4;stop-opacity:0.1"/>
          </radialGradient>
        </defs>
        
        <g transform="rotate(${heading} 24 24)">
          <path d="M24 8 L32 24 L24 24 L16 24 Z" fill="url(#coneGradient)" stroke="none"/>
        </g>
        
        <circle cx="24" cy="24" r="8" fill="#4285F4" stroke="white" stroke-width="3"/>
        <circle cx="24" cy="24" r="6" fill="#4285F4" opacity="1"/>
      </svg>
    `;
    
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new window.google.maps.Size(48, 48),
      anchor: new window.google.maps.Point(24, 24)
    };
  }, []);

  const openInGoogleMaps = useCallback((lat, lng, address) => {
    const googleMapsUrl = `https://maps.google.com/?q=${lat},${lng}&ll=${lat},${lng}&z=15`;
    window.open(googleMapsUrl, '_blank');
  }, []);

  const centerOnUser = useCallback(() => {
    if (map && userLocation) {
      // Close any open info windows first
      if (infoWindow) infoWindow.close();
      
      // Smooth animation like Google Maps
      map.panTo(userLocation);
      
      // Smooth zoom animation with a slight delay for better effect
      setTimeout(() => {
        map.setZoom(16);
      }, 300);
      
      // Optional: Add a slight bounce effect to the user marker
      if (userMarkerRef.current && window.google) {
        userMarkerRef.current.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(() => {
          if (userMarkerRef.current) {
            userMarkerRef.current.setAnimation(null);
          }
        }, 1400); // Stop bouncing after 1.4 seconds
      }
    } else if (onCenterUser) {
        // If location is not available, trigger the function from parent to fetch it
        onCenterUser();
    }
  }, [map, userLocation, infoWindow, onCenterUser]);

  const selectChargerOnMap = (chargerId) => {
    const marker = markersRef.current.find(m => m.get('chargerId') === chargerId);
    if (marker && map && window.google) {
      map.panTo(marker.getPosition());
      new window.google.maps.event.trigger(marker, 'click');
      setIsListOpen(false);
    }
  };

  // Request device orientation permission and set up compass
  useEffect(() => {
    const requestCompassPermission = async () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') {
            compassPermissionRef.current = true;
            startCompassTracking();
          }
        } catch (error) {
          console.log('Device orientation permission denied or not supported');
          startCompassTracking(); // Still try to track if supported without explicit permission
        }
      } else {
        startCompassTracking(); // For browsers that don't need explicit permission or older APIs
      }
    };

    const startCompassTracking = () => {
      const handleOrientationChange = (event) => {
        let heading = event.webkitCompassHeading || event.alpha || 0;
        if (heading < 0) heading += 360;
        setDeviceHeading(heading);
      };

      window.addEventListener('deviceorientationabsolute', handleOrientationChange);
      window.addEventListener('deviceorientation', handleOrientationChange);

      return () => {
        window.removeEventListener('deviceorientationabsolute', handleOrientationChange);
        window.removeEventListener('deviceorientation', handleOrientationChange);
      };
    };

    requestCompassPermission();
  }, []);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = () => {
      // More robust check to ensure Maps API is fully loaded
      if (!window.google?.maps?.Map || !mapRef.current) return;

      // If map is already initialized, just update its view and return
      if (map) {
        map.setCenter(defaultCenter);
        map.setZoom(zoom);
        // A timeout helps ensure the resize event fires after other updates.
        setTimeout(() => {
          if (window.google && map) {
            window.google.maps.event.trigger(map, 'resize');
          }
        }, 100);
        return;
      }

      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: false,
        gestureHandling: 'greedy',
        mapTypeId: 'roadmap',
        minZoom: 2, // Prevent zooming out to repeating worlds
        disableDefaultUI: true, // This removes Google branding
        clickableIcons: false,
        tilt: 0,
        restriction: {
          latLngBounds: {
            north: 85,
            south: -85,
            west: -180,
            east: 180,
          },
          strictBounds: false, // Allow some overshoot for a natural feel
        },
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      // Force map refresh after initialization
      setTimeout(() => {
        window.google.maps.event.trigger(googleMap, 'resize');
        googleMap.setCenter(defaultCenter);
        googleMap.setZoom(zoom);
      }, 100);

      // Add event listeners to hide search panel on interaction
      if (onMapInteract) {
        googleMap.addListener('dragstart', onMapInteract);
        googleMap.addListener('zoom_changed', onMapInteract);
      }

      // Add tile loading event listeners
      googleMap.addListener('tilesloaded', () => {
        console.log('Map tiles loaded successfully');
      });

      googleMap.addListener('idle', () => {
        // Map is fully loaded and ready
        console.log('Map is ready');
      });

      const infoWin = new window.google.maps.InfoWindow({
        pixelOffset: new window.google.maps.Size(0, -10)
      });
      
      // Initialize Directions Renderer
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true,
          preserveViewport: true, // We will manually set the viewport
      });
      directionsRendererRef.current.setMap(googleMap);
      
      setInfoWindow(infoWin);
      setMap(googleMap);
    };

    if (!window.google) {
      const script = document.createElement('script');
      // Removed invalid `loading=async` parameter
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCOevTHZQAA8oewunLXHJeUzLALdd-AEqU&libraries=places,geometry&v=3.55`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Add small delay to ensure DOM is ready
        setTimeout(initMap, 50);
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps');
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div class="flex items-center justify-center h-full bg-gray-100 text-center p-8">
              <div>
                <div class="text-red-500 mb-4">⚠️</div>
                <h3 class="font-semibold mb-2">Google Maps Failed to Load</h3>
                <p class="text-gray-600 text-sm">Please check your internet connection and try again.</p>
              </div>
            </div>
          `;
        }
      };
      document.head.appendChild(script);
    } else {
      // Add small delay even if already loaded
      setTimeout(initMap, 50);
    }
  }, [map, defaultCenter, zoom, onMapInteract]);

  // Handle drawing routes
  useEffect(() => {
    if (!map || !window.google) return;

    if (!route || !route.departure || !route.destination) {
      // Clear existing routes if route is cleared
      if(directionsRendererRef.current) {
          directionsRendererRef.current.setDirections({routes: []});
      }
      if (onRoutesCalculated) {
        onRoutesCalculated([]); // Notify parent that no routes are available
      }
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route({
      origin: { lat: route.departure.lat, lng: route.departure.lng },
      destination: { lat: route.destination.lat, lng: route.destination.lng },
      travelMode: 'DRIVING',
      provideRouteAlternatives: true
    }, (response, status) => {
      if (status === 'OK') {
        directionsRendererRef.current.setDirections(response);
        
        // Fit map to route bounds
        const bounds = new window.google.maps.LatLngBounds();
        response.routes[0].legs.forEach(leg => {
            leg.steps.forEach(step => {
                step.path.forEach(path => {
                    bounds.extend(path);
                });
            });
        });
        map.fitBounds(bounds);
        
        if (onRoutesCalculated) {
          onRoutesCalculated(response.routes);
        }
      } else {
        console.error(`Directions request failed due to ${status}`);
        if (onRoutesCalculated) {
          onRoutesCalculated([]); // Notify parent that no routes were found
        }
      }
    });

  }, [map, route, onRoutesCalculated]);

  // Handle selected route change
  useEffect(() => {
      if(directionsRendererRef.current && selectedRouteIndex !== undefined && selectedRouteIndex !== null) {
          directionsRendererRef.current.setRouteIndex(selectedRouteIndex);
      }
  }, [selectedRouteIndex]);


  // Update user location marker icon when device heading changes
  useEffect(() => {
    if (userMarkerRef.current && window.google) {
      const newIcon = createUserLocationIcon(deviceHeading);
      userMarkerRef.current.setIcon(newIcon);
    }
  }, [deviceHeading, createUserLocationIcon]);

  // Add markers when map and data are ready
  useEffect(() => {
    if (!map || !window.google) return;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Clear any existing ripple animations and intervals
    ripplesRef.current.forEach(r => {
      if (r.circle) r.circle.setMap(null);
      if (r.interval) cancelAnimationFrame(r.interval);
    });
    ripplesRef.current = [];
    if (userMarkerRef.current && userMarkerRef.current.rippleGeneratorInterval) {
      clearInterval(userMarkerRef.current.rippleGeneratorInterval);
      userMarkerRef.current.rippleGeneratorInterval = null;
    }

    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }

    const newMarkers = [];

    // Add user location marker with precise Google-style animation
    if (userLocation) {
      const userMarker = new window.google.maps.Marker({
        position: userLocation,
        map: map,
        title: "Your Location",
        icon: createUserLocationIcon(deviceHeading),
        zIndex: 1000
      });
      userMarkerRef.current = userMarker;

      const getRippleMaxRadius = (zoomLevel) => {
        if (zoomLevel >= 18) return 40;
        if (zoomLevel >= 16) return 80;
        if (zoomLevel >= 14) return 150;
        return 250;
      };

      const createRipple = () => {
        if (!map || !window.google || !userLocation) return;
        
        const maxRadius = getRippleMaxRadius(map.getZoom());
        const rippleCircle = new window.google.maps.Circle({
            strokeColor: '#4285F4',
            strokeOpacity: 0.6,
            strokeWeight: 1.5,
            fillColor: '#4285F4',
            fillOpacity: 0.2,
            map: map,
            center: userLocation,
            radius: 0,
            clickable: false,
        });

        const startTime = Date.now();
        const duration = 2000; // 2-second ripple animation

        const animate = () => {
            if (!rippleCircle.getMap()) return; // Stop if circle was removed from map
            const elapsed = Date.now() - startTime;
            if (elapsed > duration) {
                rippleCircle.setMap(null); // Clean up the circle
                ripplesRef.current = ripplesRef.current.filter(r => r.circle !== rippleCircle); // Remove from ref
                return;
            }

            const progress = elapsed / duration;
            const currentRadius = maxRadius * progress;
            const opacity = 0.2 * (1 - progress); // Fade out as it expands

            rippleCircle.setRadius(currentRadius);
            rippleCircle.setOptions({ fillOpacity: opacity, strokeOpacity: opacity * 3 });

            const animationFrameId = requestAnimationFrame(animate);
            // Store the animation frame ID for potential cancellation
            const existingRipple = ripplesRef.current.find(r => r.circle === rippleCircle);
            if (existingRipple) {
              existingRipple.interval = animationFrameId;
            }
        };
        
        const animationFrameId = requestAnimationFrame(animate);
        ripplesRef.current.push({ circle: rippleCircle, interval: animationFrameId });
      };

      // Start generating ripples
      createRipple(); // Create the first ripple immediately
      const rippleGeneratorInterval = setInterval(createRipple, 1500); // Create a new one every 1.5s
      userMarker.rippleGeneratorInterval = rippleGeneratorInterval;

      userMarker.addListener('click', () => {
        infoWindow.setContent(`
          <div class="p-2 text-center">
            <div class="text-sm font-medium text-blue-600 mb-2">Your Location</div>
            <button onclick="window.open('https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}', '_blank')"
                    class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
              Open in Maps
            </button>
          </div>
        `);
        infoWindow.open(map, userMarker);
      });
    }

    chargers.forEach(charger => {
      const marker = new window.google.maps.Marker({
        position: { lat: charger.latitude, lng: charger.longitude },
        map: map,
        title: charger.title,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z', // Map pin path
          fillColor: connectorColors[charger.connector_type] || '#6B7280',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 1.5,
          scale: 1.5,
          anchor: new window.google.maps.Point(12, 22) // Anchor at the tip of the pin
        }
      });

      marker.set('chargerId', charger.id);

      const distance = charger.distance ? `${charger.distance.toFixed(1)} km away` : '';
      const connectorColor = connectorBadgeColors[charger.connector_type] || connectorBadgeColors.default;


      marker.addListener('click', () => {
        infoWindow.setContent(`
          <div class="p-3 max-w-xs" style="margin-top: -12px;">
            <div class="flex items-start justify-between mb-2">
              <h3 class="font-semibold text-gray-900 text-sm pr-2">${charger.title}</h3>
              <span class="text-xs text-gray-500 whitespace-nowrap">${distance}</span>
            </div>
            <p class="text-gray-600 text-sm mb-3">${charger.address}</p>
            <div class="flex items-center gap-2 mb-4">
              <div class="px-2 py-1 rounded-full text-xs font-medium flex items-center" style="background-color: ${connectorColor.bg}; color: ${connectorColor.text};">
                <span class="w-2 h-2 rounded-full mr-1.5" style="background-color: ${connectorColor.text};"></span>
                ${charger.connector_type}
              </div>
              <div class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">${charger.power_kw} kW</div>
              <div class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">₹${charger.price_per_hour}/hr</div>
            </div>
            <div class="flex gap-2">
              <a href="https://maps.google.com/?daddr=${charger.latitude},${charger.longitude}" target="_blank" class="flex-1 flex items-center justify-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50" style="text-decoration: none;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                Directions
              </a>
              <a href="${createPageUrl(`ChargerDetails?id=${charger.id}`)}" class="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700" style="text-decoration: none;">
                View Details
              </a>
            </div>
          </div>
        `);
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
    });

    markersRef.current = newMarkers;

    // Auto-select and center on charger if selectedChargerId is provided
    if (selectedChargerId) {
      const selectedMarker = newMarkers.find(marker => marker.get('chargerId') === selectedChargerId);
      if (selectedMarker) {
        map.setCenter(selectedMarker.getPosition());
        map.setZoom(15);
        // Trigger click to show info window
        new window.google.maps.event.trigger(selectedMarker, 'click');
      }
    }
    
    return () => {
      // Cleanup the ripple intervals and animation frames when the component/effect unmounts
      if (userMarkerRef.current && userMarkerRef.current.rippleGeneratorInterval) {
        clearInterval(userMarkerRef.current.rippleGeneratorInterval);
      }
      ripplesRef.current.forEach(r => {
        if (r.circle) r.circle.setMap(null);
        if (r.interval) cancelAnimationFrame(r.interval);
      });
      ripplesRef.current = []; // Clear the ref array
    };
  }, [map, chargers, userLocation, connectorColors, createUserLocationIcon, deviceHeading, infoWindow, selectedChargerId, connectorBadgeColors]);

  const toggleMapType = () => {
    setMapType(currentType => {
      const newType = currentType === 'roadmap' ? 'satellite' : 'roadmap';
      if (map) {
        // Add a small delay to ensure smooth transition
        setTimeout(() => {
          map.setMapTypeId(newType);
          // Force refresh of tiles after switching
          window.google.maps.event.trigger(map, 'resize');
        }, 100);
      }
      return newType;
    });
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full bg-gray-200" />

      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Sheet open={isListOpen} onOpenChange={setIsListOpen}>
          <SheetTrigger asChild>
            <Button className="bg-white hover:bg-gray-50 text-gray-700 border shadow-lg">
              <List className="w-4 h-4 mr-2" />
              List View
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh]">
            <SheetHeader>
              <div className="flex justify-between items-center pr-10">
                <SheetTitle className="text-left">Nearby Chargers</SheetTitle>
                <Button variant="outline" onClick={handleShowSearchFromList}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </SheetHeader>
            <div className="mt-4 space-y-3 overflow-y-auto max-h-[60vh]">
              {chargers.map((charger) => (
                <div
                  key={charger.id}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm">{charger.title}</h3>
                    <span className="text-xs text-gray-500">
                      {charger.distance ? `${charger.distance.toFixed(1)} km` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{charger.address}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">{charger.connector_type}</Badge>
                      <Badge variant="outline" className="text-xs">{charger.power_kw} kW</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">₹${charger.price_per_hour}/hr</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.open(`https://maps.google.com/?daddr=${charger.latitude},${charger.longitude}`, '_blank')}
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Directions
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => selectChargerOnMap(charger.id)}
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      Show on Map
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Button
        onClick={toggleMapType}
        className="absolute top-4 right-4 bg-white hover:bg-gray-50 text-gray-700 border shadow-lg"
        size="icon"
        title="Toggle map type"
      >
        <Layers className="w-5 h-5" />
      </Button>

      {userLocation && (
        <Button
          onClick={onCenterUser}
          className="absolute bottom-24 right-4 bg-white hover:bg-gray-50 text-gray-700 border shadow-lg"
          size="icon"
          disabled={isRequestingLocation}
        >
          {isRequestingLocation ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <LocateFixed className="w-5 h-5" />
          )}
        </Button>
      )}
    </div>
  );
}
