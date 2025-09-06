import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useCoachingChats, CoachingCourse } from '@/hooks/useCoachingChats';
import { useChats } from '@/hooks/useChat';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { 
  MessageSquare, 
  Star,
  BookOpen,
  ArrowLeft
} from 'lucide-react';

export const UserChat: React.FC = () => {
  const { userProfile } = useAuth();
  const { coachingCourses, loading } = useCoachingChats();
  const { chats } = useChats();
  const [selectedCourse, setSelectedCourse] = useState<CoachingCourse | null>(null);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  // Find the chat for the selected course
  const findChatForCourse = (course: CoachingCourse) => {
    if (!course.chatId) return null;
    return chats.find(chat => chat.id === course.chatId) || null;
  };

  // Handle course selection and open chat
  const handleCourseSelect = (course: CoachingCourse) => {
    setSelectedCourse(course);
    const chat = findChatForCourse(course);
    if (chat) {
      setSelectedChat(chat);
    }
  };

  const renderCourseCard = (course: CoachingCourse) => (
    <Card 
      key={course.id} 
      className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
      onClick={() => handleCourseSelect(course)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border-2 border-background shadow-md">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {course.coach.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-sm truncate pr-2">{course.title}</h3>
                <p className="text-xs text-muted-foreground mb-1">with {course.coach.name}</p>
              </div>
              <Badge variant={course.category === '1-1-sessions' ? 'default' : 'secondary'} className="text-xs shrink-0">
                {course.category === '1-1-sessions' ? '1:1 Session' : 'Program'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{course.coach.rating}</span>
              </div>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{course.coach.experience}</span>
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
              {course.coach.specialties.slice(0, 2).map((specialty) => (
                <Badge key={specialty} variant="outline" className="text-xs px-2 py-0">
                  {specialty}
                </Badge>
              ))}
            </div>

            {course.progress !== undefined && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex-1 bg-muted rounded-full h-1.5">
                  <div 
                    className="bg-primary h-full rounded-full transition-all" 
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <span>{course.progress}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Show chat interface if a chat is selected
  if (selectedChat && selectedCourse) {
    return (
      <div className="h-[calc(100vh-200px)]">
        <ChatWindow 
          chat={selectedChat} 
          onBack={() => {
            setSelectedChat(null);
            setSelectedCourse(null);
          }} 
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (coachingCourses.length === 0) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <CardContent className="text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
          <p className="text-muted-foreground mb-4">
            {userProfile?.role === 'EMPLOYEE' 
              ? 'Enroll in a program to get access to your dedicated coach and start chatting.'
              : 'Purchase a program to get access to your dedicated coach and start chatting.'
            }
          </p>
          <Button onClick={() => {
            const dashboardPath = userProfile?.role === 'EMPLOYEE' 
              ? '/employee-dashboard?tab=programs' 
              : '/individual-dashboard?tab=programs';
            window.location.href = dashboardPath;
          }}>
            {userProfile?.role === 'EMPLOYEE' ? 'Browse Programs' : 'Browse Programs'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!selectedCourse) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Your Coaching Sessions</h2>
        </div>
        
        <div className="grid gap-4">
          {coachingCourses.map(course => renderCourseCard(course))}
        </div>
      </div>
    );
  }

  // This should not be reached anymore since we handle chat in the condition above
  return null;
};