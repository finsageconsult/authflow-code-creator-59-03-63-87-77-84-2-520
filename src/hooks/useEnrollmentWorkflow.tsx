import { useState, useCallback, useEffect } from 'react';
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useCoachAvailability } from './useCoachAvailability';
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
    specialties: string[];
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
  specialties: string[];
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
  const { timeSlots, fetchAvailableSlots } = useCoachAvailability();

  // Fetch real coaches from database 
  const fetchCoaches = async () => {
    try {
      setIsLoading(true);
      
      // First check what coaches exist
      const { data: coachData, error } = await supabase
        .from('users')
        .select('id, name, email, avatar_url, specialties, experience, role, status')
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
          .select('id, name, email, role, status, specialties, experience, avatar_url')
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
        const rating = 4.3 + (Math.random() * 0.7); // Generate rating between 4.3-5.0
        
        // Use specialties from database without fallback; empty means no specialties set
        const specialties = coach.specialties && coach.specialties.length > 0 
          ? coach.specialties
          : [];

        return {
          id: coach.id,
          name: coach.name || 'Professional Coach',
          specialties: specialties,
          rating: Number(rating.toFixed(1)),
          experience: coach.experience || 'New Coach', // Use actual experience from database
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

  // Filter coaches based on course tags with improved matching
  const filterCoachesByCourse = useCallback((course: EnrollmentData['course']) => {
    if (!course || !course.tags || course.tags.length === 0) {
      console.log('No course tags found, showing all coaches');
      setFilteredCoaches(realCoaches);
      return;
    }

    const courseTags = course.tags.map(tag => tag.toLowerCase().trim());
    console.log('Course tags to match:', courseTags);
    
    const matchingCoaches = realCoaches.filter(coach => {
      if (!coach.specialties || coach.specialties.length === 0) {
        return false; // Don't show coaches without specialties
      }
      
      const coachSpecialties = coach.specialties.map(s => s.toLowerCase().trim());
      console.log(`Checking coach ${coach.name} with specialties:`, coachSpecialties);
      
      const hasMatch = courseTags.some(courseTag => 
        coachSpecialties.some(specialty => {
          // Exact match or partial match
          const exactMatch = specialty === courseTag || courseTag === specialty;
          const partialMatch = specialty.includes(courseTag) || courseTag.includes(specialty);
          
          // Specific keyword matching for financial terms
          const keywordMatch = (
            (courseTag.includes('financial') && specialty.includes('financial')) ||
            (courseTag.includes('investment') && specialty.includes('investment')) ||
            (courseTag.includes('planning') && specialty.includes('planning')) ||
            (courseTag.includes('tax') && specialty.includes('tax')) ||
            (courseTag.includes('insurance') && specialty.includes('insurance')) ||
            (courseTag.includes('debt') && specialty.includes('debt')) ||
            (courseTag.includes('portfolio') && specialty.includes('portfolio')) ||
            (courseTag.includes('budget') && specialty.includes('budget')) ||
            (courseTag.includes('saving') && specialty.includes('saving'))
          );
          
          return exactMatch || partialMatch || keywordMatch;
        })
      );
      
      console.log(`Coach ${coach.name} match result:`, hasMatch);
      return hasMatch;
    });

    console.log('Filtering coaches by course tags:', courseTags);
    console.log('Found matching coaches:', matchingCoaches.length, 'out of', realCoaches.length);
    
    // Always show filtered coaches, even if empty (with appropriate message)
    setFilteredCoaches(matchingCoaches);
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
    // Fetch real time slots from the coach's availability
    fetchAvailableSlots(coachId);
    return timeSlots;
  };

  const setCourse = useCallback((course: EnrollmentData['course']) => {
    setEnrollmentData(prev => ({ ...prev, course }));
    filterCoachesByCourse(course);
  }, [filterCoachesByCourse]);

  const setCoach = useCallback((coach: EnrollmentData['coach']) => {
    setEnrollmentData(prev => ({ ...prev, coach }));
    if (coach) {
      fetchAvailableSlots(coach.id);
    }
  }, [fetchAvailableSlots]);

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
      // Get the current user's auth ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create enrollment record using auth user ID
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          user_id: userProfile.id, // Use the internal user ID from userProfile
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
    timeSlots,
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