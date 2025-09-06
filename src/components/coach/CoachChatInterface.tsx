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
  user_type: 'Individual' | 'Employee' | 'User';
  enrollments: Array<{
    id: string;
    program_title: string;
    program_category: string;
    enrollment_date: string;
    scheduled_at?: string;
    status: string;
    payment_status: string;
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

  // Fetch students enrolled with this coach using RPC function
  const fetchCoachingStudents = async () => {
    if (!userProfile || userProfile.role !== 'COACH') return;

    try {
      setStudentsLoading(true);
      console.log('Fetching students for coach:', userProfile.id);
      
      // Use the RPC function to get students (bypasses RLS issues)
      const { data: studentsData, error } = await supabase
        .rpc('get_students_for_current_coach');

      if (error) {
        console.error('Error fetching students:', error);
        return;
      }

      console.log('Raw students data from RPC:', studentsData);

      if (!studentsData || studentsData.length === 0) {
        console.log('No students found for coach');
        setStudents([]);
        return;
      }

      // Transform the data to match our CoachingStudent interface
      const transformedStudents: CoachingStudent[] = studentsData.map((student: any) => ({
        id: student.id,
        name: student.name || 'Unknown User',
        email: student.email || 'No email',
        user_type: student.user_type || 'User',
        enrollments: student.enrollments || []
      }));

      console.log('Transformed students:', transformedStudents);
      setStudents(transformedStudents);
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
    student.user_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
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