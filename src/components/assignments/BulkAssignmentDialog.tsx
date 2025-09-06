import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAssignments } from '@/hooks/useAssignments';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useForm } from 'react-hook-form';
import { Loader2, Users, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface BulkAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Student {
  id: string;
  name: string;
  email: string;
  user_type: string;
  enrollments: any;
}

const BulkAssignmentDialog: React.FC<BulkAssignmentDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      due_date: '',
      priority: 'medium',
      assignment_type: 'general',
    },
  });

  const fetchStudents = async () => {
    if (!userProfile) return;

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
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  const onSubmit = async (data: any) => {
    if (selectedStudents.length === 0) {
      toast({
        title: "No students selected",
        description: "Please select at least one student",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      // Create assignments for each selected student
      const assignmentPromises = selectedStudents.map(async (studentId) => {
        const { error } = await supabase
          .from('assignments')
          .insert({
            title: data.title,
            description: data.description,
            created_by: userProfile?.id,
            assigned_to: studentId,
            organization_id: userProfile?.organization_id,
            due_date: data.due_date || null,
            priority: data.priority,
            assignment_type: data.assignment_type,
            status: 'pending',
          });

        if (error) throw error;
      });

      await Promise.all(assignmentPromises);

      toast({
        title: "Success",
        description: `Assignment sent to ${selectedStudents.length} student${selectedStudents.length > 1 ? 's' : ''}`,
      });

      form.reset();
      setSelectedStudents([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating bulk assignments:', error);
      toast({
        title: "Error",
        description: "Failed to create assignments",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchStudents();
    }
  }, [open, userProfile]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create Bulk Assignment
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Assignment Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Assignment Details</h3>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Assignment title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Assignment description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignment_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="coaching">Coaching</SelectItem>
                          <SelectItem value="assessment">Assessment</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Student Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Select Students</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedStudents.length} of {students.length} selected
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="grid gap-3 max-h-96 overflow-y-auto border rounded-lg p-4">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleStudentToggle(student.id)}
                    >
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleStudentToggle(student.id)}
                      />
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {student.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{student.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {student.user_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {student.email}
                        </p>
                        {student.enrollments && Array.isArray(student.enrollments) && student.enrollments.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {student.enrollments.length} enrollment{student.enrollments.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={creating || selectedStudents.length === 0}
              >
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create {selectedStudents.length > 0 && `(${selectedStudents.length})`} Assignment{selectedStudents.length > 1 ? 's' : ''}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BulkAssignmentDialog;