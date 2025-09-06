import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Send, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SimpleAssignmentsList: React.FC = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium'
  });

  const mockAssignments = [
    {
      id: '1',
      title: 'Financial Goal Setting',
      description: 'Define short and long-term financial objectives',
      assignedTo: 'John Doe',
      status: 'pending',
      dueDate: '2024-01-15',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Budget Planning Worksheet',
      description: 'Complete monthly budget analysis',
      assignedTo: 'Jane Smith',
      status: 'in_progress',
      dueDate: '2024-01-10',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Investment Portfolio Review',
      description: 'Analyze current investment allocations',
      assignedTo: 'Bob Johnson',
      status: 'completed',
      dueDate: '2024-01-05',
      priority: 'low'
    }
  ];

  const mockStudents = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
    { id: '4', name: 'Alice Brown', email: 'alice@example.com' },
    { id: '5', name: 'Charlie Davis', email: 'charlie@example.com' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.assignedTo) {
      toast({
        title: "Error",
        description: "Please fill in the title and select a student",
        variant: "destructive",
      });
      return;
    }

    // Here you would normally save to database
    toast({
      title: "Success",
      description: "Assignment created successfully",
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      dueDate: '',
      priority: 'medium'
    });
    setShowCreateForm(false);
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      dueDate: '',
      priority: 'medium'
    });
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assignment Center</h1>
          <p className="text-muted-foreground">Manage and track student assignments</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Assignment
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">23</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-yellow-600"></div>
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Pending Assignments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
              </div>
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">Completed This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Assignment Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Create New Assignment</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Assignment Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter assignment title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter assignment description"
                  className="resize-none h-24"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Assign to Student *</label>
                  <Select value={formData.assignedTo} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockStudents.map((student) => (
                        <SelectItem key={student.id} value={student.name}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
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
                  <label className="block text-sm font-medium mb-2">Due Date</label>
                  <Input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" className="gap-2">
                  <Send className="h-4 w-4" />
                  Send Assignment
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Recent Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAssignments.map((assignment) => (
              <div key={assignment.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{assignment.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-muted-foreground">Assigned to:</span>
                      <span className="text-sm font-medium">{assignment.assignedTo}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(assignment.priority)}>
                        {assignment.priority}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleAssignmentsList;