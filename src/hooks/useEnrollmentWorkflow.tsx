import { useState, useCallback } from 'react';
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

  // Mock data - in real app, fetch from Supabase
  const mockCoaches: Coach[] = [
    {
      id: '1',
      name: 'Dr. Priya Sharma',
      specialization: 'Investment Planning & Portfolio Management',
      rating: 4.9,
      experience: '8+ years'
    },
    {
      id: '2', 
      name: 'Rajesh Kumar',
      specialization: 'Tax Planning & Retirement Strategy',
      rating: 4.8,
      experience: '12+ years'
    },
    {
      id: '3',
      name: 'Anita Desai',
      specialization: 'Insurance & Risk Management',
      rating: 4.7,
      experience: '6+ years'
    }
  ];

  const generateTimeSlots = (coachId: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Generate 3 slots per day
      const times = ['10:00', '14:00', '16:00'];
      times.forEach((time, index) => {
        const endTime = time === '10:00' ? '11:00' : 
                       time === '14:00' ? '15:00' : '17:00';
        
        slots.push({
          id: `${coachId}-${i}-${index}`,
          startTime: time,
          endTime,
          date: date.toISOString().split('T')[0],
          isAvailable: Math.random() > 0.3 // 70% availability
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
    mockCoaches,
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