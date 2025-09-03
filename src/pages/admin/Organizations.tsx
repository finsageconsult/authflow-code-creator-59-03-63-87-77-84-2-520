import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, Users, Calendar, TrendingUp } from 'lucide-react';
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
  const [newOrg, setNewOrg] = useState({
    name: '',
    plan: 'STARTER'
  });

  useEffect(() => {
    if (userProfile?.role === 'ADMIN') {
      fetchOrganizations();
    }
  }, [userProfile]);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          *,
          org_plans (
            plan_type,
            credit_allotment_1on1,
            credit_allotment_webinar
          )
        `)
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

  const createOrganization = async () => {
    try {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: newOrg.name,
          plan: 'BASIC',
          status: 'ACTIVE'
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create org plan
      const creditAllotments = {
        STARTER: { oneon1: 5, webinar: 2 },
        GROWTH: { oneon1: 20, webinar: 10 },
        ENTERPRISE: { oneon1: 50, webinar: 25 }
      };

      const { error: planError } = await supabase
        .from('org_plans')
        .insert({
          organization_id: orgData.id,
          plan_type: newOrg.plan,
          credit_allotment_1on1: creditAllotments[newOrg.plan as keyof typeof creditAllotments].oneon1,
          credit_allotment_webinar: creditAllotments[newOrg.plan as keyof typeof creditAllotments].webinar
        });

      if (planError) throw planError;

      toast({
        title: 'Success',
        description: 'Organization created successfully'
      });

      setShowCreateDialog(false);
      setNewOrg({ name: '', plan: 'STARTER' });
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

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'starter':
        return 'bg-blue-100 text-blue-800';
      case 'growth':
        return 'bg-purple-100 text-purple-800';
      case 'enterprise':
        return 'bg-orange-100 text-orange-800';
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
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

        <Card className="sm:col-span-2 lg:col-span-1">
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
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Credits (1:1 / Webinar)</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">{org.name}</TableCell>
                        <TableCell>
                          <Badge className={getPlanColor(org.org_plans?.plan_type || '')}>
                            {org.org_plans?.plan_type || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(org.status)}>
                            {org.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {org.org_plans 
                            ? `${org.org_plans.credit_allotment_1on1} / ${org.org_plans.credit_allotment_webinar}`
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          {new Date(org.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/admin/organizations/${org.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
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
                            Created {new Date(org.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/admin/organizations/${org.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Plan</Label>
                          <div className="mt-1">
                            <Badge className={getPlanColor(org.org_plans?.plan_type || '')}>
                              {org.org_plans?.plan_type || 'N/A'}
                            </Badge>
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
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">Credits (1:1 / Webinar)</Label>
                        <p className="text-sm font-medium mt-1">
                          {org.org_plans 
                            ? `${org.org_plans.credit_allotment_1on1} / ${org.org_plans.credit_allotment_webinar}`
                            : 'N/A'
                          }
                        </p>
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
              <Label htmlFor="plan">Plan</Label>
              <Select value={newOrg.plan} onValueChange={(value) => setNewOrg({ ...newOrg, plan: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STARTER">Starter (5 1:1, 2 Webinar)</SelectItem>
                  <SelectItem value="GROWTH">Growth (20 1:1, 10 Webinar)</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise (50 1:1, 25 Webinar)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createOrganization} disabled={!newOrg.name}>
                Create Organization
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}