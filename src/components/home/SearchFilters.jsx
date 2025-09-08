
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, X } from "lucide-react";

export default function SearchFilters({ onFiltersChange, onHideNavigation, onShowNavigation }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    chargingPower: 50, // Change to single value
    plugTypes: [],
    locationFeatures: [],
    vehicleTypes: [], 
    longTermDiscount: false,
    automaticBooking: false,
    autonomousAccess: false,
    showOnlyFavorites: false,
    hostTypes: []
  });

  const plugTypes = [
    { id: 'type2_iec', name: 'Type 2 (IEC 62196-2)' },
    { id: 'type1_sae', name: 'Type 1 (SAE J1772)' },
    { id: 'ccs2_combo', name: 'CCS2 (Combo 2, DC)' },
    { id: 'chademo_dc', name: 'CHAdeMO (DC)' },
    { id: 'bharat_ac', name: 'Bharat AC-001' },
    { id: 'bharat_dc', name: 'Bharat DC-001' }
  ];

  const locationFeatures = [
    { id: 'covered_parking', name: 'Covered parking WiFi spots' },
    { id: 'video_surveillance', name: 'Video surveillance' },
    { id: 'free_wifi', name: 'Free Wi-Fi' },
    { id: 'disabled_access', name: 'Disabled access' },
    { id: 'secure_parking', name: 'Secure parking' },
    { id: 'underground_parking', name: 'Underground parking' },
    { id: 'relaxation_area', name: 'Relaxation area' },
    { id: 'photo_booth', name: 'Photo booth' },
    { id: 'snack_drinks', name: 'Snacks & drinks' },
    { id: 'smoking', name: 'Smoking' }
  ];

  const hostTypes = [
    { id: 'private', name: 'Private' },
    { id: 'professional', name: 'Professional' }
  ];

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (open) {
      onHideNavigation?.();
      window.dispatchEvent(new CustomEvent('hideNavigation'));
    } else {
      onShowNavigation?.();
      window.dispatchEvent(new CustomEvent('showNavigation'));
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const toggleArrayFilter = (key, value) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    handleFilterChange(key, newArray);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      chargingPower: 50, // Change to single value
      plugTypes: [],
      locationFeatures: [],
      vehicleTypes: [], 
      longTermDiscount: false,
      automaticBooking: false,
      autonomousAccess: false,
      showOnlyFavorites: false,
      hostTypes: []
    };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.chargingPower !== 50) count++; // Change condition
    if (filters.plugTypes.length > 0) count++;
    if (filters.locationFeatures.length > 0) count++;
    if (filters.vehicleTypes.length > 0) count++;
    if (filters.longTermDiscount) count++;
    if (filters.automaticBooking) count++;
    if (filters.autonomousAccess) count++;
    if (filters.showOnlyFavorites) count++;
    if (filters.hostTypes.length > 0) count++;
    return count;
  };

  const activeCount = getActiveFiltersCount();

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="h-10 rounded-full bg-gray-100 border-transparent text-gray-700 hover:bg-gray-200"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-screen max-h-[90vh] flex flex-col rounded-t-3xl"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="p-5 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <SheetTitle>Filters</SheetTitle>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </SheetHeader>
        
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Charging Power */}
          <div>
            <h3 className="font-medium mb-2 flex justify-between items-center">
              <span>Minimum charging power</span>
              <span className="font-bold text-blue-600 text-sm">{filters.chargingPower} kW</span>
            </h3>
            <div className="mt-4">
              <Slider
                value={[filters.chargingPower]}
                onValueChange={(value) => handleFilterChange('chargingPower', value[0])}
                min={3}
                max={350}
                step={1}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>3 kW</span>
                <span>350 kW</span>
              </div>
            </div>
          </div>

          <div className="border-t"></div>

          {/* Plug Type */}
          <div>
            <h3 className="font-medium mb-3">Plug type</h3>
            <div className="space-y-2">
              {plugTypes.map(plug => (
                <button
                  key={plug.id}
                  onClick={() => toggleArrayFilter('plugTypes', plug.id)}
                  className={`w-full p-3 rounded-2xl border-2 text-left transition-all ${
                    filters.plugTypes.includes(plug.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-sm font-medium">{plug.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Charging location features */}
          <div>
            <h3 className="font-medium mb-2">Charging location features</h3>
            <p className="text-sm text-gray-500 mb-4">Select the features that may interest you.</p>
            <div className="flex flex-wrap gap-2">
              {locationFeatures.map(feature => (
                <Button
                  key={feature.id}
                  variant={filters.locationFeatures.includes(feature.id) ? "default" : "outline"}
                  onClick={() => toggleArrayFilter('locationFeatures', feature.id)}
                  className={`rounded-full text-xs h-8 ${filters.locationFeatures.includes(feature.id) ? 'bg-blue-600 text-white' : ''}`}
                >
                  {feature.name}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Vehicles with Towbar */}
          <div>
            <h3 className="font-medium mb-2">Vehicles with towbar</h3>
            <div className="flex flex-wrap gap-2">
               <Button variant="outline" className="rounded-full text-xs h-8">Caravan</Button>
               <Button variant="outline" className="rounded-full text-xs h-8">Trailer</Button>
            </div>
          </div>
          
          {/* Booking Options */}
          <div>
            <h3 className="font-medium mb-2">Booking options</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="long-term" className="text-sm">
                  <p className="font-medium">Long-term charging discount</p>
                  <p className="text-xs text-gray-500">Show points offering reduced rates for long-term charges</p>
                </label>
                <Switch id="long-term" checked={filters.longTermDiscount} onCheckedChange={(checked) => handleFilterChange('longTermDiscount', checked)} />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="automatic-booking" className="font-medium text-sm">Automatic booking</label>
                <Switch id="automatic-booking" checked={filters.automaticBooking} onCheckedChange={(checked) => handleFilterChange('automaticBooking', checked)} />
              </div>
               <div className="flex items-center justify-between">
                <label htmlFor="autonomous-access" className="font-medium text-sm">Autonomous access</label>
                <Switch id="autonomous-access" checked={filters.autonomousAccess} onCheckedChange={(checked) => handleFilterChange('autonomousAccess', checked)} />
              </div>
            </div>
          </div>

          {/* Favorite charging points */}
          <div>
            <h3 className="font-medium mb-2">Favorite charging points</h3>
            <div className="flex items-center justify-between">
              <label htmlFor="favorites" className="font-medium text-sm">Show only my favorites</label>
              <Switch id="favorites" checked={filters.showOnlyFavorites} onCheckedChange={(checked) => handleFilterChange('showOnlyFavorites', checked)} />
            </div>
          </div>

          {/* Type of Host */}
          <div>
            <h3 className="font-medium mb-2">Type of host</h3>
            <div className="space-y-3">
              {hostTypes.map(hostType => (
                <div key={hostType.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`host-${hostType.id}`}
                    checked={filters.hostTypes.includes(hostType.id)}
                    onCheckedChange={() => toggleArrayFilter('hostTypes', hostType.id)}
                  />
                  <label htmlFor={`host-${hostType.id}`} className="text-sm font-medium">{hostType.name}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6 rounded-b-3xl">
          <Button 
            onClick={() => handleOpenChange(false)}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-2xl h-12 text-base font-medium"
          >
            See results
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
