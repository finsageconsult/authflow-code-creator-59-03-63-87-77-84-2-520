import React from 'react';

const AssignmentsList: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assignment Center</h1>
          <p className="text-muted-foreground">Bulk assignment system for students</p>
        </div>
      </div>
      <div className="p-8 text-center">
        <p>Assignment functionality temporarily disabled for debugging</p>
      </div>
    </div>
  );
};

export default AssignmentsList;