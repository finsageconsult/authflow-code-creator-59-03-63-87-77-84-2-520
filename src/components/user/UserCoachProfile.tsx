import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Star, 
  Calendar, 
  Clock,
  BookOpen,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { CoachingCourse } from '@/hooks/useCoachingChats';
import { useChats } from '@/hooks/useChat';
import { useToast } from '@/components/ui/use-toast';

interface UserCoachProfileProps {
  course: CoachingCourse;
  onStartChat: (chatId: string) => void;
}

export const UserCoachProfile: React.FC<UserCoachProfileProps> = ({
  course,
  onStartChat
}) => {
  const { createCoachingChat } = useChats();
  const { toast } = useToast();

  const handleCreateChat = async () => {
    const newChat = await createCoachingChat(
      course.coach.id,
      course.title,
      course.id
    );
    
    if (newChat) {
      onStartChat(newChat.id);
      toast({
        title: "Chat created",
        description: "Successfully connected with your coach",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to create chat with coach",
        variant: "destructive",
      });
    }
  };
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {course.title}
          </CardTitle>
          <Badge variant={course.category === '1-1-sessions' ? 'default' : 'secondary'}>
            {course.category === '1-1-sessions' ? '1-on-1 Session' : 'Short Program'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Program Details */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{course.description}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Enrolled {format(new Date(course.purchaseDate), 'MMM dd, yyyy')}</span>
            </div>
            {course.progress !== undefined && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.progress}% Complete</span>
              </div>
            )}
          </div>
        </div>

        {/* Coach Profile */}
        <div className="border rounded-lg p-4 bg-muted/20">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {course.coach.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{course.coach.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{course.coach.rating}</span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">{course.coach.bio}</p>
              
              {/* Specialties */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Specialties:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {course.coach.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{course.coach.experience} experience</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {course.chatId ? (
            <Button 
              onClick={() => onStartChat(course.chatId!)}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Chat with Coach
            </Button>
          ) : (
            <Button 
              onClick={handleCreateChat}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Start Chat with Coach
            </Button>
          )}
          
          <Button variant="outline">
            View Program Details
          </Button>
          
          {course.category === '1-1-sessions' && (
            <Button variant="outline">
              Schedule Session
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};