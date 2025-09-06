import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Search, 
  MessageSquare, 
  Calendar, 
  BookOpen,
  Plus,
  Filter
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import BulkAssignmentDialog from './BulkAssignmentDialog';
import { format } from 'date-fns';

interface Student {
  id: string;
  name: string;
  email: string;
  user_type: string;
  enrollments: any;
}

const StudentsProfileView: React.FC = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const fetchStudents = useCallback(async () => {
    if (!userProfile?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_students_for_current_coach');
      
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userProfile?.id, toast]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         student.user_type.toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const getActiveEnrollments = (enrollments: any) => {
    if (!Array.isArray(enrollments)) return [];
    return enrollments.filter(e => e.status === 'confirmed' || e.status === 'active');
  };

  const handleCreateChat = async (studentId: string, studentName: string) => {
    try {
      // Check if chat already exists
      const { data: existingChats, error: checkError } = await supabase
        .from('chats')
        .select(`
          *,
          participants:chat_participants!chat_participants_chat_id_fkey(user_id)
        `)
        .eq('chat_type', 'coaching');

      if (checkError) throw checkError;

      // Find existing chat between coach and student
      const existingChat = existingChats?.find(chat => {
        const participants = (chat as any).participants || [];
        const userIds = participants.map((p: any) => p.user_id) || [];
        return userIds.includes(userProfile?.id) && userIds.includes(studentId);
      });

      if (existingChat) {
        window.location.href = `/coach-dashboard?tab=chat&chatId=${existingChat.id}`;
        return;
      }

      // Create new coaching chat
      const { data: newChat, error: chatError } = await supabase
        .from('chats')
        .insert({
          chat_type: 'coaching',
          name: `Coaching - ${studentName}`,
          created_by: userProfile?.id,
          organization_id: userProfile?.organization_id,
        })
        .select('*')
        .single();

      if (chatError) throw chatError;

      // Add participants
      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert([
          {
            chat_id: newChat.id,
            user_id: userProfile?.id,
            role: 'coach',
          },
          {
            chat_id: newChat.id,
            user_id: studentId,
            role: 'student',
          },
        ]);

      if (participantsError) throw participantsError;

      toast({
        title: "Success",
        description: "Chat created successfully",
      });

      // Navigate to chat
      window.location.href = `/coach-dashboard?tab=chat&chatId=${newChat.id}`;
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Error",
        description: "Failed to create chat",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6" />
            Your Students ({filteredStudents.length})
          </h2>
          <p className="text-muted-foreground">Manage and communicate with your students</p>
        </div>
        <Button onClick={() => setShowBulkDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Bulk Assignment
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            All
          </Button>
          <Button
            variant={filterType === 'employee' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('employee')}
          >
            Employee
          </Button>
          <Button
            variant={filterType === 'individual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('individual')}
          >
            Individual
          </Button>
        </div>
      </div>

      {/* Students Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No students found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try a different search term' : 'No students are currently assigned to you'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => {
            const activeEnrollments = getActiveEnrollments(student.enrollments || []);
            
            return (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-lg">
                        {student.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{student.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {student.user_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground truncate">
                    {student.email}
                  </p>

                  {activeEnrollments.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        <span>Active Enrollments ({activeEnrollments.length})</span>
                      </div>
                      {activeEnrollments.slice(0, 2).map((enrollment, index) => (
                        <div key={index} className="text-xs bg-muted p-2 rounded">
                          <p className="font-medium">{enrollment.program_title}</p>
                          {enrollment.scheduled_at && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(enrollment.scheduled_at), 'MMM dd, yyyy')}</span>
                            </div>
                          )}
                        </div>
                      ))}
                      {activeEnrollments.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          +{activeEnrollments.length - 2} more enrollment{activeEnrollments.length - 2 > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => handleCreateChat(student.id, student.name)}
                    >
                      <MessageSquare className="h-3 w-3" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <BulkAssignmentDialog
        open={showBulkDialog}
        onOpenChange={setShowBulkDialog}
      />
    </div>
  );
};

export default StudentsProfileView;