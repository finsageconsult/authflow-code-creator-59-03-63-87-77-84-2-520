import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useChats } from '@/hooks/useChat';
import { supabase } from '@/integrations/supabase/client';
import { ChatProfileSidebar } from './ChatProfileSidebar';
import { ChatMessageArea } from './ChatMessageArea';
import { MessageSquare } from 'lucide-react';

interface CoachingStudent {
  id: string;
  name: string;
  email: string;
  enrollments: Array<{
    id: string;
    course_id: string;
    program_title: string;
    enrollment_date: string;
    scheduled_at?: string;
    source?: string;
  }>;
}

export const CoachChatInterface: React.FC = () => {
  const { userProfile } = useAuth();
  const { chats, loading: chatsLoading } = useChats();
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<CoachingStudent | null>(null);
  const [students, setStudents] = useState<CoachingStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch students enrolled with this coach
  const fetchCoachingStudents = async () => {
    if (!userProfile || userProfile.role !== 'COACH') return;

    try {
      setStudentsLoading(true);
      console.log('Fetching students for coach:', userProfile.id);
      
      // Get all students who have enrolled with this coach OR purchased individual programs
      const studentsFromSources = await Promise.all([
        // 1. Get enrollments where this user is the coach
        supabase
          .from('enrollments')
          .select(`
            *,
            user:users!enrollments_user_id_fkey(id, name, email, role, organization_id)
          `)
          .eq('coach_id', userProfile.id),
        
        // 2. Get individual purchases/bookings with this coach
        supabase
          .from('individual_bookings')
          .select(`
            *,
            user:users!individual_bookings_user_id_fkey(id, name, email, role, organization_id),
            program:individual_programs!individual_bookings_program_id_fkey(id, title)
          `)
          .eq('coach_id', userProfile.id),
        
        // 3. Get all individual purchases where the user later selected this coach
        supabase
          .from('individual_purchases')
          .select(`
            *,
            user:users!individual_purchases_user_id_fkey(id, name, email, role, organization_id),
            program:individual_programs!individual_purchases_program_id_fkey(id, title)
          `)
          .eq('status', 'completed')
      ]);

      const [enrollmentsResponse, bookingsResponse, purchasesResponse] = studentsFromSources;
      
      console.log('Enrollments:', enrollmentsResponse.data);
      console.log('Bookings:', bookingsResponse.data);
      console.log('Purchases:', purchasesResponse.data);

      const allEnrollments = enrollmentsResponse.data || [];
      const allBookings = bookingsResponse.data || [];
      const allPurchases = purchasesResponse.data || [];

      // Get all unique course/program IDs
      const courseIds = [
        ...new Set([
          ...allEnrollments.map(e => e.course_id),
          ...allBookings.map(b => b.program_id),
          ...allPurchases.map(p => p.program_id)
        ])
      ].filter(Boolean);

      console.log('Course IDs:', courseIds);

      // Get program data
      const { data: programs, error: programError } = await supabase
        .from('individual_programs')
        .select('id, title')
        .in('id', courseIds);

      console.log('Programs:', programs);

      const programMap = (programs || []).reduce((acc, program) => {
        acc[program.id] = program.title;
        return acc;
      }, {} as Record<string, string>);

      // Group all student data by user ID
      const studentMap: Record<string, CoachingStudent> = {};
      
      // Process enrollments
      allEnrollments.forEach((enrollment: any) => {
        const student = enrollment.user;
        if (!student || !student.id) {
          console.warn('Enrollment missing user data:', enrollment);
          return;
        }
        
        if (!studentMap[student.id]) {
          studentMap[student.id] = {
            id: student.id,
            name: student.name || 'Unknown User',
            email: student.email || 'No email',
            enrollments: []
          };
        }
        
        studentMap[student.id].enrollments.push({
          id: enrollment.id,
          course_id: enrollment.course_id,
          program_title: programMap[enrollment.course_id] || getCourseTitle(enrollment.course_id),
          enrollment_date: enrollment.created_at || enrollment.enrollment_date,
          scheduled_at: enrollment.scheduled_at,
          source: 'enrollment'
        });
      });

      // Process bookings
      allBookings.forEach((booking: any) => {
        const student = booking.user;
        if (!student || !student.id) {
          console.warn('Booking missing user data:', booking);
          return;
        }
        
        if (!studentMap[student.id]) {
          studentMap[student.id] = {
            id: student.id,
            name: student.name || 'Unknown User',
            email: student.email || 'No email',
            enrollments: []
          };
        }
        
        studentMap[student.id].enrollments.push({
          id: booking.id,
          course_id: booking.program_id,
          program_title: booking.program?.title || programMap[booking.program_id] || getCourseTitle(booking.program_id),
          enrollment_date: booking.created_at,
          scheduled_at: booking.scheduled_at,
          source: 'booking'
        });
      });

      // Process purchases
      allPurchases.forEach((purchase: any) => {
        const student = purchase.user;
        if (!student || !student.id) {
          console.warn('Purchase missing user data:', purchase);
          return;
        }
        
        if (!studentMap[student.id]) {
          studentMap[student.id] = {
            id: student.id,
            name: student.name || 'Unknown User',
            email: student.email || 'No email',
            enrollments: []
          };
        }
        
        studentMap[student.id].enrollments.push({
          id: purchase.id,
          course_id: purchase.program_id,
          program_title: purchase.program?.title || programMap[purchase.program_id] || getCourseTitle(purchase.program_id),
          enrollment_date: purchase.created_at,
          scheduled_at: null,
          source: 'purchase'
        });
      });

      const studentsArray = Object.values(studentMap);
      console.log('Final students array:', studentsArray);
      setStudents(studentsArray);
    } catch (error) {
      console.error('Error fetching coaching students:', error);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Helper function for fallback course titles
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
    fetchCoachingStudents();
  }, [userProfile]);

  // Filter coaching chats for this coach
  const coachingChats = chats.filter(chat => 
    chat.chat_type === 'coaching' && 
    chat.participants?.some(p => p.user_id === userProfile?.id)
  );

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.enrollments.some(e => e.program_title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get chat for a specific student
  const getChatForStudent = (student: CoachingStudent) => {
    return coachingChats.find(chat => 
      chat.participants?.some(p => p.user_id === student.id)
    );
  };

  // Handle student selection
  const handleStudentSelect = (student: CoachingStudent) => {
    setSelectedStudent(student);
    setSelectedChat(null);
  };

  // Handle starting chat
  const handleStartChat = (student: CoachingStudent) => {
    const chat = getChatForStudent(student);
    if (chat) {
      setSelectedChat(chat);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    setSelectedChat(null);
    setSelectedStudent(null);
  };

  const loading = chatsLoading || studentsLoading;

  return (
    <div className="h-[calc(100vh-200px)]">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Coaching Chats
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Connect with your students and provide personalized guidance
          </p>
        </CardHeader>
      </Card>

      {/* Main Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Left Sidebar - Student Profiles */}
        <div className="lg:col-span-1">
          <ChatProfileSidebar
            students={filteredStudents}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onStudentSelect={handleStudentSelect}
            selectedStudentId={selectedStudent?.id}
            getChatForStudent={getChatForStudent}
          />
        </div>

        {/* Right Side - Chat Area */}
        <div className="lg:col-span-2">
          <ChatMessageArea
            selectedStudent={selectedStudent}
            selectedChat={selectedChat}
            onBack={handleBack}
            onStartChat={handleStartChat}
            getChatForStudent={getChatForStudent}
          />
        </div>
      </div>
    </div>
  );
};