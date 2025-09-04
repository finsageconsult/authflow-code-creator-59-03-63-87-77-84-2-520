import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Mail, Key, Users, Clock } from 'lucide-react';
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

interface AccessCode {
  id: string;
  code: string;
  role: string;
  expires_at: string;
  max_uses: number;
  used_count: number;
  created_at: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  auth_id?: string;
}

export default function OrganizationDetail() {
  const { id } = useParams<{ id: string }>();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateCodeDialog, setShowCreateCodeDialog] = useState(false);
  const [newCode, setNewCode] = useState({
    role: 'HR',
    email: '',
    expiresIn: '7'
  });

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

      // Fetch access codes
      const { data: codesData, error: codesError } = await supabase
        .from('access_codes')
        .select('*')
        .eq('organization_id', id)
        .order('created_at', { ascending: false });

      if (codesError) throw codesError;
      setAccessCodes(codesData || []);

      // Fetch users - no need for email mapping since we collect real emails
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          role,
          status,
          created_at,
          auth_id
        `)
        .eq('organization_id', id)
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

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

  const generateAccessCode = async () => {
    try {
      const code = Math.random().toString(36).substring(2, 12).toUpperCase();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(newCode.expiresIn));

      // Use edge function to create access code with admin privileges
      const { data: codeData, error: codeError } = await supabase.functions.invoke('create-access-code', {
        body: {
          code,
          organization_id: id,
          role: newCode.role,
          expires_at: expiresAt.toISOString(),
          max_uses: 1
        }
      });

      if (codeError) throw codeError;

      // Send email via edge function
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-access-code', {
        body: {
          email: newCode.email,
          code,
          role: newCode.role,
          organizationName: organization?.name,
          expiresAt: expiresAt.toISOString()
        }
      });

      if (emailError) {
        console.error('Email error:', emailError);
        toast({
          title: 'Warning',
          description: 'Access code created but email failed to send. Please verify your domain at resend.com',
          variant: 'default'
        });
      } else if (emailData?.warning) {
        toast({
          title: 'Success',
          description: `Access code created. ${emailData.warning}`,
          variant: 'default'
        });
      } else {
        toast({
          title: 'Success',
          description: 'Access code created and email sent successfully'
        });
      }

      setShowCreateCodeDialog(false);
      setNewCode({ role: 'HR', email: '', expiresIn: '7' });
      fetchOrganizationData();
    } catch (error) {
      console.error('Error creating access code:', error);
      toast({
        title: 'Error',
        description: 'Failed to create access code',
        variant: 'destructive'
      });
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accessCodes.filter(code => 
                new Date(code.expires_at) > new Date() && code.used_count < code.max_uses
              ).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Access Codes Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Access Codes</CardTitle>
          <Button onClick={() => setShowCreateCodeDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Code
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accessCodes.map((code) => {
                const isExpired = new Date(code.expires_at) < new Date();
                const isUsedUp = code.used_count >= code.max_uses;
                const isActive = !isExpired && !isUsedUp;

                return (
                  <TableRow key={code.id}>
                    <TableCell className="font-mono">{code.code}</TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(code.role)}>
                        {code.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{code.used_count}/{code.max_uses}</TableCell>
                    <TableCell>{new Date(code.expires_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={isActive ? 'default' : 'secondary'}>
                        {isActive ? 'Active' : isExpired ? 'Expired' : 'Used'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(code.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Users Section */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Access Code Dialog */}
      <Dialog open={showCreateCodeDialog} onOpenChange={setShowCreateCodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Access Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={newCode.email}
                onChange={(e) => setNewCode({ ...newCode, email: e.target.value })}
                placeholder="Enter recipient's email"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newCode.role} onValueChange={(value) => setNewCode({ ...newCode, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HR">HR Manager</SelectItem>
                  <SelectItem value="COACH">Coach</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expires">Expires In</Label>
              <Select value={newCode.expiresIn} onValueChange={(value) => setNewCode({ ...newCode, expiresIn: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select expiry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateCodeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={generateAccessCode} disabled={!newCode.email}>
                <Mail className="h-4 w-4 mr-2" />
                Generate & Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}