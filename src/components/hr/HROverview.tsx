import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Calendar,
  Target,
  Activity,
  FileText,
  AlertTriangle
} from 'lucide-react';

interface HRStats {
  totalEmployees: number;
  activeEmployees: number;
  creditsAllocated: number;
  upcomingWebinars: number;
}

interface Webinar {
  id: string;
  title: string;
  scheduled_date: string;
  current_participants: number;
  status: string;
}

interface Ticket {
  id: string;
  status: string;
}

export const HROverview = () => {
  const { userProfile, organization, profileReady } = useAuth();
  const [stats, setStats] = useState<HRStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    creditsAllocated: 0,
    upcomingWebinars: 0
  });
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      if (!userProfile?.organization_id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch employees
        const { data: employeesData } = await supabase
          .from('users')
          .select('id, status, created_at')
          .eq('organization_id', userProfile.organization_id)
          .eq('role', 'EMPLOYEE');

        // Fetch webinars
        const { data: webinarsData } = await supabase
          .from('webinars')
          .select('id, title, scheduled_date, current_participants, status')
          .eq('organization_id', userProfile.organization_id)
          .order('scheduled_date', { ascending: true })
          .limit(5);

        setWebinars(webinarsData || []);

        // Fetch tickets
        const { data: ticketsData } = await supabase
          .from('tickets')
          .select('id, status')
          .eq('organization_id', userProfile.organization_id);

        setTickets(ticketsData || []);

        // Calculate stats
        const activeCount = employeesData?.filter(emp => emp.status === 'ACTIVE').length || 0;
        const upcomingCount = webinarsData?.filter(w => 
          new Date(w.scheduled_date) > new Date() && w.status === 'scheduled'
        ).length || 0;

        setStats({
          totalEmployees: employeesData?.length || 0,
          activeEmployees: activeCount,
          creditsAllocated: 0,
          upcomingWebinars: upcomingCount
        });

      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (profileReady) {
      fetchOverviewData();
    }
  }, [profileReady, userProfile?.organization_id]);

  if (!profileReady || loading) {
    return <div className="flex items-center justify-center h-96">Loading overview...</div>;
  }

  if (!userProfile?.organization_id) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-orange-600 mt-1" />
            <div>
              <h3 className="font-semibold text-orange-800">Organization Assignment Required</h3>
              <p className="text-orange-700 mt-1">
                You need to be assigned to an organization to access HR management features.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">HR Overview</h1>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            {organization?.name} - Program Management
          </p>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            HR Manager
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">+5 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Participants</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalEmployees > 0 ? Math.round((stats.activeEmployees / stats.totalEmployees) * 100) : 0}% engagement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Webinars</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingWebinars}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.filter(t => t.status === 'open').length}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Program Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {webinars.slice(0, 3).map((webinar) => (
            <div key={webinar.id} className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="p-2 rounded-full bg-blue-100">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{webinar.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(webinar.scheduled_date).toLocaleDateString()} - {webinar.current_participants} participants
                </p>
              </div>
              <Badge variant={webinar.status === 'completed' ? 'default' : 'secondary'}>
                {webinar.status}
              </Badge>
            </div>
          ))}
          {webinars.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No recent webinars</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};