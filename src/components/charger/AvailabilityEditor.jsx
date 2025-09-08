
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { X, Copy, PlusCircle } from 'lucide-react';
import { toast } from "sonner";

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const dayLabels = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
};

const TimeSlot = ({ timeSlot, onUpdate, onRemove }) => {
    const [start, end] = timeSlot.split('-');
    
    const handleTimeChange = (part, value) => {
        const newTime = part === 'start' ? `${value}-${end}` : `${start}-${value}`;
        onUpdate(newTime);
    };

    return (
        <div className="flex items-center gap-2">
            <Input 
                type="time" 
                value={start} 
                onChange={(e) => handleTimeChange('start', e.target.value)} 
                className="bg-gray-50 flex-1 min-w-0"
            />
            <span className="text-gray-400">-</span>
            <Input 
                type="time" 
                value={end} 
                onChange={(e) => handleTimeChange('end', e.target.value)} 
                className="bg-gray-50 flex-1 min-w-0"
            />
            <Button variant="ghost" size="icon" onClick={onRemove} className="text-gray-400 hover:text-red-500 h-8 w-8 flex-shrink-0">
                <X className="w-4 h-4" />
            </Button>
        </div>
    );
};

export default function AvailabilityEditor({ value, onChange }) {
    const [schedule, setSchedule] = useState(() => {
        // Ensure schedule is initialized with all days
        const initialSchedule = {};
        daysOfWeek.forEach(day => {
            initialSchedule[day] = value?.[day] || [];
        });
        return initialSchedule;
    });

    const handleDayToggle = (day, isChecked) => {
        const newSchedule = { ...schedule };
        if (isChecked) {
            // Add a default time slot if none exists
            if (newSchedule[day].length === 0) {
                newSchedule[day] = ["09:00-17:00"];
            }
        } else {
            // Clear time slots when toggled off
            newSchedule[day] = [];
        }
        setSchedule(newSchedule);
        onChange(newSchedule);
    };
    
    const handleAddSlot = (day) => {
        const newSchedule = { ...schedule };
        newSchedule[day].push("09:00-17:00"); // Add a new default slot
        setSchedule(newSchedule);
        onChange(newSchedule);
    };

    const handleUpdateSlot = (day, index, newTimeSlot) => {
        const newSchedule = { ...schedule };
        newSchedule[day][index] = newTimeSlot;
        setSchedule(newSchedule);
        onChange(newSchedule);
    };

    const handleRemoveSlot = (day, index) => {
        const newSchedule = { ...schedule };
        newSchedule[day].splice(index, 1);
        setSchedule(newSchedule);
        onChange(newSchedule);
    };

    const copyToAll = () => {
        const mondaySlots = schedule.monday;
        if (mondaySlots.length === 0) {
            toast.error("Monday has no time slots to copy.");
            return;
        }
        const newSchedule = {};
        daysOfWeek.forEach(day => {
            newSchedule[day] = [...mondaySlots];
        });
        setSchedule(newSchedule);
        onChange(newSchedule);
        toast.success("Monday's schedule copied to all other days.");
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={copyToAll} className="text-sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Monday to All Days
                </Button>
            </div>
            {daysOfWeek.map(day => {
                const isOpen = schedule[day] && schedule[day].length > 0;
                return (
                    <div key={day} className="p-3 border rounded-lg bg-white">
                        <div className="flex items-center justify-between mb-3">
                            <label htmlFor={`switch-${day}`} className="text-sm font-medium text-gray-800">
                                {dayLabels[day]}
                            </label>
                            <div className="flex items-center space-x-2">
                                <span className={`text-xs ${isOpen ? 'text-green-600' : 'text-gray-400'}`}>
                                    {isOpen ? 'Open' : 'Closed'}
                                </span>
                                <Switch
                                    id={`switch-${day}`}
                                    checked={isOpen}
                                    onCheckedChange={(isChecked) => handleDayToggle(day, isChecked)}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>
                        </div>

                        {isOpen && (
                            <div className="space-y-2 pl-1">
                                {schedule[day].map((timeSlot, index) => (
                                    <TimeSlot
                                        key={index}
                                        timeSlot={timeSlot}
                                        onUpdate={(newTimeSlot) => handleUpdateSlot(day, index, newTimeSlot)}
                                        onRemove={() => handleRemoveSlot(day, index)}
                                    />
                                ))}
                                <Button 
                                    variant="link" 
                                    size="sm" 
                                    onClick={() => handleAddSlot(day)}
                                    className="text-blue-600 hover:text-blue-700 p-0 h-auto text-sm"
                                >
                                    <PlusCircle className="w-4 h-4 mr-1" />
                                    Add another time slot
                                </Button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
