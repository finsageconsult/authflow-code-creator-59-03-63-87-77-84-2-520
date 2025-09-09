import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, Save, Plus, Trash2 } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface AvailabilitySlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  maxBookings: number;
  currentBookings: number;
  slotType: 'coaching' | 'webinar' | 'workshop';
}

export const CalendarAvailabilitySettings = () => {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newSlot, setNewSlot] = useState({
    startTime: '09:00',
    endTime: '10:00',
    maxBookings: 1,
    slotType: 'coaching' as 'coaching' | 'webinar' | 'workshop'
  });

  // Get date range for the selected week
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

  const fetchAvailability = async () => {
    if (!userProfile) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('coach_time_slots')
        .select('*')
        .eq('coach_id', userProfile.id)
        .gte('start_time', weekStart.toISOString())
        .lte('start_time', weekEnd.toISOString())
        .order('start_time');

      if (error) throw error;

      const slots: AvailabilitySlot[] = data?.map(slot => ({
        id: slot.id,
        date: new Date(slot.start_time),
        startTime: format(new Date(slot.start_time), 'HH:mm'),
        endTime: format(new Date(slot.end_time), 'HH:mm'),
        maxBookings: slot.max_bookings || 1,
        currentBookings: slot.current_bookings || 0,
        slotType: slot.slot_type as 'coaching' | 'webinar' | 'workshop'
      })) || [];

      setAvailabilitySlots(slots);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast({
        title: "Error",
        description: "Failed to load availability data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [selectedDate, userProfile]);

  const addTimeSlot = async () => {
    if (!userProfile || !selectedDate) return;

    try {
      const startDateTime = new Date(selectedDate);
      const [startHour, startMinute] = newSlot.startTime.split(':');
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

      const endDateTime = new Date(selectedDate);
      const [endHour, endMinute] = newSlot.endTime.split(':');
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

      const { data, error } = await supabase
        .from('coach_time_slots')
        .insert({
          coach_id: userProfile.id,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          max_bookings: newSlot.maxBookings,
          slot_type: newSlot.slotType,
          is_available: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Time slot added successfully.",
      });

      fetchAvailability();
    } catch (error) {
      console.error('Error adding time slot:', error);
      toast({
        title: "Error",
        description: "Failed to add time slot.",
        variant: "destructive"
      });
    }
  };

  const deleteTimeSlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('coach_time_slots')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Time slot deleted successfully.",
      });

      fetchAvailability();
    } catch (error) {
      console.error('Error deleting time slot:', error);
      toast({
        title: "Error",
        description: "Failed to delete time slot.",
        variant: "destructive"
      });
    }
  };

  const getSlotsForDate = (date: Date) => {
    return availabilitySlots.filter(slot => 
      format(slot.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const generateWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Calendar Availability Settings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Set your availability using the calendar interface. Click on dates to add time slots.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Calendar and Date Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Add Time Slot for {format(selectedDate, 'MMMM d, yyyy')}
                </Label>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Start Time</Label>
                      <Input
                        type="time"
                        value={newSlot.startTime}
                        onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">End Time</Label>
                      <Input
                        type="time"
                        value={newSlot.endTime}
                        onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Max Bookings</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={newSlot.maxBookings}
                        onChange={(e) => setNewSlot(prev => ({ ...prev, maxBookings: parseInt(e.target.value) || 1 }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Type</Label>
                      <select
                        value={newSlot.slotType}
                        onChange={(e) => setNewSlot(prev => ({ ...prev, slotType: e.target.value as 'coaching' | 'webinar' | 'workshop' }))}
                        className="mt-1 w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                      >
                        <option value="coaching">Coaching</option>
                        <option value="webinar">Webinar</option>
                        <option value="workshop">Workshop</option>
                      </select>
                    </div>
                  </div>

                  <Button onClick={addTimeSlot} className="w-full" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Time Slot
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Week of {format(weekStart, 'MMMM d')} - {format(weekEnd, 'MMMM d, yyyy')}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm">
              <Button variant="outline" size="sm">Today</Button>
              <Button variant="outline" size="sm">Week</Button>
              <Button variant="outline" size="sm" className="text-primary">Working Hours</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-0 border border-border rounded-lg overflow-hidden">
            {/* Time column */}
            <div className="bg-muted/20 border-r border-border">
              <div className="h-12 border-b border-border flex items-center justify-center text-sm font-medium">
                Time
              </div>
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="h-12 border-b border-border flex items-center justify-center text-xs text-muted-foreground">
                  {String(7 + i).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Day columns */}
            {generateWeekDays().map((day, dayIndex) => {
              const daySlots = getSlotsForDate(day);
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              
              return (
                <div key={day.toISOString()} className="border-r border-border last:border-r-0">
                  {/* Day header */}
                  <div className={cn(
                    "h-12 border-b border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors",
                    isToday && "bg-primary/10"
                  )}
                  onClick={() => setSelectedDate(day)}>
                    <div className="text-xs text-muted-foreground font-medium">
                      {format(day, 'EEE')}
                    </div>
                    <div className={cn(
                      "text-sm font-medium",
                      isToday && "text-primary font-bold"
                    )}>
                      {format(day, 'd')}
                    </div>
                  </div>

                  {/* Time slots */}
                  {Array.from({ length: 12 }, (_, hourIndex) => {
                    const currentHour = 7 + hourIndex;
                    const timeSlot = `${String(currentHour).padStart(2, '0')}:00`;
                    
                    // Check if there's a slot that covers this hour
                    const hasSlot = daySlots.some(slot => {
                      const slotStartHour = parseInt(slot.startTime.split(':')[0]);
                      const slotEndHour = parseInt(slot.endTime.split(':')[0]);
                      return currentHour >= slotStartHour && currentHour < slotEndHour;
                    });
                    
                    const slotForThisHour = daySlots.find(slot => {
                      const slotStartHour = parseInt(slot.startTime.split(':')[0]);
                      return currentHour === slotStartHour;
                    });

                    return (
                      <div
                        key={hourIndex}
                        className={cn(
                          "h-12 border-b border-border relative group cursor-pointer transition-colors",
                          hasSlot ? "bg-primary/20 hover:bg-primary/30" : "hover:bg-muted/30"
                        )}
                        onClick={() => setSelectedDate(day)}
                      >
                        {slotForThisHour && (
                          <div className="absolute inset-0 p-1">
                            <div className="bg-primary/80 text-primary-foreground rounded text-xs p-1 h-full flex flex-col justify-between">
                              <div className="flex items-center justify-between">
                                <span className="font-medium truncate">
                                  {slotForThisHour.startTime}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-primary-foreground hover:bg-primary-foreground/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTimeSlot(slotForThisHour.id);
                                  }}
                                >
                                  <Trash2 className="h-2 w-2" />
                                </Button>
                              </div>
                              <div className="text-xs opacity-80 truncate">
                                {slotForThisHour.slotType}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};