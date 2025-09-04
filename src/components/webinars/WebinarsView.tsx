import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, Users, ExternalLink, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmptyState } from '@/components/ui/empty-state';

interface Webinar {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  scheduled_date: string;
  duration_minutes: number;
  max_participants: number;
  current_participants: number;
  credits_required: number;
  status: string;
  meeting_link: string;
  organization_id: string;
}

export const WebinarsView = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWebinars = async () => {
      if (!userProfile?.organization_id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('webinars')
          .select('*')
          .eq('organization_id', userProfile.organization_id)
          .eq('status', 'scheduled')
          .order('scheduled_date', { ascending: true });

        if (error) throw error;
        setWebinars(data || []);
      } catch (error) {
        console.error('Error fetching webinars:', error);
        toast({
          title: "Error",
          description: "Failed to load webinars",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWebinars();
  }, [userProfile?.organization_id, toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  const handleJoinWebinar = (meetingLink: string, title: string) => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
      toast({
        title: "Joining Webinar",
        description: `Opening ${title} in a new tab`
      });
    } else {
      toast({
        title: "Meeting Link Unavailable",
        description: "The meeting link will be available closer to the webinar start time",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading webinars...</p>
        </div>
      </div>
    );
  }

  if (webinars.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Webinars</h1>
        </div>
        
        <EmptyState
          icon={<Video className="w-8 h-8 text-primary/60" />}
          title="No Webinars Available"
          description="There are no scheduled webinars at the moment. Check back later for upcoming financial wellness sessions."
          supportiveMessage="New webinars are added regularly by your organization"
          className="max-w-md mx-auto"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Webinars</h1>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {webinars.length} Available
        </Badge>
      </div>

      <p className="text-muted-foreground">
        Join live webinars to learn about financial wellness, planning strategies, and connect with expert instructors.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {webinars.map((webinar) => (
          <Card key={webinar.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg line-clamp-2">{webinar.title}</CardTitle>
                <Badge variant={isUpcoming(webinar.scheduled_date) ? "default" : "secondary"}>
                  {isUpcoming(webinar.scheduled_date) ? "Upcoming" : "Past"}
                </Badge>
              </div>
              {webinar.instructor_name && (
                <p className="text-sm text-muted-foreground">
                  with {webinar.instructor_name}
                </p>
              )}
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col gap-4">
              {webinar.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {webinar.description}
                </p>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(webinar.scheduled_date)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(webinar.scheduled_date)} ({webinar.duration_minutes} min)</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>
                    {webinar.current_participants || 0} / {webinar.max_participants} participants
                  </span>
                </div>
              </div>

              {webinar.credits_required && webinar.credits_required > 0 && (
                <Badge variant="outline" className="w-fit">
                  {webinar.credits_required} credits required
                </Badge>
              )}
              
              <div className="mt-auto pt-4">
                <Button 
                  onClick={() => handleJoinWebinar(webinar.meeting_link, webinar.title)}
                  className="w-full gap-2"
                  disabled={!isUpcoming(webinar.scheduled_date)}
                >
                  <ExternalLink className="h-4 w-4" />
                  {isUpcoming(webinar.scheduled_date) ? "Join Webinar" : "Webinar Ended"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};