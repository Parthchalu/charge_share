
import React, { useState, useEffect, useRef } from 'react';
import { Calendar, X, IndianRupee, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addHours, differenceInHours, differenceInMinutes, setHours, setMinutes, addDays, isToday, isTomorrow } from 'date-fns';

const ScrollablePicker = ({ items, selectedValue, onSelect, renderItem, keyExtractor }) => {
  const containerRef = useRef(null);
  const isProgrammaticScroll = useRef(false);
  const scrollTimeout = useRef(null);

  // Effect to scroll to the selected value when it's changed from outside
  useEffect(() => {
    if (containerRef.current) {
      const selectedIndex = items.findIndex(item => keyExtractor(item) === selectedValue);
      if (selectedIndex >= 0) {
        const container = containerRef.current;
        const itemHeight = 48; // Corresponds to h-12 in Tailwind
        const targetScrollTop = selectedIndex * itemHeight;

        isProgrammaticScroll.current = true;
        container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
        
        // Reset the flag after scrolling is likely complete
        setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 500);
      }
    }
  }, [selectedValue, items, keyExtractor]);

  const handleScroll = () => {
    if (isProgrammaticScroll.current) return;

    clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      if (containerRef.current) {
        const itemHeight = 48; // Corresponds to h-12 in Tailwind
        const centeredIndex = Math.round(containerRef.current.scrollTop / itemHeight);
        const selectedItem = items[centeredIndex];
        
        if (selectedItem && keyExtractor(selectedItem) !== selectedValue) {
          onSelect(selectedItem);
        }
      }
    }, 150); // Debounce to capture final scroll position
  };

  return (
    <div className="relative h-32"> {/* Outer container for positioning overlays */}
      {/* The scrolling container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto"
        style={{ 
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none' 
        }}
      >
        {/* Padding to allow first/last items to snap to center */}
        <div className="pt-[40px] pb-[40px]"> 
          {items.map((item) => (
            <div
              key={keyExtractor(item)}
              className="h-12 flex items-center justify-center text-lg font-medium text-gray-500 cursor-pointer"
              style={{ scrollSnapAlign: 'center' }}
              onClick={() => onSelect(item)} // Keep click for accessibility
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>
      
      {/* Selection indicator & fades */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-[40px] bg-gradient-to-b from-gray-100 to-transparent" />
        {/* Selection highlight bar */}
        <div className="absolute top-1/2 left-0 right-0 h-12 -translate-y-1/2 bg-gray-900/5 rounded-lg" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-gradient-to-t from-gray-100 to-transparent" />
      </div>
    </div>
  );
};

const CombinedDateTimePicker = ({ selectedDateTime, onDateTimeChange, mode, startTime }) => {
  // Generate date options based on mode
  let dateOptions;
  
  if (mode === 'end' && startTime) {
    // For end time, only show dates within 24 hours of start time
    const maxEndDate = addHours(startTime, 24);
    const startDateForPicker = new Date(startTime);
    startDateForPicker.setHours(0, 0, 0, 0); // Start of the start day
    
    // Calculate the number of days to display
    // This will be 1 or 2 days depending on whether maxEndDate falls on the next day
    const daysToDisplay = Math.ceil((maxEndDate.getTime() - startDateForPicker.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    dateOptions = Array.from({ length: Math.min(daysToDisplay, 2) }, (_, i) => {
      const date = addDays(startDateForPicker, i);
      return {
        date,
        label: isToday(date) ? 'Today' : isTomorrow(date) ? 'Tomorrow' : format(date, 'EEE'),
        subtitle: format(date, 'd MMM')
      };
    });
  } else {
    // For start time, show next 30 days
    dateOptions = Array.from({ length: 30 }, (_, i) => {
      const date = addDays(new Date(), i);
      return {
        date,
        label: isToday(date) ? 'Today' : isTomorrow(date) ? 'Tomorrow' : format(date, 'EEE'),
        subtitle: format(date, 'd MMM')
      };
    });
  }

  // Generate hour options (all 24 hours)
  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i, label: i.toString().padStart(2, '0')
  }));

  // Generate minute options (all 60 minutes)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({ 
    value: i, label: i.toString().padStart(2, '0') 
  }));

  const selectedDate = selectedDateTime.toDateString();
  const selectedHour = selectedDateTime.getHours();
  const selectedMinute = selectedDateTime.getMinutes();

  const handleDateSelect = (dateOption) => {
    const newDateTime = new Date(dateOption.date);
    newDateTime.setHours(selectedHour, selectedMinute, 0, 0);
    onDateTimeChange(newDateTime);
  };

  const handleHourSelect = (hourOption) => {
    const newDateTime = new Date(selectedDateTime);
    newDateTime.setHours(hourOption.value);
    onDateTimeChange(newDateTime);
  };

  const handleMinuteSelect = (minuteOption) => {
    const newDateTime = new Date(selectedDateTime);
    newDateTime.setMinutes(minuteOption.value);
    onDateTimeChange(newDateTime);
  };

  return (
    <div className="bg-gray-100 rounded-3xl p-4 my-6">
      <div className="grid grid-cols-4 gap-4">
        {/* Date Picker */}
        <div className="col-span-2">
          <ScrollablePicker
            items={dateOptions}
            selectedValue={selectedDate}
            onSelect={handleDateSelect}
            keyExtractor={(item) => item.date.toDateString()}
            renderItem={(item) => (
              <div className={`text-center font-semibold leading-tight ${selectedDate === item.date.toDateString() ? 'text-gray-900' : ''}`}>
                <div className="text-lg">{item.label}</div>
                <div className="text-xs opacity-70">{item.subtitle}</div>
              </div>
            )}
          />
        </div>

        {/* Hour Picker */}
        <div className="col-span-1">
          <ScrollablePicker
            items={hourOptions}
            selectedValue={selectedHour}
            onSelect={handleHourSelect}
            keyExtractor={(item) => item.value}
            renderItem={(item) => <span className={selectedHour === item.value ? 'text-gray-900' : ''}>{item.label}</span>}
          />
        </div>

        {/* Minute Picker */}
        <div className="col-span-1">
          <ScrollablePicker
            items={minuteOptions}
            selectedValue={selectedMinute}
            onSelect={handleMinuteSelect}
            keyExtractor={(item) => item.value}
            renderItem={(item) => <span className={selectedMinute === item.value ? 'text-gray-900' : ''}>{item.label}</span>}
          />
        </div>
      </div>
    </div>
  );
};

export default function DateTimePicker({ isOpen, onClose, onSelect, onHideNavigation, onShowNavigation }) {
  const [selectedMode, setSelectedMode] = useState('start');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(addHours(new Date(), 1));
  const [selectedDuration, setSelectedDuration] = useState(1);
  
  const displayTime = selectedMode === 'start' ? startTime : endTime;

  const handleSetDuration = (hours) => {
    setSelectedDuration(hours);
    setEndTime(addHours(startTime, hours));
  };

  const handleTimeChange = (newTime) => {
    if (selectedMode === 'start') {
      setStartTime(newTime);
      // Automatically adjust end time to maintain current duration, but cap at 24 hours
      const currentDuration = Math.min(selectedDuration, 24);
      setEndTime(addHours(newTime, currentDuration));
    } else { // 'end' mode
      const maxEndTime = addHours(startTime, 24);
      let finalEndTime = newTime;
      
      // If selected end time is more than 24 hours after start, limit it
      if (finalEndTime > maxEndTime) {
        finalEndTime = maxEndTime;
      }
      
      // Ensure end time is after start time
      if (finalEndTime <= startTime) {
        finalEndTime = addHours(startTime, 1); // Default to 1 hour duration
      }
      
      setEndTime(finalEndTime);
      
      // Calculate and update duration (in hours)
      const durationInMinutes = differenceInMinutes(finalEndTime, startTime);
      const durationInHours = Math.round(durationInMinutes / 60 * 100) / 100; // Round to 2 decimal places
      setSelectedDuration(Math.max(durationInHours, 0.25)); // Minimum 15 minutes
    }
  };

  const handleNext = () => {
    if (selectedMode === 'start') {
      setSelectedMode('end');
    } else {
      onSelect({ start: startTime, end: endTime });
      onClose();
    }
  };

  const handleClose = () => {
    onShowNavigation?.();
    onClose();
  };

  const getChargeButtonText = () => {
    const durationInMinutes = differenceInMinutes(endTime, startTime);
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    
    if (hours > 0 && minutes > 0) {
      return `Charge for ${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`;
    } else if (hours > 0) {
      return `Charge for ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0){
      return `Charge for ${minutes} min`;
    } else {
      return "Select Duration"; // Fallback if duration is 0 or negative
    }
  };
  
  useEffect(() => {
    if (isOpen) {
        const now = new Date();
        const initialStartTime = setMinutes(now, Math.ceil(now.getMinutes() / 15) * 15);
        // If the calculated time is in the past, move it to the next full hour or block
        if (initialStartTime < now) {
          initialStartTime.setHours(initialStartTime.getHours() + 1);
          initialStartTime.setMinutes(0); // Set minutes to 0 for next hour start
        }
        
        setStartTime(initialStartTime);
        setEndTime(addHours(initialStartTime, 1));
        setSelectedMode('start');
        setSelectedDuration(1);
        onHideNavigation?.();
    }
  }, [isOpen, onHideNavigation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end">
      <div className="bg-white w-full rounded-t-3xl p-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">When will you charge?</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
          <button
            onClick={() => setSelectedMode('start')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
              selectedMode === 'start' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            Start of charge
          </button>
          <button
            onClick={() => setSelectedMode('end')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
              selectedMode === 'end' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            End of charge
          </button>
        </div>

        {/* Combined Date Time Picker */}
        <CombinedDateTimePicker 
          selectedDateTime={displayTime}
          onDateTimeChange={handleTimeChange}
          mode={selectedMode}
          startTime={startTime}
        />

        {/* Duration Selector - only show for end mode */}
        {selectedMode === 'end' && (
          <div className="my-6 space-y-6">
            <div>
              <p className="text-center text-sm font-medium text-gray-600 mb-3">Select a duration</p>
              <div className="grid grid-cols-4 gap-2">
                {[1, 4, 8, 12].map(hours => (
                  <button
                    key={hours}
                    onClick={() => handleSetDuration(hours)}
                    className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1 ${
                      selectedDuration === hours 
                        ? 'bg-gray-900 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {hours > 1 && <IndianRupee className="w-3 h-3 opacity-70" />}
                    {hours}h
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-blue-100/70 text-blue-800 p-3 rounded-2xl flex items-center gap-3">
              <div className="bg-blue-200 p-1.5 rounded-full">
                <IndianRupee className="w-4 h-4" />
              </div>
              <p className="text-sm font-medium">Enjoy discounts at selected stations.</p>
            </div>
          </div>
        )}

        <Button 
          onClick={handleNext} 
          className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-medium flex items-center justify-center gap-2"
        >
          {selectedMode === 'end' ? getChargeButtonText() : 'Next'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
