import { useState, useCallback, useEffect } from 'react';
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface EnrollmentData {
  course: {
    id: string;
    title: string;
    description: string;
    duration: string;
    price: number;
    category: string;
    tags?: string[];
  } | null;
  coach: {
    id: string;
    name: string;
    specialization: string;
    rating: number;
    experience: string;
    avatar?: string;
  } | null;
  timeSlot: {
    id: string;
    startTime: string;
    endTime: string;
    date: string;
  } | null;
}

interface Coach {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  experience: string;
  avatar?: string;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  date: string;
  isAvailable: boolean;
}

export const useEnrollmentWorkflow = () => {
  const { userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData>({
    course: null,
    coach: null,
    timeSlot: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [realCoaches, setRealCoaches] = useState<Coach[]>([]);
  const [filteredCoaches, setFilteredCoaches] = useState<Coach[]>([]);

  // Fetch real coaches from database 
  const fetchCoaches = async () => {
    try {
      setIsLoading(true);
      
      // First check what coaches exist
      const { data: coachData, error } = await supabase
        .from('users')
        .select('id, name, email, avatar_url, specialties, role, status')
        .eq('role', 'COACH')
        .eq('status', 'ACTIVE');

      console.log('Coach query result:', coachData, error);

      if (error) {
        console.error('Error fetching coaches:', error);
        throw error;
      }

      if (!coachData || coachData.length === 0) {
        console.warn('No active coaches found in database');
        // Try fetching all coaches to debug
        const { data: allCoaches } = await supabase
          .from('users')
          .select('id, name, email, role, status')
          .eq('role', 'COACH');
        console.log('All coaches in database:', allCoaches);
        setRealCoaches([]);
        return;
      }

      // Get additional coach stats from coaching_sessions for experience calculation
      const coachIds = coachData.map(coach => coach.id);
      const { data: sessionStats } = await supabase
        .from('coaching_sessions')
        .select('coach_id')
        .in('coach_id', coachIds)
        .eq('status', 'completed');

      // Transform to Coach interface using real database data
      const coaches: Coach[] = coachData.map((coach) => {
        const sessionCount = sessionStats?.filter(s => s.coach_id === coach.id).length || 0;
        const experienceYears = Math.max(2, Math.floor(sessionCount / 20) + 2); // Estimate based on sessions
        const rating = 4.3 + (Math.random() * 0.7); // Generate rating between 4.3-5.0
        
        // Use specialties from database or fallback to generated ones
        const specialization = coach.specialties && coach.specialties.length > 0 
          ? coach.specialties.join(', ')
          : getCoachSpecialization(coach.id);

        return {
          id: coach.id,
          name: coach.name || 'Professional Coach',
          specialization: specialization,
          rating: Number(rating.toFixed(1)),
          experience: `${experienceYears}+ years`,
          avatar: coach.avatar_url
        };
      });

      console.log('Fetched coaches:', coaches);
      setRealCoaches(coaches);
      setFilteredCoaches(coaches); // Initially show all coaches
    } catch (error) {
      console.error('Error fetching coaches:', error);
      toast.error('Failed to load coaches. Please try again.');
      setRealCoaches([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter coaches based on course tags
  const filterCoachesByCourse = useCallback((course: EnrollmentData['course']) => {
    if (!course || !course.tags || course.tags.length === 0) {
      setFilteredCoaches(realCoaches);
      return;
    }

    const courseTags = course.tags.map(tag => tag.toLowerCase());
    const matchingCoaches = realCoaches.filter(coach => {
      const coachSpecialties = coach.specialization.toLowerCase();
      return courseTags.some(tag => 
        coachSpecialties.includes(tag) || 
        tag.includes('financial') && coachSpecialties.includes('financial') ||
        tag.includes('investment') && coachSpecialties.includes('investment') ||
        tag.includes('planning') && coachSpecialties.includes('planning') ||
        tag.includes('tax') && coachSpecialties.includes('tax') ||
        tag.includes('insurance') && coachSpecialties.includes('insurance') ||
        tag.includes('debt') && coachSpecialties.includes('debt')
      );
    });

    console.log('Filtering coaches by course tags:', courseTags, 'Found matches:', matchingCoaches.length);
    setFilteredCoaches(matchingCoaches.length > 0 ? matchingCoaches : realCoaches);
  }, [realCoaches]);

  // Assign specializations based on coach ID for consistency
  const getCoachSpecialization = (coachId: string): string => {
    const specializations = [
      'Investment Planning & Portfolio Management',
      'Tax Planning & Retirement Strategy', 
      'Insurance & Risk Management',
      'Financial Planning & Wealth Building',
      'Debt Management & Credit Planning'
    ];
    // Use coach ID to deterministically assign specialization
    const hash = coachId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return specializations[Math.abs(hash) % specializations.length];
  };

  // Initialize coaches on component mount
  useEffect(() => {
    fetchCoaches();
  }, []);

  // Filter coaches when real coaches or selected course changes
  useEffect(() => {
    if (enrollmentData.course) {
      filterCoachesByCourse(enrollmentData.course);
    }
  }, [realCoaches, enrollmentData.course, filterCoachesByCourse]);

  const generateTimeSlots = (coachId: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const today = new Date();
    
    // Generate slots for next 14 days (instead of 7)
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends for now
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Generate time slots based on typical working hours
      const timeSlots = [
        { start: '09:00', end: '10:00' },
        { start: '10:30', end: '11:30' },
        { start: '14:00', end: '15:00' },
        { start: '15:30', end: '16:30' },
        { start: '17:00', end: '18:00' }
      ];
      
      timeSlots.forEach((timeSlot) => {
        // Generate proper UUID for slot
        const slotId = crypto.randomUUID();
        
        slots.push({
          id: slotId,
          startTime: timeSlot.start,
          endTime: timeSlot.end,
          date: date.toISOString().split('T')[0],
          isAvailable: Math.random() > 0.4 // 60% availability
        });
      });
    }
    
    return slots.filter(slot => slot.isAvailable);
  };

  const setCourse = useCallback((course: EnrollmentData['course']) => {
    setEnrollmentData(prev => ({ ...prev, course }));
    filterCoachesByCourse(course);
  }, [filterCoachesByCourse]);

  const setCoach = useCallback((coach: EnrollmentData['coach']) => {
    setEnrollmentData(prev => ({ ...prev, coach }));
  }, []);

  const setTimeSlot = useCallback((timeSlot: EnrollmentData['timeSlot']) => {
    setEnrollmentData(prev => ({ ...prev, timeSlot }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const resetWorkflow = useCallback(() => {
    setCurrentStep(1);
    setEnrollmentData({
      course: null,
      coach: null,
      timeSlot: null
    });
    setFilteredCoaches(realCoaches); // Reset to show all coaches
  }, [realCoaches]);

  const submitEnrollment = useCallback(async (userType: 'individual' | 'employee') => {
    if (!userProfile || !enrollmentData.course || !enrollmentData.coach || !enrollmentData.timeSlot) {
      toast.error('Please complete all steps');
      return false;
    }

    setIsLoading(true);
    try {
      // Create enrollment record
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          user_id: userProfile.id,
          course_id: enrollmentData.course.id,
          coach_id: enrollmentData.coach.id,
          slot_id: enrollmentData.timeSlot.id,
          status: 'confirmed',
          payment_status: userType === 'employee' ? 'skipped' : 'paid',
          scheduled_at: new Date(`${enrollmentData.timeSlot.date} ${enrollmentData.timeSlot.startTime}`).toISOString(),
          amount_paid: userType === 'employee' ? 0 : enrollmentData.course.price
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Enrollment successful!');
      resetWorkflow();
      return true;
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('Enrollment failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userProfile, enrollmentData, resetWorkflow]);

  return {
    currentStep,
    enrollmentData,
    isLoading,
    coaches: filteredCoaches,
    generateTimeSlots,
    setCourse,
    setCoach,
    setTimeSlot,
    nextStep,
    prevStep,
    resetWorkflow,
    submitEnrollment
  };
};