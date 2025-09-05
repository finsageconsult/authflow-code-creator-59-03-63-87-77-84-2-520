import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Star, Users } from 'lucide-react';
import { EnrollmentData } from '@/hooks/useEnrollmentWorkflow';

interface CoursePreviewProps {
  course: EnrollmentData['course'];
  onNext: () => void;
  onCancel: () => void;
}

export const CoursePreview: React.FC<CoursePreviewProps> = ({
  course,
  onNext,
  onCancel
}) => {
  if (!course) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No course selected</p>
        <Button onClick={onCancel} variant="outline" className="mt-4">
          Cancel
        </Button>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price / 100);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl">{course.title}</CardTitle>
              <Badge variant="outline">{course.category}</Badge>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatPrice(course.price)}
              </div>
              {course.price === 0 && (
                <Badge variant="secondary" className="mt-1">Free</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            {course.description}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{course.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Interactive</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm">4.8 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">150+ Students</span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">What you'll learn:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Comprehensive understanding of the topic</li>
              <li>• Practical strategies and techniques</li>
              <li>• Personalized coaching and guidance</li>
              <li>• Access to exclusive resources and tools</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button onClick={onNext} className="px-8">
          Continue
        </Button>
      </div>
    </div>
  );
};