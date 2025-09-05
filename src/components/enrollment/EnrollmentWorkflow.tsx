import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle } from 'lucide-react';
import { useEnrollmentWorkflow, EnrollmentData } from '@/hooks/useEnrollmentWorkflow';
import { CoursePreview } from './CoursePreview';
import { CoachSelection } from './CoachSelection';
import { TimeSlotSelection } from './TimeSlotSelection';
import { PreviewConfirm } from './PreviewConfirm';
import { PaymentStep } from './PaymentStep';

interface EnrollmentWorkflowProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourse?: EnrollmentData['course'];
  userType: 'individual' | 'employee';
}

export const EnrollmentWorkflow: React.FC<EnrollmentWorkflowProps> = ({
  isOpen,
  onClose,
  initialCourse,
  userType
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

  // Set initial course when dialog opens
  React.useEffect(() => {
    if (isOpen && initialCourse && !enrollmentData.course) {
      setCourse(initialCourse);
    }
  }, [isOpen, initialCourse, enrollmentData.course, setCourse]);

  const handleClose = () => {
    resetWorkflow();
    onClose();
  };

  const handleEnrollmentSuccess = () => {
    // Close dialog after successful enrollment
    handleClose();
  };

  const steps = [
    { number: 1, title: 'Course Preview', completed: currentStep > 1 },
    { number: 2, title: 'Select Coach', completed: currentStep > 2 },
    { number: 3, title: 'Select Time Slot', completed: currentStep > 3 },
    { number: 4, title: 'Review Details', completed: currentStep > 4 },
    { number: 5, title: 'Payment', completed: currentStep > 5 }
  ];

  const progressValue = ((currentStep - 1) / 4) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CoursePreview
            course={enrollmentData.course}
            onNext={nextStep}
            onCancel={handleClose}
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
            onNext={nextStep}
            onPrevious={prevStep}
            onCancel={handleClose}
            isLoading={isLoading}
          />
        );
      case 5:
        // Show payment step only for individual users with paid courses
        if (userType === 'individual' && enrollmentData.course?.price > 0) {
          return (
            <PaymentStep
              enrollmentData={enrollmentData}
              onNext={async () => {
                const success = await submitEnrollment(userType);
                if (success) {
                  handleEnrollmentSuccess();
                }
              }}
              onPrevious={prevStep}
              onCancel={handleClose}
              isLoading={isLoading}
            />
          );
        } else {
          // For free courses or employees, directly submit enrollment
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
              onCancel={handleClose}
              isLoading={isLoading}
            />
          );
        }
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Course Enrollment
            <Badge variant="outline" className="text-xs">
              {userType === 'individual' ? 'Individual' : 'Employee'} Enrollment
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Complete the enrollment process to book your coaching session and access course materials.
          </DialogDescription>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
};