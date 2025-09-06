import React from 'react';

const SimpleAssignmentsList: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assignment Center</h1>
          <p className="text-muted-foreground">Bulk assignment system for students</p>
        </div>
      </div>

      <div className="text-center py-12">
        <p className="text-muted-foreground">Assignment system is being fixed...</p>
      </div>
    </div>
  );
};

export default SimpleAssignmentsList;