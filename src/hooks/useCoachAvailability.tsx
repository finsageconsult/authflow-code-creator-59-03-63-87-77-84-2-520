import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  date: string;
  isAvailable: boolean;
  maxBookings: number;
  currentBookings: number;
  slotType: 'coaching' | 'consultation';
}

export const useCoachAvailability = (coachId?: string) => {
  const { userProfile } = useAuth();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAvailableSlots = async (targetCoachId?: string) => {
    const coachToFetch = targetCoachId || coachId;
    if (!coachToFetch) return;

    try {
      setIsLoading(true);
      
      // Get future available time slots
      const now = new Date();
      const twoWeeksFromNow = new Date();
      twoWeeksFromNow.setDate(now.getDate() + 14);

      const { data, error } = await supabase
        .from('coach_time_slots')
        .select('*')
        .eq('coach_id', coachToFetch)
        .eq('is_available', true)
        .gte('start_time', now.toISOString())
        .lte('start_time', twoWeeksFromNow.toISOString())
        .lt('current_bookings', 'max_bookings')
        .order('start_time');

      if (error) throw error;

      const formattedSlots: TimeSlot[] = data?.map(slot => ({
        id: slot.id,
        startTime: new Date(slot.start_time).toTimeString().slice(0, 5),
        endTime: new Date(slot.end_time).toTimeString().slice(0, 5),
        date: new Date(slot.start_time).toISOString().split('T')[0],
        isAvailable: slot.current_bookings < slot.max_bookings,
        maxBookings: slot.max_bookings || 1,
        currentBookings: slot.current_bookings || 0,
        slotType: (slot.slot_type === 'consultation' ? 'consultation' : 'coaching') as 'coaching' | 'consultation'
      })) || [];

      setTimeSlots(formattedSlots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setTimeSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const bookTimeSlot = async (slotId: string, userId: string) => {
    try {
      // First, increment the current bookings
      const { data: slot, error: fetchError } = await supabase
        .from('coach_time_slots')
        .select('current_bookings, max_bookings')
        .eq('id', slotId)
        .single();

      if (fetchError) throw fetchError;

      if (slot.current_bookings >= slot.max_bookings) {
        throw new Error('Time slot is fully booked');
      }

      const { error: updateError } = await supabase
        .from('coach_time_slots')
        .update({ 
          current_bookings: slot.current_bookings + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', slotId);

      if (updateError) throw updateError;

      // Refresh the slots
      await fetchAvailableSlots();
      
      return true;
    } catch (error) {
      console.error('Error booking time slot:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (coachId) {
      fetchAvailableSlots(coachId);
    }
  }, [coachId]);

  return {
    timeSlots,
    isLoading,
    fetchAvailableSlots,
    bookTimeSlot,
    refetch: () => fetchAvailableSlots(coachId)
  };
};