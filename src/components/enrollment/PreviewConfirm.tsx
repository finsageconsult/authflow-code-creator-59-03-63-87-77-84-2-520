import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  User, 
  Clock, 
  Calendar,
  CreditCard,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { EnrollmentData } from '@/hooks/useEnrollmentWorkflow';

interface PreviewConfirmProps {
  enrollmentData: EnrollmentData;
  userType: 'individual' | 'employee';
  onConfirm: () => Promise<boolean>;
  onPrevious: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const PreviewConfirm: React.FC<PreviewConfirmProps> = ({
  enrollmentData,
  userType,
  onConfirm,
  onPrevious,
  onCancel,
  isLoading
}) => {
  const { course, coach, timeSlot } = enrollmentData;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price / 100);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01 ${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleConfirm = async () => {
    const success = await onConfirm();
    // Component will handle success/failure via the hook
  };

  if (!course || !coach || !timeSlot) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Incomplete enrollment data</p>
        <Button onClick={onPrevious} variant="outline" className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const showPayment = userType === 'individual' && course.price > 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Review & Confirm</h3>
        <p className="text-muted-foreground">
          Please review your enrollment details before confirming
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Enrollment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Course Details */}
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium">{course.title}</h4>
              <p className="text-sm text-muted-foreground">
                {course.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{course.category}</Badge>
                <Badge variant="secondary">{course.duration}</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{formatPrice(course.price)}</div>
              {course.price === 0 && (
                <Badge variant="secondary" className="mt-1">Free</Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Coach Details */}
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium">{coach.name}</h4>
              <p className="text-sm text-muted-foreground">
                {coach.specialization}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">⭐ {coach.rating}</Badge>
                <Badge variant="secondary">{coach.experience}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Time Slot Details */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium">Session Schedule</h4>
              <p className="text-sm text-muted-foreground">
                {formatDate(timeSlot.date)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      {showPayment && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span>Total Amount:</span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(course.price)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Payment will be processed securely via Razorpay
            </p>
          </CardContent>
        </Card>
      )}

      {/* Employee Message */}
      {userType === 'employee' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">
                Employee Benefit - No Payment Required
              </span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              This enrollment is covered by your organization's benefits program.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Terms and Conditions */}
      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
        By confirming this enrollment, you agree to our terms and conditions. 
        You will receive a confirmation email with session details and meeting link.
      </div>

      <div className="flex justify-between">
        <Button onClick={onCancel} variant="outline" disabled={isLoading}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button onClick={onPrevious} variant="outline" disabled={isLoading}>
            Previous
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isLoading}
            className="px-8"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {showPayment ? 'Pay & Enroll Now' : 'Enroll Now'}
          </Button>
        </div>
      </div>
    </div>
  );
};