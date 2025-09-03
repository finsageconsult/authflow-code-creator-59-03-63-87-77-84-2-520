
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, User, Star, UserCheck } from 'lucide-react';
import coachAvatar from '@/assets/coach-avatar.png';

interface Coach {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  nextAvailable: string;
  avatar?: string;
}

interface AvailableCoachesProps {
  onSelectCoach: (coach: Coach) => void;
}

export const AvailableCoaches = ({ onSelectCoach }: AvailableCoachesProps) => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - in real app, this would fetch from Supabase
    const mockCoaches: Coach[] = [
      {
        id: '1',
        name: 'Dr. Priya Sharma',
        specialization: 'Investment Planning & Portfolio Management',
        experience: '8+ years',
        rating: 4.9,
        nextAvailable: 'Today, 2:00 PM',
        avatar: coachAvatar
      },
      {
        id: '2',
        name: 'Rajesh Kumar',
        specialization: 'Tax Planning & Retirement Strategy',
        experience: '12+ years',
        rating: 4.8,
        nextAvailable: 'Tomorrow, 10:00 AM',
        avatar: coachAvatar
      },
      {
        id: '3',
        name: 'Anita Desai',
        specialization: 'Insurance & Risk Management',
        experience: '6+ years',
        rating: 4.7,
        nextAvailable: 'Tomorrow, 3:30 PM',
        avatar: coachAvatar
      }
    ];
    
    setTimeout(() => {
      setCoaches(mockCoaches);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Available Coaches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Available Coaches
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {coaches.map((coach) => (
            <Card key={coach.id} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={coach.avatar} alt={coach.name} />
                    <AvatarFallback>{coach.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{coach.name}</h4>
                        <p className="text-sm text-gray-600 mb-1">{coach.specialization}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{coach.experience} experience</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{coach.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">
                        Next Available: {coach.nextAvailable}
                      </span>
                    </div>
                    
                    <Button 
                      onClick={() => onSelectCoach(coach)}
                      className="w-full bg-primary hover:bg-primary/90"
                      size="sm"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Select Coach
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {coaches.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No coaches available at the moment.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
