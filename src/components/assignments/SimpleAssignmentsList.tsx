import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus } from 'lucide-react';
import BulkAssignmentDialog from './BulkAssignmentDialog';

const SimpleAssignmentsList: React.FC = () => {
  const { userProfile } = useAuth();
  const [showBulkDialog, setShowBulkDialog] = useState(false);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assignment Center</h1>
          <p className="text-muted-foreground">Manage and track student assignments</p>
        </div>
        <Button onClick={() => setShowBulkDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Bulk Assignment
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

      <BulkAssignmentDialog
        open={showBulkDialog}
        onOpenChange={setShowBulkDialog}
      />
    </div>
  );
};

export default SimpleAssignmentsList;