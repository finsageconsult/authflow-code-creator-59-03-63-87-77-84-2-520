import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useChats } from '@/hooks/useChat';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageSquare, 
  Users, 
  Search,
  Calendar,
  Star,
  BookOpen
} from 'lucide-react';
import { format } from 'date-fns';

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
  const { chats, loading } = useChats();
  const [selectedChat, setSelectedChat] = useState<any>(null);
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

  if (selectedChat) {
    return (
      <div className="h-[calc(100vh-200px)]">
        <ChatWindow 
          chat={selectedChat} 
          onBack={() => setSelectedChat(null)} 
        />
      </div>
    );
  }

  if (loading || studentsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading coaching sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
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

      {/* Search */}
      <Card>
        <CardContent className="pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students or programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Students ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Students Yet</h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'No students match your search criteria'
                    : 'Students will appear here once they enroll in your programs'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStudents.map((student) => {
                  const chat = getChatForStudent(student);
                  
                  return (
                    <div
                      key={student.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-lg">{student.name}</h4>
                            <Badge variant="outline">
                              {student.enrollments.length} Program{student.enrollments.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">{student.email}</p>
                          
                          {/* Enrolled Programs */}
                          <div className="space-y-2 mb-4">
                            {student.enrollments.map((enrollment) => (
                              <div key={enrollment.id} className="flex items-center gap-2 text-sm">
                                <BookOpen className="h-4 w-4 text-primary" />
                                <span className="font-medium">{enrollment.program_title}</span>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-muted-foreground">
                                  Enrolled {format(new Date(enrollment.enrollment_date), 'MMM dd, yyyy')}
                                </span>
                                {enrollment.scheduled_at && (
                                  <>
                                    <span className="text-muted-foreground">•</span>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      <span className="text-muted-foreground">
                                        {format(new Date(enrollment.scheduled_at), 'MMM dd, HH:mm')}
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          {/* Chat Button */}
                          <div className="flex items-center gap-3">
                            {chat ? (
                              <Button 
                                onClick={() => setSelectedChat(chat)}
                                className="flex items-center gap-2"
                              >
                                <MessageSquare className="h-4 w-4" />
                                Open Chat
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                disabled
                                className="flex items-center gap-2"
                              >
                                <MessageSquare className="h-4 w-4" />
                                Chat Unavailable
                              </Button>
                            )}
                            
                            <Button variant="outline" size="sm">
                              View Progress
                            </Button>
                            <Button variant="outline" size="sm">
                              Session Notes
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};