import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Plus,
  Users,
  Clock,
  BookOpen
} from 'lucide-react';

interface Webinar {
  id: string;
  title: string;
  description: string;
  scheduled_date: string;
  duration_minutes: number;
  max_participants: number;
  current_participants: number;
  status: string;
  credits_required: number;
}

export const HRCalendar = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);

  // Webinar form state
  const [newWebinar, setNewWebinar] = useState({
    title: '',
    description: '',
    instructor_name: '',
    scheduled_date: '',
    duration_minutes: 60,
    max_participants: 100,
    credits_required: 2
  });

  useEffect(() => {
    const fetchWebinars = async () => {
      if (!userProfile?.organization_id) {
        setLoading(false);
        return;
      }

      try {
        const { data: webinarsData } = await supabase
          .from('webinars')
          .select('*')
          .eq('organization_id', userProfile.organization_id)
          .order('scheduled_date', { ascending: true });

        setWebinars(webinarsData || []);
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
  }, [userProfile?.organization_id]);

  const createWebinar = async () => {
    if (!userProfile?.organization_id || !newWebinar.title || !newWebinar.scheduled_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('webinars')
        .insert({
          ...newWebinar,
          organization_id: userProfile.organization_id,
          created_by: userProfile.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Webinar scheduled successfully"
      });

      // Reset form
      setNewWebinar({
        title: '',
        description: '',
        instructor_name: '',
        scheduled_date: '',
        duration_minutes: 60,
        max_participants: 100,
        credits_required: 2
      });

      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error creating webinar:', error);
      toast({
        title: "Error",
        description: "Failed to schedule webinar",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading calendar...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Calendar & Events</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Schedule Event
        </Button>
      </div>

      {/* Schedule New Webinar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Schedule New Webinar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                placeholder="Webinar title"
                value={newWebinar.title}
                onChange={(e) => setNewWebinar({...newWebinar, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Instructor Name</label>
              <Input
                placeholder="Instructor name"
                value={newWebinar.instructor_name}
                onChange={(e) => setNewWebinar({...newWebinar, instructor_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Scheduled Date *</label>
              <Input
                type="datetime-local"
                value={newWebinar.scheduled_date}
                onChange={(e) => setNewWebinar({...newWebinar, scheduled_date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Input
                type="number"
                value={newWebinar.duration_minutes}
                onChange={(e) => setNewWebinar({...newWebinar, duration_minutes: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Participants</label>
              <Input
                type="number"
                value={newWebinar.max_participants}
                onChange={(e) => setNewWebinar({...newWebinar, max_participants: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Credits Required</label>
              <Input
                type="number"
                value={newWebinar.credits_required}
                onChange={(e) => setNewWebinar({...newWebinar, credits_required: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Webinar description"
              value={newWebinar.description}
              onChange={(e) => setNewWebinar({...newWebinar, description: e.target.value})}
              rows={3}
            />
          </div>
          <Button onClick={createWebinar} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Webinar
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Webinars
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {webinars
              .filter(w => new Date(w.scheduled_date) > new Date())
              .map((webinar) => (
                <div key={webinar.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="p-3 rounded-full bg-purple-100">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{webinar.title}</h4>
                    <p className="text-sm text-muted-foreground">{webinar.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(webinar.scheduled_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {webinar.duration_minutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {webinar.current_participants}/{webinar.max_participants}
                      </span>
                    </div>
                  </div>
                  <Badge variant={webinar.status === 'scheduled' ? 'default' : 'secondary'}>
                    {webinar.status}
                  </Badge>
                </div>
              ))}
            {webinars.filter(w => new Date(w.scheduled_date) > new Date()).length === 0 && (
              <p className="text-center text-muted-foreground py-8">No upcoming webinars</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Past Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Past Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {webinars
              .filter(w => new Date(w.scheduled_date) <= new Date())
              .slice(0, 5)
              .map((webinar) => (
                <div key={webinar.id} className="flex items-center gap-4 p-4 border rounded-lg opacity-75">
                  <div className="p-3 rounded-full bg-gray-100">
                    <BookOpen className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{webinar.title}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(webinar.scheduled_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {webinar.current_participants} attended
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline">
                    Completed
                  </Badge>
                </div>
              ))}
            {webinars.filter(w => new Date(w.scheduled_date) <= new Date()).length === 0 && (
              <p className="text-center text-muted-foreground py-8">No past events</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};