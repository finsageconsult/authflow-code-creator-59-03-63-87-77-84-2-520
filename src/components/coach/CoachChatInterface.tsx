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
      // Use the new RPC function to avoid RLS issues
      const [enrollmentsRes, bookingsRes, studentsRes] = await Promise.all([
        supabase
          .from('enrollments')
          .select('*')
          .eq('coach_id', userProfile.id)
          .in('status', ['confirmed', 'active', 'enrolled', 'completed']),
        supabase
          .from('individual_bookings')
          .select('*')
          .eq('coach_id', userProfile.id),
        supabase.rpc('get_students_for_current_coach')
      ]);

      const allEnrollments = enrollmentsRes.data || [];
      const allBookings = bookingsRes.data || [];
      const studentsList = studentsRes.data || [];

      // Create user map from RPC results
      const userMap = studentsList.reduce((acc: Record<string, any>, u: any) => {
        acc[u.id] = u;
        return acc;
      }, {});

      // Collect unique program ids
      const courseIds = [
        ...new Set([
          ...allEnrollments.map(e => e.course_id).filter(Boolean),
          ...allBookings.map(b => b.program_id).filter(Boolean)
        ])
      ];

      // Fetch programs in bulk
      const { data: programs } = courseIds.length
        ? await supabase.from('individual_programs').select('id, title').in('id', courseIds)
        : { data: [] as any };

      const programMap = (programs || []).reduce((acc: Record<string, string>, p: any) => {
        acc[p.id] = p.title;
        return acc;
      }, {});

      // Group all student data by user ID
      const studentMap: Record<string, CoachingStudent> = {};

      // Process enrollments
      allEnrollments.forEach((enrollment: any) => {
        const student = userMap[enrollment.user_id];
        if (!student) return;

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
        const student = userMap[booking.user_id];
        if (!student) return;

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
          program_title: programMap[booking.program_id] || getCourseTitle(booking.program_id),
          enrollment_date: booking.created_at,
          scheduled_at: booking.scheduled_at,
          source: 'booking'
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

  // Force refresh when component mounts
  useEffect(() => {
    if (userProfile?.role === 'COACH') {
      const timer = setTimeout(() => {
        fetchCoachingStudents();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

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