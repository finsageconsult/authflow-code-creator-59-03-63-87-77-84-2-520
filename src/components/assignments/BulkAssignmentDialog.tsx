import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Loader2, Users, Search } from 'lucide-react';
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
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignmentType, setAssignmentType] = useState('general');
  
  // Component state
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Reset form when dialog closes
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
    setAssignmentType('general');
    setSelectedStudents([]);
    setSearchTerm('');
  };

  // Fetch students function
  const fetchStudents = async () => {
    if (!userProfile?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_students_for_current_coach');
      
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle student selection
  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    const filteredStudentIds = filteredStudents.map(s => s.id);
    setSelectedStudents(prev => {
      const allSelected = filteredStudentIds.every(id => prev.includes(id));
      if (allSelected) {
        return prev.filter(id => !filteredStudentIds.includes(id));
      } else {
        return [...new Set([...prev, ...filteredStudentIds])];
      }
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || selectedStudents.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in the title and select at least one student",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const assignmentPromises = selectedStudents.map(async (studentId) => {
        const { data: assignment, error } = await supabase
          .from('assignments')
          .insert({
            title,
            description,
            created_by: userProfile?.id,
            assigned_to: studentId,
            organization_id: userProfile?.organization_id,
            due_date: dueDate || null,
            priority,
            assignment_type: assignmentType,
            status: 'pending',
          })
          .select()
          .single();

        if (error) throw error;
        return assignment;
      });

      await Promise.all(assignmentPromises);

      toast({
        title: "Success",
        description: `Created ${selectedStudents.length} assignment${selectedStudents.length > 1 ? 's' : ''}`,
      });

      resetForm();
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

  // Filtered students based on search
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load students only when dialog opens
  useEffect(() => {
    if (open) {
      fetchStudents();
    } else {
      resetForm();
    }
  }, [open]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create Bulk Assignment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assignment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Assignment Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Assignment Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter assignment title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter assignment description"
                  className="resize-none h-24"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <Select value={assignmentType} onValueChange={setAssignmentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Assignment</SelectItem>
                      <SelectItem value="coaching">Coaching Task</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="training">Training Module</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Due Date</label>
                  <Input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Student Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select Students</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedStudents.length} of {filteredStudents.length} selected
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={filteredStudents.length === 0}
                >
                  {filteredStudents.every(s => selectedStudents.includes(s.id)) ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Students List */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2 text-muted-foreground">Loading students...</span>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {students.length === 0 ? 'No students found' : 'No students match your search'}
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto border rounded-lg p-4 space-y-2">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleStudentToggle(student.id)}
                  >
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleStudentToggle(student.id)}
                    />
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {student.name.charAt(0).toUpperCase()}
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={creating || selectedStudents.length === 0 || !title}
              className="min-w-[160px]"
            >
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {creating ? 'Creating...' : `Create Assignment${selectedStudents.length > 1 ? 's' : ''} (${selectedStudents.length})`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BulkAssignmentDialog;