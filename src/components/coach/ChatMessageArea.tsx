import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { 
  MessageSquare, 
  Calendar,
  BookOpen,
  ArrowLeft
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
    source?: string;
  }>;
}

interface ChatMessageAreaProps {
  selectedStudent: CoachingStudent | null;
  selectedChat: any;
  onBack: () => void;
  onStartChat: (student: CoachingStudent) => void;
  getChatForStudent: (student: CoachingStudent) => any;
}

export const ChatMessageArea: React.FC<ChatMessageAreaProps> = ({
  selectedStudent,
  selectedChat,
  onBack,
  onStartChat,
  getChatForStudent
}) => {
  // If we're in a chat, show the chat window
  if (selectedChat) {
    return (
      <div className="h-full">
        <ChatWindow 
          chat={selectedChat} 
          onBack={onBack} 
        />
      </div>
    );
  }

  // If a student is selected but no active chat, show student details
  if (selectedStudent) {
    const chat = getChatForStudent(selectedStudent);
    
    return (
      <Card className="h-full">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {selectedStudent.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{selectedStudent.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{selectedStudent.email}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Enrolled Programs */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Enrolled Programs
            </h3>
            <div className="space-y-3">
              {selectedStudent.enrollments.map((enrollment) => (
                <div key={enrollment.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{enrollment.program_title}</h4>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>Enrolled: {format(new Date(enrollment.enrollment_date), 'MMM dd, yyyy')}</span>
                    </div>
                    {enrollment.scheduled_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>Scheduled: {format(new Date(enrollment.scheduled_at), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Actions */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Communication
            </h3>
            
            <div className="flex flex-col gap-3">
              {chat ? (
                <Button 
                  onClick={() => onStartChat(selectedStudent)}
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
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  View Progress
                </Button>
                <Button variant="outline" size="sm">
                  Session Notes
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default empty state
  return (
    <Card className="h-full">
      <CardContent className="flex items-center justify-center h-full">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Select a Student</h3>
          <p className="text-muted-foreground">
            Choose a student from the left sidebar to start chatting or view their details
          </p>
        </div>
      </CardContent>
    </Card>
  );
};