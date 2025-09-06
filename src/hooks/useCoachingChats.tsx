import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { useChats } from '@/hooks/useChat';

export interface CoachingCourse {
  id: string;
  programId: string;
  title: string;
  category: 'short-program' | '1-1-sessions';
  coach: {
    id: string;
    name: string;
    bio: string;
    rating: number;
    specialties: string[];
    experience: string;
  };
  purchaseDate: string;
  progress?: number;
  description: string;
  chatId?: string;
}

export const useCoachingChats = () => {
  const [coachingCourses, setCoachingCourses] = useState<CoachingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const { createCoachingChat } = useChats();

  const fetchCoachingCourses = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);
      
      // Fetch user's enrollments
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('status', 'confirmed');

      if (enrollmentError) throw enrollmentError;

      if (!enrollmentData || enrollmentData.length === 0) {
        setCoachingCourses([]);
        return;
      }

      // Fetch coach data
      const coachIds = [...new Set(enrollmentData.map(e => e.coach_id).filter(Boolean))];
      let coachMap: { [key: string]: any } = {};
      
      if (coachIds.length > 0) {
        const { data: coachData, error: coachError } = await supabase
          .from('users')
          .select('id, name, email, specialties')
          .in('id', coachIds)
          .eq('role', 'COACH');

        if (coachError) throw coachError;
        
        coachMap = (coachData || []).reduce((acc, coach) => {
          acc[coach.id] = {
            id: coach.id,
            name: coach.name,
            bio: `Expert coach specializing in financial guidance`,
            rating: 4.8,
            specialties: coach.specialties || ['Financial Planning'],
            experience: '5+ years'
          };
          return acc;
        }, {} as { [key: string]: any });
      }

      // Fetch program data
      const courseIds = [...new Set(enrollmentData.map(e => e.course_id).filter(Boolean))];
      let programMap: { [key: string]: any } = {};
      
      if (courseIds.length > 0) {
        const { data: programData, error: programError } = await supabase
          .from('individual_programs')
          .select('*')
          .in('id', courseIds);

        if (programData && programData.length > 0) {
          programMap = programData.reduce((acc, program) => {
            acc[program.id] = program;
            return acc;
          }, {} as { [key: string]: any });
        } else {
          // Create fallback data for known course IDs
          courseIds.forEach(courseId => {
            const courseTitle = getCourseTitle(courseId);
            programMap[courseId] = {
              id: courseId,
              title: courseTitle,
              description: `Course program for ${courseTitle}`,
              category: 'course',
              level: 'Beginner',
              duration: '60 min'
            };
          });
        }
      }

      // Fetch existing chats for these enrollments
      const { data: existingChats, error: chatError } = await supabase
        .from('chats')
        .select(`
          *,
          participants:chat_participants(user_id)
        `)
        .eq('chat_type', 'coaching');

      const chatMap: { [key: string]: string } = {};
      if (existingChats) {
        existingChats.forEach(chat => {
          const participants = (chat as any).participants || [];
          const userIds = participants.map((p: any) => p.user_id);
          if (userIds.includes(userProfile.id)) {
            // Find the coach in this chat
            const coachParticipant = participants.find((p: any) => 
              coachIds.includes(p.user_id) && p.user_id !== userProfile.id
            );
            if (coachParticipant) {
              chatMap[coachParticipant.user_id] = chat.id;
            }
          }
        });
      }

      // Convert enrollments to coaching courses
      const courses: CoachingCourse[] = [];
      
      for (const enrollment of enrollmentData) {
        const program = programMap[enrollment.course_id];
        const coach = coachMap[enrollment.coach_id];
        
        if (coach && program) {
          // Create or find coaching chat
          let chatId = chatMap[enrollment.coach_id];
          
          if (!chatId) {
            const newChat = await createCoachingChat(
              enrollment.coach_id,
              program.title,
              enrollment.id
            );
            if (newChat) {
              chatId = newChat.id;
            }
          }

          courses.push({
            id: enrollment.id,
            programId: enrollment.course_id,
            title: program.title,
            category: program.category === '1-1-sessions' ? '1-1-sessions' : 'short-program',
            description: program.description,
            coach,
            purchaseDate: enrollment.created_at,
            progress: 0,
            chatId
          });
        }
      }

      setCoachingCourses(courses);
    } catch (error) {
      console.error('Error fetching coaching courses:', error);
      toast({
        title: "Error",
        description: "Failed to load your coaching sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get course title from known course IDs
  const getCourseTitle = (courseId: string) => {
    const courseMap: { [key: string]: string } = {
      '550e8400-e29b-41d4-a716-446655440000': 'Financial Fitness Bootcamp',
      '550e8400-e29b-41d4-a716-446655440001': 'Investment Mastery Series',
      '550e8400-e29b-41d4-a716-446655440002': 'Smart Tax Planning',
      '550e8400-e29b-41d4-a716-446655440003': 'Financial Blueprint Session',
      '550e8400-e29b-41d4-a716-446655440004': 'Debt-Free Journey',
      '550e8400-e29b-41d4-a716-446655440005': 'Investing in 3 Hours'
    };
    return courseMap[courseId] || 'Financial Program';
  };

  useEffect(() => {
    fetchCoachingCourses();
  }, [userProfile]);

  return {
    coachingCourses,
    loading,
    refetch: fetchCoachingCourses,
  };
};