import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  plan: string;
  status: string;
  created_at: string;
  org_plans: {
    plan_type: string;
    credit_allotment_1on1: number;
    credit_allotment_webinar: number;
  } | null;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  auth_id?: string;
  avatar_url?: string;
}

export default function OrganizationDetail() {
  const { id } = useParams<{ id: string }>();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && userProfile?.role === 'ADMIN') {
      fetchOrganizationData();
    }
  }, [id, userProfile]);

  const fetchOrganizationData = async () => {
    try {
      // Fetch organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select(`
          *,
          org_plans (
            plan_type,
            credit_allotment_1on1,
            credit_allotment_webinar
          )
        `)
        .eq('id', id)
        .single();

      if (orgError) throw orgError;
      setOrganization(orgData);

      // Fetch employees (exclude coaches, focus on employees and HR)
      console.log('Fetching employees for organization:', id);
      const { data: employeesData, error: employeesError } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          role,
          status,
          created_at,
          auth_id,
          organization_id,
          avatar_url
        `)
        .eq('organization_id', id)
        .in('role', ['EMPLOYEE', 'HR'])
        .order('created_at', { ascending: false });

      console.log('Employees data:', employeesData);
      if (employeesError) {
        console.error('Employees error:', employeesError);
        throw employeesError;
      }
      setEmployees(employeesData || []);

    } catch (error) {
      console.error('Error fetching organization data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch organization data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'hr':
        return 'bg-blue-100 text-blue-800';
      case 'coach':
        return 'bg-purple-100 text-purple-800';
      case 'employee':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (userProfile?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Access denied. Admin role required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Organization not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{organization.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={getStatusColor(organization.status)}>
              {organization.status}
            </Badge>
            <Badge variant="outline">
              {organization.org_plans?.plan_type || 'No Plan'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Organization Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">1:1 Credits</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organization.org_plans?.credit_allotment_1on1 || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webinar Credits</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organization.org_plans?.credit_allotment_webinar || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HR Profiles Section */}
      <Card>
        <CardHeader>
          <CardTitle>HR Profiles</CardTitle>
          <p className="text-sm text-muted-foreground">
            {employees.filter(emp => emp.role === 'HR').length} HR members registered in this organization
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.filter(employee => employee.role === 'HR').map((employee) => (
              <Card key={employee.id} className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{employee.name}</h4>
                    <p className="text-xs text-muted-foreground">{employee.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getRoleColor(employee.role)} variant="secondary">
                        {employee.role}
                      </Badge>
                      <Badge className={getStatusColor(employee.status)} variant="secondary">
                        {employee.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Joined: {new Date(employee.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            ))}
          </div>
          
          {employees.filter(emp => emp.role === 'HR').length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">No HR members yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                HR members will appear here once they join the organization.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Profiles Section */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Profiles</CardTitle>
          <p className="text-sm text-muted-foreground">
            {employees.filter(emp => emp.role === 'EMPLOYEE').length} employees registered in this organization
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.filter(employee => employee.role === 'EMPLOYEE').map((employee) => (
              <Card key={employee.id} className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-medium">
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{employee.name}</h4>
                    <p className="text-xs text-muted-foreground">{employee.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getRoleColor(employee.role)} variant="secondary">
                        {employee.role}
                      </Badge>
                      <Badge className={getStatusColor(employee.status)} variant="secondary">
                        {employee.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Joined: {new Date(employee.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            ))}
          </div>
          
          {employees.filter(emp => emp.role === 'EMPLOYEE').length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">No employees yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Employees will appear here once they join the organization.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}