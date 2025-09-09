import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, Save, Plus, Trash2, X } from 'lucide-react';
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

interface BookedSession {
  id: string;
  clientName: string;
  clientEmail: string;
  startTime: string;
  endTime: string;
  date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  isVirtual: boolean;
}

export const CalendarAvailabilitySettings = () => {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [bookedSessions, setBookedSessions] = useState<BookedSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<BookedSession | null>(null);
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
      
      // Fetch availability slots
      const { data: slotsData, error: slotsError } = await supabase
        .from('coach_time_slots')
        .select('*')
        .eq('coach_id', userProfile.id)
        .gte('start_time', weekStart.toISOString())
        .lte('start_time', weekEnd.toISOString())
        .order('start_time');

      if (slotsError) throw slotsError;

      const slots: AvailabilitySlot[] = slotsData?.map(slot => ({
        id: slot.id,
        date: new Date(slot.start_time),
        startTime: format(new Date(slot.start_time), 'HH:mm'),
        endTime: format(new Date(slot.end_time), 'HH:mm'),
        maxBookings: slot.max_bookings || 1,
        currentBookings: slot.current_bookings || 0,
        slotType: slot.slot_type as 'coaching' | 'webinar' | 'workshop'
      })) || [];

      setAvailabilitySlots(slots);

      // Fetch booked sessions from enrollments table (actual booking data)
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('coach_id', userProfile.id)
        .gte('scheduled_at', weekStart.toISOString())
        .lte('scheduled_at', weekEnd.toISOString())
        .eq('status', 'confirmed')
        .order('scheduled_at');

      // Also fetch coaching_sessions as backup
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('coaching_sessions')
        .select('*')
        .eq('coach_id', userProfile.id)
        .gte('scheduled_at', weekStart.toISOString())
        .lte('scheduled_at', weekEnd.toISOString())
        .order('scheduled_at');

      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError);
      }
      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
      }

      console.log('Enrollments data for calendar:', enrollmentsData);
      console.log('Sessions data for calendar:', sessionsData);

      // Get client IDs from both sources
      const sessionClientIds = sessionsData?.map(s => s.client_id).filter(Boolean) || [];
      const enrollmentUserIds = enrollmentsData?.map(e => e.user_id).filter(Boolean) || [];
      const allUserIds = [...new Set([...sessionClientIds, ...enrollmentUserIds])];

      console.log('All user IDs to fetch:', allUserIds);

      // Fetch user details using the secure function
      let clientsData = [];
      if (allUserIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .rpc('get_coach_client_names', {
            coach_user_id: userProfile.id,
            client_ids: allUserIds
          });
        
        console.log('Fetched users data with function:', usersData, 'Error:', usersError);
        clientsData = usersData || [];
      }

      // Fetch program details for enrollments
      const programIds = enrollmentsData?.map(e => e.course_id).filter(Boolean) || [];
      let programsData = [];
      if (programIds.length > 0) {
        const { data: programs } = await supabase
          .from('individual_programs')
          .select('id, title')
          .in('id', programIds);
        programsData = programs || [];
      }

      const clientMap = new Map(clientsData.map(client => [client.id, client]));
      const programMap = new Map(programsData.map(program => [program.id, program]));

      // Process enrollments data
      const enrollmentSessions: BookedSession[] = enrollmentsData?.map(enrollment => {
        const sessionDate = new Date(enrollment.scheduled_at);
        const endTime = new Date(sessionDate.getTime() + (60 * 60000)); // Default 60 minutes
        
        const startHour = sessionDate.getHours().toString().padStart(2, '0');
        const startMinute = sessionDate.getMinutes().toString().padStart(2, '0');
        const endHour = endTime.getHours().toString().padStart(2, '0');
        const endMinute = endTime.getMinutes().toString().padStart(2, '0');
        
        const year = sessionDate.getFullYear();
        const month = (sessionDate.getMonth() + 1).toString().padStart(2, '0');
        const day = sessionDate.getDate().toString().padStart(2, '0');
        
        const client = clientMap.get(enrollment.user_id);
        const program = programMap.get(enrollment.course_id);
        
        // Debug log for each enrollment
        console.log('Processing enrollment:', {
          enrollmentId: enrollment.id,
          userId: enrollment.user_id,
          clientFound: !!client,
          clientName: client?.name,
          clientEmail: client?.email,
          programTitle: program?.title
        });
        
        return {
          id: enrollment.id,
          clientName: client?.name || `User ${enrollment.user_id?.slice(-8) || 'Unknown'}`,
          clientEmail: client?.email || 'No email available',
          startTime: `${startHour}:${startMinute}`,
          endTime: `${endHour}:${endMinute}`,
          date: `${year}-${month}-${day}`,
          status: enrollment.status as 'scheduled' | 'completed' | 'cancelled',
          notes: program?.title || 'Coaching Session',
          isVirtual: true
        };
      }) || [];

      // Process coaching sessions data
      const coachingSessions: BookedSession[] = sessionsData?.map(session => {
        const sessionDate = new Date(session.scheduled_at);
        const endTime = new Date(sessionDate.getTime() + (session.duration_minutes * 60000));
        
        const startHour = sessionDate.getHours().toString().padStart(2, '0');
        const startMinute = sessionDate.getMinutes().toString().padStart(2, '0');
        const endHour = endTime.getHours().toString().padStart(2, '0');
        const endMinute = endTime.getMinutes().toString().padStart(2, '0');
        
        const year = sessionDate.getFullYear();
        const month = (sessionDate.getMonth() + 1).toString().padStart(2, '0');
        const day = sessionDate.getDate().toString().padStart(2, '0');
        
        const client = clientMap.get(session.client_id);
        
        console.log('Processing session:', {
          sessionId: session.id,
          clientId: session.client_id,
          originalTime: session.scheduled_at,
          parsedTime: sessionDate,
          clientFound: !!client,
          clientName: client?.name,
          clientEmail: client?.email,
          startTime: `${startHour}:${startMinute}`,
          date: `${year}-${month}-${day}`
        });
        
        return {
          id: session.id,
          clientName: client?.name || `Client ${session.client_id?.slice(-8) || 'Unknown'}`,
          clientEmail: client?.email || 'No email available',
          startTime: `${startHour}:${startMinute}`,
          endTime: `${endHour}:${endMinute}`,
          date: `${year}-${month}-${day}`,
          status: session.status as 'scheduled' | 'completed' | 'cancelled',
          notes: session.notes || session.session_type || '',
          isVirtual: true
        };
      }) || [];

      // Combine all sessions
      const allSessions = [...enrollmentSessions, ...coachingSessions];

      setBookedSessions(allSessions);
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

  const getBookedSessionsForDate = (date: Date) => {
    return bookedSessions.filter(session => 
      session.date === format(date, 'yyyy-MM-dd')
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
                    
                    // Check if there's an available slot that covers this hour
                    const hasSlot = daySlots.some(slot => {
                      const slotStartHour = parseInt(slot.startTime.split(':')[0]);
                      const slotEndHour = parseInt(slot.endTime.split(':')[0]);
                      return currentHour >= slotStartHour && currentHour < slotEndHour;
                    });
                    
                    const slotForThisHour = daySlots.find(slot => {
                      const slotStartHour = parseInt(slot.startTime.split(':')[0]);
                      return currentHour === slotStartHour;
                    });

                    // Check for booked sessions
                    const bookedSessionsForDay = getBookedSessionsForDate(day);
                    const bookedSessionForThisHour = bookedSessionsForDay.find(session => {
                      const sessionStartHour = parseInt(session.startTime.split(':')[0]);
                      return currentHour === sessionStartHour;
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
                        {/* Available slot - just show color */}
                        {slotForThisHour && (
                          <div className="absolute inset-0">
                            <div className="bg-primary h-full relative group">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-0 right-0 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-primary-foreground hover:bg-primary-foreground/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTimeSlot(slotForThisHour.id);
                                }}
                              >
                                <Trash2 className="h-2 w-2" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Booked session */}
                        {bookedSessionForThisHour && (
                          <div 
                            className="absolute inset-0 p-1 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSession(bookedSessionForThisHour);
                            }}
                          >
                            <div className="bg-red-500/80 text-white rounded text-xs p-1 h-full flex items-center justify-center">
                              <span className="font-medium truncate text-center">
                                {bookedSessionForThisHour.clientName}
                              </span>
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

      {/* Session Details Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {selectedSession?.clientName}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {selectedSession?.startTime} - {selectedSession?.endTime}
                  </span>
                  {selectedSession?.isVirtual && (
                    <Badge variant="secondary" className="text-xs">Virtual</Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSession(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Session details</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booked by</span>
                  <span>{selectedSession?.clientName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-xs">{selectedSession?.clientEmail || 'Not available'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Session status</span>
                  <Badge variant={selectedSession?.status === 'completed' ? 'default' : 'secondary'}>
                    {selectedSession?.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Program/Notes</span>
                  <span className="text-xs text-right max-w-32 truncate">{selectedSession?.notes || 'General coaching'}</span>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              View case notes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};