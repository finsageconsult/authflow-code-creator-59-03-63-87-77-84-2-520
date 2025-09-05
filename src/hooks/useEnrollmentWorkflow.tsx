import { useState, useCallback, useEffect } from 'react';
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

  // Fetch real coaches from database
  const fetchCoaches = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, avatar_url')
        .eq('role', 'COACH')
        .eq('status', 'ACTIVE');

      if (error) throw error;

      // Transform to Coach interface with additional data
      const coaches: Coach[] = (data || []).map((coach, index) => ({
        id: coach.id,
        name: coach.name || 'Professional Coach',
        specialization: getCoachSpecialization(index),
        rating: 4.5 + (Math.random() * 0.5), // Random rating between 4.5-5.0
        experience: getCoachExperience(index),
        avatar: coach.avatar_url
      }));

      setRealCoaches(coaches);
    } catch (error) {
      console.error('Error fetching coaches:', error);
      // Fallback to mock data if real coaches can't be fetched
      setRealCoaches(mockCoaches);
    }
  };

  // Helper function to assign specializations
  const getCoachSpecialization = (index: number): string => {
    const specializations = [
      'Investment Planning & Portfolio Management',
      'Tax Planning & Retirement Strategy', 
      'Insurance & Risk Management',
      'Financial Planning & Wealth Building',
      'Debt Management & Credit Planning'
    ];
    return specializations[index % specializations.length];
  };

  // Helper function to assign experience
  const getCoachExperience = (index: number): string => {
    const experiences = ['5+ years', '8+ years', '12+ years', '15+ years', '10+ years'];
    return experiences[index % experiences.length];
  };

  // Fallback mock data
  const mockCoaches: Coach[] = [
    {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      name: 'Dr. Priya Sharma',
      specialization: 'Investment Planning & Portfolio Management',
      rating: 4.9,
      experience: '8+ years'
    },
    {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 
      name: 'Rajesh Kumar',
      specialization: 'Tax Planning & Retirement Strategy',
      rating: 4.8,
      experience: '12+ years'
    },
    {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
      name: 'Anita Desai',
      specialization: 'Insurance & Risk Management',
      rating: 4.7,
      experience: '6+ years'
    }
  ];

  // Initialize coaches on component mount
  useEffect(() => {
    fetchCoaches();
  }, []);

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
  }, []);

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
  }, []);

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
    mockCoaches: realCoaches.length > 0 ? realCoaches : mockCoaches,
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