import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Calendar } from 'lucide-react';
import { EnrollmentData } from '@/hooks/useEnrollmentWorkflow';

interface TimeSlotSelectionProps {
  coach: EnrollmentData['coach'];
  timeSlots: Array<{
    id: string;
    startTime: string;
    endTime: string;
    date: string;
    isAvailable: boolean;
  }>;
  selectedTimeSlot: EnrollmentData['timeSlot'];
  onSelectTimeSlot: (timeSlot: EnrollmentData['timeSlot']) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading: boolean;
}

export const TimeSlotSelection: React.FC<TimeSlotSelectionProps> = ({
  coach,
  timeSlots,
  selectedTimeSlot,
  onSelectTimeSlot,
  onNext,
  onPrevious,
  isLoading
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01 ${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Group slots by date
  const slotsByDate = timeSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, typeof timeSlots>);

  const canProceed = !!selectedTimeSlot;

  if (!coach) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No coach selected</p>
        <Button onClick={onPrevious} variant="outline" className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Select Time Slot</h3>
        <p className="text-muted-foreground">
          Choose a convenient time for your session with <strong>{coach.name}</strong>
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-4">
        {Object.entries(slotsByDate).map(([date, slots]) => (
          <Card key={date}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(date)}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {slots.map((slot) => {
                  const isSelected = selectedTimeSlot?.id === slot.id;
                  
                  return (
                    <Button
                      key={slot.id}
                      variant={isSelected ? "default" : "outline"}
                      className={`h-auto p-3 flex-col gap-1 relative ${
                        isSelected ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => onSelectTimeSlot(slot)}
                    >
                      {isSelected && (
                        <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-primary-foreground bg-primary rounded-full" />
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm font-medium">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Available
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {timeSlots.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              No available time slots for this coach at the moment.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Please try selecting a different coach or check back later.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedTimeSlot && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="font-medium text-sm">Selected Time Slot</span>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>{formatDate(selectedTimeSlot.date)}</strong> at{' '}
              <strong>{formatTime(selectedTimeSlot.startTime)} - {formatTime(selectedTimeSlot.endTime)}</strong>
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button onClick={onPrevious} variant="outline" disabled={isLoading}>
          Previous
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!canProceed || isLoading}
          className="px-8"
        >
          Next
        </Button>
      </div>
    </div>
  );
};