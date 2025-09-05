import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle } from 'lucide-react';
import { useEnrollmentWorkflow, EnrollmentData } from '@/hooks/useEnrollmentWorkflow';
import { CoursePreview } from './CoursePreview';
import { CoachSelection } from './CoachSelection';
import { TimeSlotSelection } from './TimeSlotSelection';
import { PreviewConfirm } from './PreviewConfirm';

interface EnrollmentWorkflowProps {
  initialCourse?: EnrollmentData['course'];
  userType: 'individual' | 'employee';
  onBack: () => void;
  onComplete: () => void;
}

export const EnrollmentWorkflow: React.FC<EnrollmentWorkflowProps> = ({
  initialCourse,
  userType,
  onBack,
  onComplete
}) => {
  const {
    currentStep,
    enrollmentData,
    isLoading,
    coaches,
    generateTimeSlots,
    setCourse,
    setCoach,
    setTimeSlot,
    nextStep,
    prevStep,
    resetWorkflow,
    submitEnrollment
  } = useEnrollmentWorkflow();

  // Set initial course when component mounts
  React.useEffect(() => {
    if (initialCourse && !enrollmentData.course) {
      setCourse(initialCourse);
    }
  }, [initialCourse, enrollmentData.course, setCourse]);

  const handleBack = () => {
    resetWorkflow();
    onBack();
  };

  const handleEnrollmentSuccess = () => {
    // Complete enrollment and notify parent
    onComplete();
  };

  const steps = [
    { number: 1, title: 'Course Preview', completed: currentStep > 1 },
    { number: 2, title: 'Select Coach', completed: currentStep > 2 },
    { number: 3, title: 'Select Time Slot', completed: currentStep > 3 },
    { number: 4, title: 'Preview & Confirm', completed: currentStep > 4 }
  ];

  const progressValue = ((currentStep - 1) / 3) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CoursePreview
            course={enrollmentData.course}
            onNext={nextStep}
            onCancel={handleBack}
          />
        );
      case 2:
        return (
          <CoachSelection
            coaches={coaches}
            selectedCoach={enrollmentData.coach}
            onSelectCoach={setCoach}
            onNext={nextStep}
            onPrevious={prevStep}
            isLoading={isLoading}
          />
        );
      case 3:
        return (
          <TimeSlotSelection
            coach={enrollmentData.coach}
            timeSlots={enrollmentData.coach ? generateTimeSlots(enrollmentData.coach.id) : []}
            selectedTimeSlot={enrollmentData.timeSlot}
            onSelectTimeSlot={setTimeSlot}
            onNext={nextStep}
            onPrevious={prevStep}
            isLoading={isLoading}
          />
        );
      case 4:
        return (
          <PreviewConfirm
            enrollmentData={enrollmentData}
            userType={userType}
            onConfirm={async () => {
              const success = await submitEnrollment(userType);
              if (success) {
                handleEnrollmentSuccess();
              }
              return success;
            }}
            onPrevious={prevStep}
            onCancel={handleBack}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          ← Back to Courses
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            Course Enrollment
            <Badge variant="outline" className="text-xs">
              {userType === 'individual' ? 'Individual' : 'Employee'} Enrollment
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete the enrollment process to book your coaching session and access course materials.
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="space-y-4">
        <Progress value={progressValue} className="h-2" />
        
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex items-center gap-2">
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle 
                    className={`h-5 w-5 ${
                      currentStep === step.number 
                        ? 'text-primary fill-current' 
                        : 'text-muted-foreground'
                    }`} 
                  />
                )}
                <span 
                  className={`text-xs font-medium ${
                    currentStep === step.number 
                      ? 'text-primary' 
                      : step.completed 
                      ? 'text-green-600' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="w-8 h-px bg-muted mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mt-6">
        {renderStep()}
      </div>
    </div>
  );
};