import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

export default function AvailabilityCalendar({ availability }) {
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Availability
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {daysOfWeek.map((day, index) => (
            <div key={day} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <span className="font-medium capitalize w-12">
                {dayNames[index]}
              </span>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>24 hours</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700 text-center">
            Available for instant booking
          </p>
        </div>
      </CardContent>
    </Card>
  );
}