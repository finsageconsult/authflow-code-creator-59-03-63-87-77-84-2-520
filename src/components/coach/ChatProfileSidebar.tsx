import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Users, 
  Search,
  Calendar,
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

interface ChatProfileSidebarProps {
  students: CoachingStudent[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onStudentSelect: (student: CoachingStudent) => void;
  selectedStudentId?: string;
  getChatForStudent: (student: CoachingStudent) => any;
}

export const ChatProfileSidebar: React.FC<ChatProfileSidebarProps> = ({
  students,
  loading,
  searchQuery,
  onSearchChange,
  onStudentSelect,
  selectedStudentId,
  getChatForStudent
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Your Students ({students.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card className="flex-1">
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {students.length === 0 ? (
              <div className="text-center py-8 px-4">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Students Yet</h3>
                <p className="text-muted-foreground text-sm">
                  {searchQuery 
                    ? 'No students match your search criteria'
                    : 'Students will appear here once they enroll in your programs'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {students.map((student) => {
                  const chat = getChatForStudent(student);
                  const isSelected = selectedStudentId === student.id;
                  
                  return (
                    <div
                      key={student.id}
                      className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                        isSelected ? 'bg-muted border-l-4 border-l-primary' : ''
                      }`}
                      onClick={() => onStudentSelect(student)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm truncate">{student.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {student.enrollments.length}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-muted-foreground truncate mb-2">{student.email}</p>
                          
                          {/* Latest Program */}
                          {student.enrollments.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <BookOpen className="h-3 w-3" />
                              <span className="truncate">{student.enrollments[0].program_title}</span>
                            </div>
                          )}
                          
                          {/* Chat Status */}
                          <div className="flex items-center gap-2 mt-2">
                            <div className={`flex items-center gap-1 text-xs ${chat ? 'text-green-600' : 'text-muted-foreground'}`}>
                              <MessageSquare className="h-3 w-3" />
                              <span>{chat ? 'Chat Available' : 'No Chat'}</span>
                            </div>
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