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
      
      // Get enrollments where this user is the coach
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('enrollments')
        .select(`
          *,
          user:users!enrollments_user_id_fkey(id, name, email)
        `)
        .eq('coach_id', userProfile.id)
        .eq('status', 'confirmed');

      if (enrollmentError) throw enrollmentError;

      if (!enrollments || enrollments.length === 0) {
        setStudents([]);
        return;
      }

      // Get program data
      const courseIds = [...new Set(enrollments.map(e => e.course_id))];
      const { data: programs, error: programError } = await supabase
        .from('individual_programs')
        .select('id, title')
        .in('id', courseIds);

      const programMap = (programs || []).reduce((acc, program) => {
        acc[program.id] = program.title;
        return acc;
      }, {} as Record<string, string>);

      // Group enrollments by student
      const studentMap: Record<string, CoachingStudent> = {};
      
      enrollments.forEach((enrollment: any) => {
        const student = enrollment.user;
        // Skip if user data is null or missing
        if (!student || !student.id) {
          console.warn('Enrollment missing user data:', enrollment);
          return;
        }
        
        if (!studentMap[student.id]) {
          studentMap[student.id] = {
            id: student.id,
            name: student.name,
            email: student.email,
            enrollments: []
          };
        }
        
        studentMap[student.id].enrollments.push({
          id: enrollment.id,
          course_id: enrollment.course_id,
          program_title: programMap[enrollment.course_id] || getCourseTitle(enrollment.course_id),
          enrollment_date: enrollment.created_at,
          scheduled_at: enrollment.scheduled_at
        });
      });

      setStudents(Object.values(studentMap));
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