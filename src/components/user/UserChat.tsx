import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useCoachingChats, CoachingCourse } from '@/hooks/useCoachingChats';
import { useChats } from '@/hooks/useChat';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { UserCoachProfile } from '@/components/user/UserCoachProfile';
import { 
  MessageSquare, 
  BookOpen
} from 'lucide-react';

export const UserChat: React.FC = () => {
  const { userProfile } = useAuth();
  const { coachingCourses, loading } = useCoachingChats();
  const { chats } = useChats();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Handle chat selection
  const handleStartChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  // Show chat interface if a chat is selected
  if (selectedChatId) {
    const course = coachingCourses.find(c => c.chatId === selectedChatId);
    const chat = chats.find(chat => chat.id === selectedChatId);
    
    if (chat) {
      return (
        <div className="h-[calc(100vh-200px)]">
          <ChatWindow 
            chat={chat} 
            onBack={() => setSelectedChatId(null)} 
          />
        </div>
      );
    }
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

  if (!coachingCourses || coachingCourses.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Your Coaching Sessions
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Connect with your coaches and access your enrolled programs
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Coaching Sessions Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
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
            Your Coaching Sessions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Connect with your coaches and access your enrolled programs
          </p>
        </CardHeader>
      </Card>

      {/* Coaching Courses */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {coachingCourses.map((course) => (
            <UserCoachProfile
              key={course.id}
              course={course}
              onStartChat={handleStartChat}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};