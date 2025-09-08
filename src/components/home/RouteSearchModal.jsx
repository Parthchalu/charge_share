
import React, { useState, useEffect } from 'react';
import { X, Navigation, MapPin, ArrowUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PlacesAutocomplete from './PlacesAutocomplete';

export default function RouteSearchModal({ isOpen, onClose, onConfirm, initialDeparture, initialDestination, userLocation }) {
  const [departure, setDeparture] = useState(initialDeparture);
  const [destination, setDestination] = useState(initialDestination);

  useEffect(() => {
    setDeparture(initialDeparture);
    setDestination(initialDestination);
  }, [initialDeparture, initialDestination]);

  if (!isOpen) return null;

  const handleSwapLocations = () => {
    const temp = departure;
    setDeparture(destination);
    setDestination(temp);
  };

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      setDeparture({
        name: 'Your Location',
        formatted_address: 'Current Position',
        lat: userLocation.lat,
        lng: userLocation.lng
      });
    }
  };

  const handleFindChargers = () => {
    if (departure && destination) {
      onConfirm({ departure, destination });
    }
  };

  const isValid = departure && destination;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
      <div className="w-full bg-white rounded-t-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Where are you going?</h2>
          <button onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="w-0.5 h-8 bg-gray-300"></div>
                <MapPin className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1 space-y-3">
                <PlacesAutocomplete
                    placeholder="Starting point"
                    value={departure?.name || ''}
                    onPlaceSelect={setDeparture}
                    className="bg-gray-100 border-0 rounded-2xl h-12"
                />
                <PlacesAutocomplete
                    placeholder="Destination"
                    value={destination?.name || ''}
                    onPlaceSelect={setDestination}
                    className="bg-gray-100 border-0 rounded-2xl h-12"
                />
                </div>
                <button 
                onClick={handleSwapLocations}
                className="p-2 hover:bg-gray-100 rounded-full"
                >
                <ArrowUpDown className="w-5 h-5 text-gray-600" />
                </button>
            </div>
        </div>

        <div className="flex-1 p-4 pt-0 overflow-y-auto">
            <button
                onClick={handleUseCurrentLocation}
                className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-xl"
            >
                <Navigation className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">Use current location</span>
            </button>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t bg-gray-50 space-y-3 mt-auto">
          <Button
            onClick={handleFindChargers}
            disabled={!isValid}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 h-12 text-base font-semibold"
          >
            <Search className="w-5 h-5 mr-2" />
            Find Chargers on Route
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => {
                // You could implement a "search nearby" feature here
                if (departure) {
                  onConfirm({ departure, destination: departure });
                }
              }}
              disabled={!departure}
              className="h-10"
            >
              Search Nearby
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="h-10"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
