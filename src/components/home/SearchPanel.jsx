
import React, { useState } from 'react';
import { Search, Calendar, SlidersHorizontal, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DateTimePicker from './DateTimePicker';
import { format } from 'date-fns';
import SearchFilters from './SearchFilters';
import RouteSearchModal from './RouteSearchModal';

export default function SearchPanel({ user, userLocation, onHideNavigation, onShowNavigation, onRouteSearch }) {
  const [searchMode, setSearchMode] = useState('location');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [routeData, setRouteData] = useState({
    departure: null,
    destination: null
  });

  const handleDateTimeSelect = (dateTime) => {
    setSelectedDateTime(dateTime);
    setShowDatePicker(false);
    onShowNavigation?.();
  };

  const handleOpenDatePicker = () => {
    setShowDatePicker(true);
    window.dispatchEvent(new CustomEvent('hideNavigation'));
  };

  const handleCloseDatePicker = () => {
    setShowDatePicker(false);
    window.dispatchEvent(new CustomEvent('showNavigation'));
  };

  const handleFiltersChange = (newFilters) => {
    // You can implement filter logic here to update the charger list
    console.log('Filters changed:', newFilters);
  };
  
  const handleRouteConfirm = (newRouteData) => {
    setRouteData(newRouteData);
    setIsRouteModalOpen(false); // Close the modal after confirming
    console.log('Route confirmed:', newRouteData);
    if(newRouteData.departure && newRouteData.destination){
      onRouteSearch(newRouteData);
    }
  }

  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl p-4 shadow-[0_-5px_25px_-5px_rgba(0,0,0,0.1)] rounded-t-3xl relative">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Hello {user?.first_name || user?.full_name?.split(' ')[0] || 'there'},</h2>
            <p className="text-lg text-gray-800">where will you be loading?</p>
          </div>
          {/* Removed Car Image */}
        </div>

        {/* Search Mode Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-full mb-3">
          <Button
            onClick={() => setSearchMode('location')}
            variant="ghost"
            className={`flex-1 rounded-full text-xs h-8 transition-all ${searchMode === 'location' ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-600'}`}
          >
            at a specific location
          </Button>
          <Button
            onClick={() => setSearchMode('route')}
            variant="ghost"
            className={`flex-1 rounded-full text-xs h-8 transition-all ${searchMode === 'route' ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-600'}`}
          >
            on a route
          </Button>
        </div>

        {/* Inputs */}
        <div className="space-y-2 relative z-50">
          {searchMode === 'location' ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Input placeholder="Search for a city, place or address" className="pl-10 h-10 rounded-full bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 text-sm relative" />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <Input 
                    placeholder={selectedDateTime ? format(selectedDateTime.start, 'MMM d, HH:mm') : "when?"}
                    onClick={handleOpenDatePicker}
                    readOnly
                    className="pl-10 h-10 rounded-full bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 text-sm cursor-pointer" 
                  />
                </div>
                <SearchFilters 
                  onFiltersChange={handleFiltersChange}
                  onHideNavigation={onHideNavigation}
                  onShowNavigation={onShowNavigation}
                />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsRouteModalOpen(true)}>
              <div className="flex-shrink-0 flex flex-col items-center justify-center h-full mr-1">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div className="w-px h-6 bg-gray-300 my-1 border-dotted border-l-2"></div>
                <MapPin className="w-5 h-5 text-gray-500" />
              </div>
              <div className="w-full space-y-2">
                <div className="h-10 rounded-full bg-gray-100 flex items-center px-4 text-sm text-gray-600">
                  {routeData.departure?.name || 'Departure?'}
                </div>
                <div className="h-10 rounded-full bg-gray-100 flex items-center px-4 text-sm text-gray-600">
                  {routeData.destination?.name || 'Destination?'}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      <DateTimePicker 
        isOpen={showDatePicker}
        onClose={handleCloseDatePicker}
        onSelect={handleDateTimeSelect}
        onHideNavigation={onHideNavigation}
        onShowNavigation={onShowNavigation}
      />
      
      <RouteSearchModal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        onConfirm={handleRouteConfirm}
        initialDeparture={routeData.departure}
        initialDestination={routeData.destination}
        userLocation={userLocation}
      />
    </>
  );
}
