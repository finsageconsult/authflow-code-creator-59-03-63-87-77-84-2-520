import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  UserPlus,
  Mail,
  Download,
  CheckCircle,
  Clock,
  Key,
  Send,
  Calendar
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
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

export const HRPeople = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Communication form state
  const [communication, setCommunication] = useState({
    type: 'reminder' as 'reminder' | 'nudge' | 'announcement' | 'follow_up',
    subject: '',
    message: '',
    webinarId: ''
  });

  // Access code form state
  const [accessCodeForm, setAccessCodeForm] = useState({
    email: '',
    role: 'EMPLOYEE' as string,
    expiryDays: 7
  });
  const [creatingAccessCode, setCreatingAccessCode] = useState(false);

  useEffect(() => {
    const fetchPeopleData = async () => {
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

        // Fetch tickets with employee names
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

      } catch (error) {
        console.error('Error fetching people data:', error);
        toast({
          title: "Error",
          description: "Failed to load people data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPeopleData();
  }, [userProfile?.organization_id]);

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

  const createAccessCode = async () => {
    if (!userProfile?.organization_id || !accessCodeForm.email) {
      toast({
        title: "Validation Error",
        description: "Please provide an email address",
        variant: "destructive"
      });
      return;
    }

    setCreatingAccessCode(true);
    try {
      // Generate a random access code
      const code = Math.random().toString(36).substr(2, 8).toUpperCase();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + accessCodeForm.expiryDays);

      // Create access code via edge function
      const { error: createError } = await supabase.functions.invoke('create-access-code', {
        body: {
          code,
          organization_id: userProfile.organization_id,
          role: accessCodeForm.role,
          expires_at: expiresAt.toISOString(),
          max_uses: 1,
          email: accessCodeForm.email
        }
      });

      if (createError) throw createError;

      // Send access code via email
      const { error: sendError } = await supabase.functions.invoke('send-access-code', {
        body: {
          email: accessCodeForm.email
        }
      });

      if (sendError) {
        console.error('Error sending access code email:', sendError);
        // Don't throw error here as the code was created successfully
        toast({
          title: "Access Code Created",
          description: `Access code created for ${accessCodeForm.email}. Email sending may have failed - please share the code manually: ${code}`,
          variant: "default"
        });
      } else {
        toast({
          title: "Success",
          description: `Access code created and sent to ${accessCodeForm.email}`
        });
      }

      // Reset form
      setAccessCodeForm({
        email: '',
        role: 'EMPLOYEE',
        expiryDays: 7
      });

    } catch (error) {
      console.error('Error creating access code:', error);
      toast({
        title: "Error",
        description: "Failed to create access code",
        variant: "destructive"
      });
    } finally {
      setCreatingAccessCode(false);
    }
  };

  const exportData = async () => {
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
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading people data...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">People Management</h1>
        <Button
          variant="outline"
          onClick={exportData}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Add Employee Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Add New Employee
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Employee Email</label>
              <Input
                type="email"
                placeholder="employee@company.com"
                value={accessCodeForm.email}
                onChange={(e) => setAccessCodeForm({...accessCodeForm, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select 
                value={accessCodeForm.role} 
                onValueChange={(value) => setAccessCodeForm({...accessCodeForm, role: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-md z-50">
                  <SelectItem value="EMPLOYEE">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Access Code Expiry</label>
              <Select 
                value={accessCodeForm.expiryDays.toString()} 
                onValueChange={(value) => setAccessCodeForm({...accessCodeForm, expiryDays: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            onClick={createAccessCode} 
            disabled={creatingAccessCode || !accessCodeForm.email}
            className="w-full"
          >
            {creatingAccessCode ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Creating Access Code...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Generate & Send Access Code
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            An access code will be generated and sent to the employee's email. They can use this code to register and join your organization.
          </p>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members ({employees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {employees.map((employee) => (
              <div key={employee.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 md:p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100 flex-shrink-0">
                    <UserPlus className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm md:text-base">{employee.name}</h4>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{employee.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined: {new Date(employee.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={employee.status === 'ACTIVE' ? 'default' : 'secondary'}
                  className="self-start sm:self-center flex-shrink-0"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {employee.status}
                </Badge>
              </div>
            ))}
            {employees.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No employees found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Communication Center */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Communication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Communication Type</label>
              <Select 
                value={communication.type} 
                onValueChange={(value: any) => setCommunication({...communication, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="nudge">Nudge</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Enter subject"
                value={communication.subject}
                onChange={(e) => setCommunication({...communication, subject: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              placeholder="Enter your message"
              value={communication.message}
              onChange={(e) => setCommunication({...communication, message: e.target.value})}
              rows={4}
            />
          </div>
          <Button onClick={sendCommunication} className="w-full">
            <Mail className="h-4 w-4 mr-2" />
            Send to All Active Employees ({employees.filter(e => e.status === 'ACTIVE').length})
          </Button>
        </CardContent>
      </Card>

      {/* Support Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Support Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tickets.slice(0, 5).map((ticket) => (
              <div key={ticket.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium text-sm md:text-base">{ticket.title}</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {ticket.employee_name} • {new Date(ticket.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Badge variant="outline" className="text-xs">
                    {ticket.category}
                  </Badge>
                  <Badge 
                    variant={ticket.status === 'open' ? 'destructive' : 'default'}
                    className="text-xs"
                  >
                    {ticket.status}
                  </Badge>
                </div>
              </div>
            ))}
            {tickets.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No support tickets</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};