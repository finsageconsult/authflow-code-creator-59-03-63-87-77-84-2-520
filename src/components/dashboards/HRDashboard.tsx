import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  UserPlus,
  BarChart3,
  Mail,
  FileText,
  Settings,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  PieChart,
  Activity
} from 'lucide-react';
import { HRCreditAllocation } from '@/components/credits/HRCreditAllocation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface HRStats {
  totalEmployees: number;
  activeEmployees: number;
  creditsAllocated: number;
  upcomingWebinars: number;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
}

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

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  employee_name: string;
}

interface AnonymizedInsights {
  totalEmployees: number;
  activeParticipants: number;
  avgStressLevel: number;
  avgConfidenceLevel: number;
  moodDistribution: Record<string, number>;
  topConcerns: Record<string, number>;
  webinarAttendanceRate: number;
  oneOnOneBookingRate: number;
  toolUsageRate: number;
}

export const HRDashboard = () => {
  const { userProfile, organization, profileReady } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<HRStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    creditsAllocated: 0,
    upcomingWebinars: 0
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [insights, setInsights] = useState<AnonymizedInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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

  // Communication form state
  const [communication, setCommunication] = useState({
    type: 'reminder' as 'reminder' | 'nudge' | 'announcement' | 'follow_up',
    subject: '',
    message: '',
    webinarId: ''
  });

  useEffect(() => {
    const fetchAllData = async () => {
      if (!userProfile?.organization_id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch employees
        const { data: employeesData } = await supabase
          .from('users')
          .select('id, name, email, status, created_at')
          .eq('organization_id', userProfile.organization_id)
          .eq('role', 'EMPLOYEE')
          .order('created_at', { ascending: false });

        setEmployees(employeesData || []);

        // Fetch webinars
        const { data: webinarsData } = await supabase
          .from('webinars')
          .select('*')
          .eq('organization_id', userProfile.organization_id)
          .order('scheduled_date', { ascending: true });

        setWebinars(webinarsData || []);

        // Fetch tickets (simplified query to avoid join issues)
        const { data: ticketsData } = await supabase
          .from('tickets')
          .select('id, title, status, priority, category, created_at, employee_id')
          .eq('organization_id', userProfile.organization_id)
          .order('created_at', { ascending: false })
          .limit(10);

        // Get employee names separately
        const employeeIds = ticketsData?.map(t => t.employee_id) || [];
        const { data: employeeNames } = await supabase
          .from('users')
          .select('id, name')
          .in('id', employeeIds);

        const employeeMap = new Map(employeeNames?.map(e => [e.id, e.name]) || []);

        const formattedTickets = ticketsData?.map(ticket => ({
          ...ticket,
          employee_name: employeeMap.get(ticket.employee_id) || 'Unknown'
        })) || [];

        setTickets(formattedTickets);

        // Fetch anonymized insights
        const { data: insightsData } = await supabase
          .from('anonymized_insights')
          .select('*')
          .eq('organization_id', userProfile.organization_id)
          .order('insight_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (insightsData) {
          setInsights({
            totalEmployees: insightsData.total_employees,
            activeParticipants: insightsData.active_participants,
            avgStressLevel: insightsData.avg_stress_level,
            avgConfidenceLevel: insightsData.avg_confidence_level,
            moodDistribution: (insightsData.mood_distribution && typeof insightsData.mood_distribution === 'object') 
              ? insightsData.mood_distribution as Record<string, number> 
              : {},
            topConcerns: (insightsData.top_concerns && typeof insightsData.top_concerns === 'object') 
              ? insightsData.top_concerns as Record<string, number> 
              : {},
            webinarAttendanceRate: insightsData.webinar_attendance_rate,
            oneOnOneBookingRate: insightsData.one_on_one_booking_rate,
            toolUsageRate: insightsData.tool_usage_rate
          });
        }

        // Calculate stats
        const activeCount = employeesData?.filter(emp => emp.status === 'ACTIVE').length || 0;
        const upcomingCount = webinarsData?.filter(w => 
          new Date(w.scheduled_date) > new Date() && w.status === 'scheduled'
        ).length || 0;

        setStats({
          totalEmployees: employeesData?.length || 0,
          activeEmployees: activeCount,
          creditsAllocated: 0, // Will be fetched from org_plans
          upcomingWebinars: upcomingCount
        });

      } catch (error) {
        console.error('Error fetching HR data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (profileReady) {
      fetchAllData();
    }
  }, [profileReady, userProfile?.organization_id]);

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

  const sendCommunication = async () => {
    if (!userProfile?.organization_id || !communication.subject || !communication.message) {
      toast({
        title: "Validation Error",
        description: "Please fill in subject and message",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get employee emails
      const recipientEmails = employees
        .filter(emp => emp.status === 'ACTIVE')
        .map(emp => emp.email);

      if (recipientEmails.length === 0) {
        toast({
          title: "No Recipients",
          description: "No active employees found to send communication",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase.functions.invoke('send-program-communication', {
        body: {
          organizationId: userProfile.organization_id,
          webinarId: communication.webinarId || null,
          type: communication.type,
          subject: communication.subject,
          messageBody: communication.message,
          recipientEmails
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Communication sent to ${recipientEmails.length} employees`
      });

      // Reset form
      setCommunication({
        type: 'reminder',
        subject: '',
        message: '',
        webinarId: ''
      });
    } catch (error) {
      console.error('Error sending communication:', error);
      toast({
        title: "Error",
        description: "Failed to send communication",
        variant: "destructive"
      });
    }
  };

  const exportData = async (format: 'csv' | 'pdf') => {
    // Simple CSV export implementation
    if (format === 'csv') {
      const csvData = employees.map(emp => ({
        Name: emp.name,
        Email: emp.email,
        Status: emp.status,
        'Join Date': new Date(emp.created_at).toLocaleDateString()
      }));

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employees-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Employee data exported successfully"
      });
    }
  };

  if (!profileReady || loading) {
    return <div className="flex items-center justify-center h-96">Loading HR dashboard...</div>;
  }

  if (!userProfile?.organization_id) {
    return (
      <div className="space-y-6">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600 mt-1" />
              <div>
                <h3 className="font-semibold text-orange-800">Organization Assignment Required</h3>
                <p className="text-orange-700 mt-1">
                  You need to be assigned to an organization to access HR management features. 
                  Please contact an administrator.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">HR Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData('csv')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            {organization?.name} - Program Management
          </p>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            HR Manager
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
          <TabsTrigger value="credits">Credits</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* People Tab */}
        <TabsContent value="people" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Employee Management</h2>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Invite Employees
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Employees ({employees.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{employee.name}</h4>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined: {new Date(employee.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={employee.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {employee.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credits Tab */}
        <TabsContent value="credits" className="space-y-6">
          <HRCreditAllocation />
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Schedule New Webinar */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule New Webinar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Webinar Title"
                  value={newWebinar.title}
                  onChange={(e) => setNewWebinar(prev => ({ ...prev, title: e.target.value }))}
                />
                <Textarea
                  placeholder="Description"
                  value={newWebinar.description}
                  onChange={(e) => setNewWebinar(prev => ({ ...prev, description: e.target.value }))}
                />
                <Input
                  placeholder="Instructor Name"
                  value={newWebinar.instructor_name}
                  onChange={(e) => setNewWebinar(prev => ({ ...prev, instructor_name: e.target.value }))}
                />
                <Input
                  type="datetime-local"
                  value={newWebinar.scheduled_date}
                  onChange={(e) => setNewWebinar(prev => ({ ...prev, scheduled_date: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Duration (minutes)"
                    value={newWebinar.duration_minutes}
                    onChange={(e) => setNewWebinar(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                  />
                  <Input
                    type="number"
                    placeholder="Max Participants"
                    value={newWebinar.max_participants}
                    onChange={(e) => setNewWebinar(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                  />
                </div>
                <Button onClick={createWebinar} className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Webinar
                </Button>
              </CardContent>
            </Card>

            {/* Send Communication */}
            <Card>
              <CardHeader>
                <CardTitle>Send Communication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={communication.type} onValueChange={(value: any) => setCommunication(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="nudge">Engagement Nudge</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Subject"
                  value={communication.subject}
                  onChange={(e) => setCommunication(prev => ({ ...prev, subject: e.target.value }))}
                />
                <Textarea
                  placeholder="Message body"
                  value={communication.message}
                  onChange={(e) => setCommunication(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                />
                <Button onClick={sendCommunication} className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Send to All Active Employees ({employees.filter(e => e.status === 'ACTIVE').length})
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Webinars */}
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Webinars</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webinars.filter(w => new Date(w.scheduled_date) > new Date()).map((webinar) => (
                  <div key={webinar.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{webinar.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(webinar.scheduled_date).toLocaleDateString()} at{' '}
                        {new Date(webinar.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {webinar.current_participants}/{webinar.max_participants} participants • {webinar.credits_required} credits
                      </p>
                    </div>
                    <Badge variant="outline">{webinar.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Engagement Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Stress Level</p>
                        <p className="text-2xl font-bold">{insights.avgStressLevel}/10</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Confidence</p>
                        <p className="text-2xl font-bold">{insights.avgConfidenceLevel}/10</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Program Adoption</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 border rounded">
                          <p className="text-xs text-muted-foreground">Webinars</p>
                          <p className="font-medium">{insights.webinarAttendanceRate}%</p>
                        </div>
                        <div className="p-2 border rounded">
                          <p className="text-xs text-muted-foreground">1:1 Coaching</p>
                          <p className="font-medium">{insights.oneOnOneBookingRate}%</p>
                        </div>
                        <div className="p-2 border rounded">
                          <p className="text-xs text-muted-foreground">Tools</p>
                          <p className="font-medium">{insights.toolUsageRate}%</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">No insights data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Concerns (Anonymized)</CardTitle>
              </CardHeader>
              <CardContent>
                {insights?.topConcerns ? (
                  <div className="space-y-3">
                    {Object.entries(insights.topConcerns)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([concern, count]) => (
                        <div key={concern} className="flex justify-between items-center">
                          <span className="text-sm">{concern}</span>
                          <Badge variant="outline">{count}%</Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No concern data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Privacy Notice */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-800">Privacy Protected</h3>
                  <p className="text-blue-700 mt-1">
                    All insights are anonymized. Individual employee responses and personal data are never exposed.
                    Only aggregated, statistical data is shown to maintain complete privacy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tickets/Referrals Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                HR → Coach Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.length > 0 ? tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{ticket.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Employee: {ticket.employee_name} • Category: {ticket.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        ticket.priority === 'urgent' ? 'destructive' :
                        ticket.priority === 'high' ? 'default' : 'secondary'
                      }>
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline">{ticket.status}</Badge>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-8">No referral tickets yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};