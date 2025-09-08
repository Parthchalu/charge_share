import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation } from 'lucide-react';

export default function PlacesAutocomplete({ placeholder, value, onPlaceSelect, className }) {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteService = useRef(null);
  const geocoderService = useRef(null);

  useEffect(() => {
    if (window.google?.maps) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      geocoderService.current = new window.google.maps.Geocoder();
    }
  }, []);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue.length > 2 && autocompleteService.current) {
      autocompleteService.current.getPlacePredictions(
        {
          input: newValue,
          componentRestrictions: { country: 'in' }
        },
        (predictions, status) => {
          if (status === 'OK' && predictions) {
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (geocoderService.current) {
      geocoderService.current.geocode(
        { placeId: suggestion.place_id },
        (results, status) => {
          if (status === 'OK' && results[0]) {
            const place = results[0];
            const location = {
              name: suggestion.description,
              formatted_address: place.formatted_address,
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              place_id: suggestion.place_id
            };
            
            onPlaceSelect(location);
            setInputValue(suggestion.description);
            setShowSuggestions(false);
          }
        }
      );
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            name: 'Your Current Location',
            formatted_address: 'Current Position',
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          onPlaceSelect(location);
          setInputValue('Your Current Location');
          setShowSuggestions(false);
        },
        (error) => {
          console.error('Error getting current location:', error);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0
        }
      );
    }
  };

  return (
    <div className="relative">
      <Input
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={className}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
          <button
            onClick={handleCurrentLocation}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 flex items-center gap-3"
          >
            <Navigation className="w-4 h-4 text-blue-600" />
            <span className="text-blue-600 font-medium">Use current location</span>
          </button>
          
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-b-0"
            >
              <MapPin className="w-4 h-4 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">
                  {suggestion.structured_formatting?.main_text || suggestion.description}
                </div>
                <div className="text-sm text-gray-500">
                  {suggestion.structured_formatting?.secondary_text || ''}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}