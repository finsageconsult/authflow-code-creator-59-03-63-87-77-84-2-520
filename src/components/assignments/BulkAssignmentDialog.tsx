import React, { useState } from 'react';
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
import { Loader2, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface BulkAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MOCK_STUDENTS = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'EMPLOYEE' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'EMPLOYEE' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'EMPLOYEE' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'EMPLOYEE' },
  { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', role: 'EMPLOYEE' }
];

const BulkAssignmentDialog: React.FC<BulkAssignmentDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignmentType, setAssignmentType] = useState('general');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
    setAssignmentType('general');
    setSelectedStudents([]);
    onOpenChange(false);
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === MOCK_STUDENTS.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(MOCK_STUDENTS.map(s => s.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || selectedStudents.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in the title and select at least one student",
        variant: "destructive",
      });
      return;
    }

    if (!userProfile?.id) {
      toast({
        title: "Error",
        description: "User profile not found",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const assignmentPromises = selectedStudents.map(async (studentId) => {
        const { error } = await supabase
          .from('assignments')
          .insert({
            title: title.trim(),
            description: description.trim() || null,
            created_by: userProfile.id,
            assigned_to: studentId,
            organization_id: userProfile.organization_id,
            due_date: dueDate || null,
            priority,
            assignment_type: assignmentType,
            status: 'pending',
          });

        if (error) throw error;
      });

      await Promise.all(assignmentPromises);

      toast({
        title: "Success",
        description: `Created ${selectedStudents.length} assignment${selectedStudents.length > 1 ? 's' : ''}`,
      });

      handleClose();
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
                  {selectedStudents.length} of {MOCK_STUDENTS.length} selected
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedStudents.length === MOCK_STUDENTS.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </div>

            {/* Students List */}
            <div className="max-h-80 overflow-y-auto border rounded-lg p-4 space-y-2">
              {MOCK_STUDENTS.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleStudentToggle(student.id)}
                >
                  <Checkbox
                    checked={selectedStudents.includes(student.id)}
                    onCheckedChange={() => handleStudentToggle(student.id)}
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
                        {student.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {student.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={creating || selectedStudents.length === 0 || !title.trim()}
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