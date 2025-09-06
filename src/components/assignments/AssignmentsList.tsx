import React, { useState, useCallback } from 'react';
import { Assignment } from '@/hooks/useAssignments';
import StudentsProfileView from './StudentsProfileView';
import AssignmentChat from './AssignmentChat';

const AssignmentsList: React.FC = () => {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const handleBackFromChat = useCallback(() => {
    setSelectedAssignment(null);
  }, []);

  if (selectedAssignment) {
    return (
      <AssignmentChat
        assignment={selectedAssignment}
        onBack={handleBackFromChat}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assignment Center</h1>
          <p className="text-muted-foreground">Bulk assignment system for students</p>
        </div>
      </div>

      <StudentsProfileView />
    </div>
  );
};

export default AssignmentsList;