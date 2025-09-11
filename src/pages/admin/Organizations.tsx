import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, Users, Calendar, TrendingUp, Key, Send, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  domain: string;
  status: string;
  created_at: string;
  _count?: {
    users: number;
  };
}

export default function Organizations() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAccessCodeDialog, setShowAccessCodeDialog] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [accessCodeForm, setAccessCodeForm] = useState({
    email: '',
    role: 'HR'
  });
  const [newOrg, setNewOrg] = useState({
    name: '',
    domain: ''
  });
  const [deletingOrg, setDeletingOrg] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile?.role === 'ADMIN') {
      fetchOrganizations();

      // Set up real-time subscription for organizations
      const channel = supabase
        .channel('admin-organizations-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'organizations'
          },
          (payload) => {
            console.log('Organization change detected:', payload);
            fetchOrganizations(); // Refresh data on any change
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userProfile]);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch organizations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const validateDomain = (domain: string): boolean => {
    // Check if domain starts with @ and has valid format
    const domainRegex = /^@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  const createOrganization = async () => {
    if (!newOrg.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Organization name is required',
        variant: 'destructive'
      });
      return;
    }

    if (!validateDomain(newOrg.domain)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid domain format (e.g., @company.com)',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: newOrg.name,
          domain: newOrg.domain,
          status: 'ACTIVE'
        })
        .select()
        .single();

      if (orgError) throw orgError;

      toast({
        title: 'Success',
        description: 'Organization created successfully'
      });

      setShowCreateDialog(false);
      setNewOrg({ name: '', domain: '' });
      fetchOrganizations();
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: 'Error',
        description: 'Failed to create organization',
        variant: 'destructive'
      });
    }
  };

  const createAccessCode = async () => {
    if (!selectedOrg || !accessCodeForm.email || !accessCodeForm.role) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Generate a unique access code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Set expiry to 30 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error } = await supabase.functions.invoke('create-access-code', {
        body: {
          code,
          organization_id: selectedOrg.id,
          role: accessCodeForm.role,
          expires_at: expiresAt.toISOString(),
          max_uses: 1,
          email: accessCodeForm.email
        }
      });

      if (error) throw error;

      // Send the access code via email  
      const { error: sendError } = await supabase.functions.invoke('send-access-code', {
        body: { email: accessCodeForm.email }
      });

      if (sendError) {
        console.error('Error sending access code email:', sendError);
        // Don't throw error here, code was created successfully
      }

      toast({
        title: 'Success',
        description: `Access code created and sent to ${accessCodeForm.email}`
      });

      setShowAccessCodeDialog(false);
      setAccessCodeForm({ email: '', role: 'HR' });
      setSelectedOrg(null);
    } catch (error) {
      console.error('Error creating access code:', error);
      toast({
        title: 'Error',
        description: 'Failed to create access code',
        variant: 'destructive'
      });
    }
  };

  const deleteOrganization = async (orgId: string, orgName: string) => {
    if (!userProfile?.id) return;

    setDeletingOrg(orgId);
    try {
      // Check for related records that prevent deletion
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('organization_id', orgId)
        .limit(1);

      if (ordersError) throw ordersError;

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .eq('organization_id', orgId)
        .limit(1);

      if (usersError) throw usersError;

      // If there are related records, prevent deletion
      if (orders && orders.length > 0) {
        toast({
          title: "Cannot Delete Organization",
          description: `${orgName} has existing orders and cannot be deleted. Please contact support if you need to remove this organization.`,
          variant: "destructive"
        });
        return;
      }

      if (users && users.length > 0) {
        toast({
          title: "Cannot Delete Organization",
          description: `${orgName} has existing users and cannot be deleted. Please remove all users first or contact support.`,
          variant: "destructive"
        });
        return;
      }

      // Delete the organization (safe to delete now)
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);

      if (error) throw error;

      // Log the deletion activity
      await supabase
        .from('audit_logs')
        .insert({
          action: 'DELETE',
          entity: 'ORGANIZATION',
          entity_id: orgId,
          actor_id: userProfile.id,
          before_data: { name: orgName },
          after_data: null
        });

      toast({
        title: "Organization Deleted",
        description: `${orgName} has been permanently removed from the platform`
      });

      // Real-time update will handle UI refresh
    } catch (error) {
      console.error('Error deleting organization:', error);
      
      // Check if it's a foreign key constraint error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('foreign key constraint') || errorMessage.includes('violates')) {
        toast({
          title: "Cannot Delete Organization",
          description: `${orgName} has related data and cannot be deleted. Please remove all associated users, orders, and other data first.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete organization",
          variant: "destructive"
        });
      }
    } finally {
      setDeletingOrg(null);
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

  if (userProfile?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Access denied. Admin role required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Organizations</h1>
        <Button onClick={() => setShowCreateDialog(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Create Organization
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Organizations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.filter(org => org.status === 'ACTIVE').length}
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.filter(org => 
                new Date(org.created_at).getMonth() === new Date().getMonth()
              ).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : (
            <>
              {/* Desktop Table View - Hidden on mobile */}
              <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email Domain</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {organizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">{org.name}</TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {org.domain}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(org.status)}>
                            {org.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(org.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/admin/organizations/${org.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedOrg(org);
                                setShowAccessCodeDialog(true);
                              }}
                            >
                              <Key className="h-4 w-4 mr-1" />
                              HR Access Code
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  disabled={deletingOrg === org.id}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete <strong>{org.name}</strong>? 
                                    This action cannot be undone and will permanently remove this organization and all its data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteOrganization(org.id, org.name)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {deletingOrg === org.id ? 'Deleting...' : 'Delete Organization'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View - Hidden on desktop */}
              <div className="md:hidden space-y-4">
                {organizations.map((org) => (
                  <Card key={org.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{org.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            <code className="text-xs bg-muted px-2 py-1 rounded">{org.domain}</code>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Created {new Date(org.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/admin/organizations/${org.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedOrg(org);
                              setShowAccessCodeDialog(true);
                            }}
                          >
                            <Key className="h-4 w-4 mr-1" />
                            HR Code
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                disabled={deletingOrg === org.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete <strong>{org.name}</strong>? 
                                  This action cannot be undone and will permanently remove this organization and all its data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteOrganization(org.id, org.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {deletingOrg === org.id ? 'Deleting...' : 'Delete Organization'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Domain</Label>
                          <div className="mt-1">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {org.domain}
                            </code>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Status</Label>
                          <div className="mt-1">
                            <Badge className={getStatusColor(org.status)}>
                              {org.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Organization Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={newOrg.name}
                onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                placeholder="Enter organization name"
              />
            </div>
            <div>
              <Label htmlFor="domain">Organization Email Domain</Label>
              <Input
                id="domain"
                value={newOrg.domain}
                onChange={(e) => setNewOrg({ ...newOrg, domain: e.target.value })}
                placeholder="@company.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the domain format (e.g., @rohitsaw.in). Employees with matching email domains will be automatically linked to this organization.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createOrganization} disabled={!newOrg.name || !newOrg.domain}>
                Create Organization
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Access Code Dialog */}
      <Dialog open={showAccessCodeDialog} onOpenChange={setShowAccessCodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Access Code for {selectedOrg?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create an access code for HR to join this organization. The code will be valid for 30 days.
            </p>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={accessCodeForm.email}
                onChange={(e) => setAccessCodeForm({ ...accessCodeForm, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={accessCodeForm.role} onValueChange={(value) => setAccessCodeForm({ ...accessCodeForm, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HR">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAccessCodeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createAccessCode} disabled={!accessCodeForm.email || !accessCodeForm.role}>
                <Send className="h-4 w-4 mr-2" />
                Create & Send Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}