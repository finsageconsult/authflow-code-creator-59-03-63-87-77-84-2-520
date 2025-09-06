import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useAssignments, useAssignmentMessages, useAssignmentFiles } from '@/hooks/useAssignments';
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
  GraduationCap,
  MessageSquare,
  Send,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';

interface CoachAssignment {
  coachId: string;
  coachName: string;
  programId: string;
  programName: string;
}

export const UserAssignments: React.FC = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const { assignments, loading, updateAssignmentStatus } = useAssignments();
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [coachAssignments, setCoachAssignments] = useState<CoachAssignment[]>([]);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  
  const { messages: assignmentMessages, sendMessage } = useAssignmentMessages(selectedAssignment?.id || '');
  const { files: assignmentFiles, uploadFile } = useAssignmentFiles(selectedAssignment?.id || '');

  // Static coach assignments based on purchased programs
  const staticCoachAssignments = {
    'f47ac10b-58cc-4372-a567-0e02b2c3d479': { // Debt-Free Journey
      coachId: 'coach_001',
      coachName: 'Sarah Johnson',
      programName: 'Debt-Free Journey'
    },
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8': { // Investing in 3 Hours  
      coachId: 'coach_002',
      coachName: 'Michael Chen',
      programName: 'Investing in 3 Hours'
    },
    '6ba7b811-9dad-11d1-80b4-00c04fd430c8': { // Financial Blueprint Session
      coachId: 'coach_003', 
      coachName: 'Emma Davis',
      programName: 'Financial Blueprint Session'
    },
  };

  useEffect(() => {
    if (userProfile) {
      fetchUserEnrollments();
    }
  }, [userProfile]);

  const fetchUserEnrollments = async () => {
    if (!userProfile) return;

    try {
      // Get user's purchases to determine coach assignments
      const { data: purchases, error } = await supabase
        .from('individual_purchases')
        .select('program_id, status')
        .eq('user_id', userProfile.id)
        .eq('status', 'completed');

      if (error) throw error;

      // Map purchases to coach assignments
      const assignments: CoachAssignment[] = [];
      purchases?.forEach(purchase => {
        const assignment = staticCoachAssignments[purchase.program_id as keyof typeof staticCoachAssignments];
        if (assignment) {
          assignments.push({
            coachId: assignment.coachId,
            coachName: assignment.coachName,
            programId: purchase.program_id,
            programName: assignment.programName
          });
        }
      });
      
      setCoachAssignments(assignments);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const handleStatusUpdate = async (assignmentId: string, status: string) => {
    setSubmittingId(assignmentId);
    try {
      await updateAssignmentStatus(assignmentId, status);
      toast({
        title: "Success",
        description: `Assignment marked as ${status}`,
      });
    } catch (error) {
      console.error('Error updating assignment:', error);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleFileUpload = async (assignmentId: string, file: File) => {
    setUploadingFile(assignmentId);
    try {
      await uploadFile(file);
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadingFile(null);
    }
  };

  const getCoachForAssignment = (assignment: any) => {
    // For now, return the first coach assignment since we don't have course-specific mapping
    return coachAssignments[0] || { coachName: 'Coach', programName: 'Course' };
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

  if (selectedAssignment) {
    const coach = getCoachForAssignment(selectedAssignment);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedAssignment(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignments
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedAssignment.title}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>From {coach.coachName}</span>
              </div>
              <div className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                <span>{coach.programName}</span>
              </div>
              <Badge variant={selectedAssignment.status === 'completed' ? 'default' : 'secondary'}>
                {selectedAssignment.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Description */}
            {selectedAssignment.description && (
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{selectedAssignment.description}</p>
              </div>
            )}
            
            {/* Files Section */}
            <div>
              <h4 className="font-medium mb-3">Files</h4>
              {assignmentFiles.length === 0 ? (
                <p className="text-muted-foreground text-sm">No files uploaded</p>
              ) : (
                <div className="space-y-2">
                  {assignmentFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{file.file_name}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(file.file_url, '_blank')}
                      >
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mark as Complete Button */}
            {selectedAssignment.status === 'pending' && (
              <Button
                onClick={() => handleStatusUpdate(selectedAssignment.id, 'completed')}
                disabled={submittingId === selectedAssignment.id}
                className="w-full"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Complete
              </Button>
            )}
          </CardContent>
        </Card>
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
        {assignments.map((assignment) => {
          const coach = getCoachForAssignment(assignment);
          
          return (
            <Card 
              key={assignment.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedAssignment(assignment)}
            >
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
                        <span>{coach.coachName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        <span>{coach.programName}</span>
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
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {assignment.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap line-clamp-3">
                      {assignment.description}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Created {format(new Date(assignment.created_at), 'MMM dd, yyyy')}</span>
                  <span>Click to view details</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};