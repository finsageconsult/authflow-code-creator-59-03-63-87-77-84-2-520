import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { 
  ClipboardList, 
  Calendar, 
  User, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Upload,
  FileText,
  GraduationCap
} from 'lucide-react';
import { format } from 'date-fns';

interface Assignment {
  id: string;
  title: string;
  description?: string;
  created_by: string;
  assigned_to: string;
  organization_id?: string;
  status: string;
  priority?: string;
  assignment_type: string;
  due_date?: string;
  created_at: string;
}

export const UserAssignments: React.FC = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});

  useEffect(() => {
    if (userProfile) {
      fetchAssignments();
    }
  }, [userProfile]);

  const fetchAssignments = async () => {
    if (!userProfile) return;

    try {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          id,
          title,
          description,
          created_by,
          assigned_to,
          organization_id,
          due_date,
          status,
          assignment_type,
          created_at
        `)
        .eq('assigned_to', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAssignmentStatus = async (assignmentId: string, status: 'pending' | 'completed') => {
    setSubmittingId(assignmentId);
    try {
      const { error } = await supabase
        .from('assignments')
        .update({ status })
        .eq('id', assignmentId);

      if (error) throw error;

      setAssignments(prev => 
        prev.map(assignment => 
          assignment.id === assignmentId 
            ? { ...assignment, status }
            : assignment
        )
      );

      toast({
        title: "Success",
        description: `Assignment marked as ${status}`,
      });
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive",
      });
    } finally {
      setSubmittingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'completed': return 'bg-green-500/20 text-green-700 border-green-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <CardContent className="text-center">
          <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Assignments Yet</h3>
          <p className="text-muted-foreground">
            Your coach will assign tasks and exercises to help with your financial journey.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Assignments</h2>
          <p className="text-muted-foreground">Tasks and exercises from your coach</p>
        </div>
        <Badge variant="secondary">
          {assignments.filter(a => a.status === 'pending').length} pending
        </Badge>
      </div>

      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <Card key={assignment.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                    {getStatusIcon(assignment.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>Coach</span>
                    </div>
                    {assignment.due_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due {format(new Date(assignment.due_date), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                    <Badge className={getStatusColor(assignment.status)}>
                      {assignment.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {assignment.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {assignment.description}
                  </p>
                </div>
              )}

              {assignment.status === 'pending' && (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Your Response (Optional)</h4>
                    <Textarea
                      value={responses[assignment.id] || ''}
                      onChange={(e) => setResponses(prev => ({
                        ...prev,
                        [assignment.id]: e.target.value
                      }))}
                      placeholder="Add notes or attach files..."
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      onClick={() => updateAssignmentStatus(assignment.id, 'completed')}
                      disabled={submittingId === assignment.id}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark Complete
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload File
                    </Button>
                  </div>
                </div>
              )}

              {assignment.status === 'completed' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Completed</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    Great job! This assignment has been marked as complete.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};