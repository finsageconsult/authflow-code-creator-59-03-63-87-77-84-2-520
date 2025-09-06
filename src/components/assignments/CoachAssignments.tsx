import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Users, Plus, Calendar, Send, FileText, Clock, Upload, X, Eye, Edit, Trash2, MoreVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  name: string;
  email: string;
  user_type: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  assigned_to: string;
  student_name: string;
  created_at: string;
}

export const CoachAssignments = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingAssignment, setDeletingAssignment] = useState<Assignment | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);
  const [assignmentFiles, setAssignmentFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
    assignment_type: 'general',
    status: 'pending'
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      fetchAssignments();
    }
  }, [students]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase.rpc('get_students_for_current_coach');
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive"
      });
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data: assignmentsData, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('created_by', userProfile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Use the students data that's already available to get names
      const formattedAssignments = assignmentsData?.map(assignment => {
        const student = students.find(s => s.id === assignment.assigned_to);
        return {
          ...assignment,
          student_name: student?.name || 'Unknown Student'
        };
      }) || [];

      setAssignments(formattedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!selectedStudent || !formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please select a student and enter assignment title",
        variant: "destructive"
      });
      return;
    }

    try {
      // First create the assignment
      const { data: assignment, error } = await supabase
        .from('assignments')
        .insert({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          due_date: formData.due_date || null,
          assignment_type: formData.assignment_type,
          assigned_to: selectedStudent.id,
          created_by: userProfile?.id,
          organization_id: userProfile?.organization_id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Upload files if any were selected
      if (selectedFiles.length > 0 && userProfile) {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error('Authentication required for file upload');
        }

        for (const file of selectedFiles) {
          try {
            // Clean filename to remove invalid characters
            const cleanFileName = file.name.replace(/[{}[\]]/g, '');
            const fileName = `${user.id}/${Date.now()}-${cleanFileName}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('assignments')
              .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Get signed URL for private bucket access
            const { data: signedUrlData, error: urlError } = await supabase.storage
              .from('assignments')
              .createSignedUrl(fileName, 60 * 60 * 24 * 30); // 30 days expiry

            if (urlError) throw urlError;

            // Save file record with signed URL
            const { error: fileError } = await supabase
              .from('assignment_files')
              .insert({
                assignment_id: assignment.id,
                file_name: file.name,
                file_url: signedUrlData.signedUrl,
                file_size: file.size,
                mime_type: file.type,
                uploaded_by: userProfile.id,
              });

            if (fileError) throw fileError;
          } catch (fileError) {
            console.error('Error uploading file:', file.name, fileError);
            // Continue with other files even if one fails
          }
        }
      }

      toast({
        title: "Success",
        description: "Assignment created successfully"
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        assignment_type: 'general',
        status: 'pending'
      });
      setSelectedFiles([]);
      setSelectedStudent(null);
      setShowCreateForm(false);
      
      // Refresh assignments
      fetchAssignments();

    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive"
      });
    }
  };

  const handleEditAssignment = async () => {
    if (!editingAssignment) return;

    try {
      const { error } = await supabase
        .from('assignments')
        .update({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          due_date: formData.due_date || null,
          status: formData.status || editingAssignment.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingAssignment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment updated successfully"
      });

      // Reset form and close dialog
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        assignment_type: 'general',
        status: 'pending'
      });
      setEditingAssignment(null);
      setShowEditForm(false);
      
      // Refresh assignments
      fetchAssignments();

    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAssignment = async () => {
    if (!deletingAssignment) return;

    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', deletingAssignment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment deleted successfully"
      });

      setDeletingAssignment(null);
      setShowDeleteDialog(false);
      
      // Refresh assignments
      fetchAssignments();

    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      priority: assignment.priority as 'low' | 'medium' | 'high',
      due_date: assignment.due_date ? new Date(assignment.due_date).toISOString().slice(0, 16) : '',
      assignment_type: 'general', // assignment_type not in Assignment interface
      status: assignment.status
    });
    setShowEditForm(true);
  };

  const openDeleteDialog = (assignment: Assignment) => {
    setDeletingAssignment(assignment);
    setShowDeleteDialog(true);
  };

  const openViewDialog = async (assignment: Assignment) => {
    setViewingAssignment(assignment);
    setShowViewDialog(true);
    
    // Fetch assignment files
    try {
      const { data: files, error } = await supabase
        .from('assignment_files')
        .select('*')
        .eq('assignment_id', assignment.id);
      
      if (error) throw error;
      setAssignmentFiles(files || []);
    } catch (error) {
      console.error('Error fetching assignment files:', error);
      setAssignmentFiles([]);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assignment Center</h1>
          <p className="text-muted-foreground">Manage and track student assignments</p>
        </div>
        
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] space-y-4 pr-2">
              {/* Student Selection */}
              <div className="space-y-2">
                <Label>Select Student</Label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className={`p-3 border rounded-lg cursor-pointer flex items-center gap-3 ${
                        selectedStudent?.id === student.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                      }`}
                    >
                      <Avatar>
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                        <Badge variant="outline" className="text-xs">{student.user_type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignment Form */}
              {selectedStudent && (
                <div className="space-y-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Assignment Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter assignment title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the assignment details"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <select
                        id="priority"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="due_date">Due Date</Label>
                      <Input
                        id="due_date"
                        type="datetime-local"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div className="space-y-2">
                    <Label>Attach Files</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        multiple
                        onChange={(e) => {
                          if (e.target.files) {
                            setSelectedFiles(Array.from(e.target.files));
                          }
                        }}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="text-center">
                          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Click to upload files or drag and drop</p>
                          <p className="text-xs text-gray-400">PDF, DOC, TXT, Images, ZIP up to 10MB</p>
                        </div>
                      </label>
                    </div>
                    
                    {/* Selected Files Display */}
                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Selected Files:</Label>
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        setSelectedStudent(null);
                        setSelectedFiles([]);
                         setFormData({
                           title: '',
                           description: '',
                           priority: 'medium',
                           due_date: '',
                           assignment_type: 'general',
                           status: 'pending'
                         });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateAssignment} className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Send Assignment
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Students Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Students ({students.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <div key={student.id} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.user_type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                 <div key={assignment.id} className="p-4 border rounded-lg">
                   <div className="flex items-start justify-between">
                     <div className="space-y-1 flex-1">
                       <h3 className="font-medium">{assignment.title}</h3>
                       <p className="text-sm text-muted-foreground">{assignment.description}</p>
                       <p className="text-sm text-muted-foreground">Assigned to: {assignment.student_name}</p>
                       {assignment.due_date && (
                         <p className="text-sm text-muted-foreground flex items-center gap-1">
                           <Calendar className="h-3 w-3" />
                           Due: {new Date(assignment.due_date).toLocaleDateString()}
                         </p>
                       )}
                     </div>
                     <div className="flex items-center gap-2">
                       <Badge variant={getPriorityColor(assignment.priority)}>
                         {assignment.priority}
                       </Badge>
                       <Badge className={getStatusColor(assignment.status)}>
                         {assignment.status}
                       </Badge>
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="sm">
                             <MoreVertical className="h-4 w-4" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => openViewDialog(assignment)}>
                             <Eye className="h-4 w-4 mr-2" />
                             View Details
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => openEditDialog(assignment)}>
                             <Edit className="h-4 w-4 mr-2" />
                             Edit Assignment
                           </DropdownMenuItem>
                           <DropdownMenuItem 
                             onClick={() => openDeleteDialog(assignment)}
                             className="text-destructive focus:text-destructive"
                           >
                             <Trash2 className="h-4 w-4 mr-2" />
                             Delete Assignment
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                     </div>
                   </div>
                 </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No assignments created yet</p>
                <p className="text-sm text-muted-foreground">Create your first assignment to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Assignment Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Assignment Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter assignment title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the assignment details"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <select
                  id="edit-priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-due_date">Due Date</Label>
                <Input
                  id="edit-due_date"
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowEditForm(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditAssignment}>
                Update Assignment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Assignment Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assignment Details</DialogTitle>
          </DialogHeader>
          
          {viewingAssignment && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{viewingAssignment.title}</h3>
                <p className="text-muted-foreground mt-1">{viewingAssignment.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Assigned to:</Label>
                  <p className="text-sm">{viewingAssignment.student_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority:</Label>
                  <Badge variant={getPriorityColor(viewingAssignment.priority)} className="ml-2">
                    {viewingAssignment.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status:</Label>
                  <Badge className={`ml-2 ${getStatusColor(viewingAssignment.status)}`}>
                    {viewingAssignment.status}
                  </Badge>
                </div>
                {viewingAssignment.due_date && (
                  <div>
                    <Label className="text-sm font-medium">Due Date:</Label>
                    <p className="text-sm">{new Date(viewingAssignment.due_date).toLocaleString()}</p>
                  </div>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-medium">Created:</Label>
                <p className="text-sm">{new Date(viewingAssignment.created_at).toLocaleString()}</p>
              </div>

              {/* Assignment Files */}
              <div>
                <Label className="text-sm font-medium">Attached Files:</Label>
                {assignmentFiles.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {assignmentFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{file.file_name}</span>
                          <span className="text-xs text-gray-400">
                            ({(file.file_size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(file.file_url, '_blank')}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">No files attached</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Assignment Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingAssignment?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAssignment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Assignment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};