import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle2, User } from 'lucide-react';
import { EnrollmentData } from '@/hooks/useEnrollmentWorkflow';

interface CoachSelectionProps {
  coaches: Array<{
    id: string;
    name: string;
    specialties: string[];
    rating: number;
    experience: string;
    avatar?: string;
  }>;
  selectedCoach: EnrollmentData['coach'];
  onSelectCoach: (coach: EnrollmentData['coach']) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading: boolean;
}

export const CoachSelection: React.FC<CoachSelectionProps> = ({
  coaches,
  selectedCoach,
  onSelectCoach,
  onNext,
  onPrevious,
  isLoading
}) => {
  const handleCoachSelect = (coach: any) => {
    onSelectCoach(coach);
  };

  const canProceed = !!selectedCoach;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Choose Your Coach</h3>
        <p className="text-muted-foreground mb-2">
          Select a coach who matches your learning style and preferences
        </p>
        {coaches.length < 10 && (
          <div className="bg-muted/30 p-2 rounded-lg border">
            <p className="text-sm text-muted-foreground">
              💡 Showing coaches matched to this course based on specialties
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-4 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : coaches.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-semibold text-lg mb-2">No Matching Coaches Available</h4>
              <p className="text-muted-foreground text-sm mb-4">
                No coaches found with specialties matching this course. Please contact support or try a different course.
              </p>
              <div className="bg-muted/30 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  This happens when no coaches have specialties that match the course tags. 
                  We're continuously adding more coaches to our platform.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          coaches.map((coach) => {
            const isSelected = selectedCoach?.id === coach.id;
            
            return (
              <Card 
                key={coach.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary shadow-md' : ''
                }`}
                onClick={() => handleCoachSelect(coach)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2">
                      <AvatarImage src={coach.avatar} alt={coach.name} />
                      <AvatarFallback>
                        <User className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                         <div>
                           <h4 className="font-semibold text-lg">{coach.name}</h4>
                           <p className="text-muted-foreground text-sm">
                             {coach.specialties.join(', ')}
                           </p>
                         </div>
                        {isSelected && (
                          <CheckCircle2 className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{coach.rating}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {coach.experience}
                        </Badge>
                      </div>

                       {/* Display specialties as individual badges */}
                       <div className="flex flex-wrap gap-1 mt-2">
                         {coach.specialties.slice(0, 4).map((specialty, index) => (
                           <Badge 
                             key={index} 
                             variant="secondary" 
                             className="text-xs px-2 py-1"
                           >
                             {specialty.trim()}
                           </Badge>
                         ))}
                         {coach.specialties.length > 4 && (
                           <Badge variant="outline" className="text-xs px-2 py-1">
                             +{coach.specialties.length - 4} more
                           </Badge>
                         )}
                       </div>

                       <div className="text-xs text-muted-foreground mt-1">
                         Available for 1:1 sessions • Expert in financial planning
                         {coach.specialties.length === 0 && (
                           <span className="text-yellow-600"> • Specialties not set</span>
                         )}
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {selectedCoach && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="font-medium text-sm">Selected Coach</span>
            </div>
             <p className="text-sm text-muted-foreground">
               <strong>{selectedCoach.name}</strong> - {selectedCoach.specialties?.join(', ') || 'General Coach'}
             </p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button onClick={onPrevious} variant="outline" disabled={isLoading}>
          Previous
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!canProceed || isLoading}
          className="px-8"
        >
          Next
        </Button>
      </div>
    </div>
  );
};