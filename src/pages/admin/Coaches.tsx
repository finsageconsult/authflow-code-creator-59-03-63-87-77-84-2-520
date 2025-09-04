import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Mail, Search, UserCheck, Clock, BookOpen, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Coach {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  auth_id?: string;
  avatar_url?: string;
  organization_id?: string;
  updated_at: string;
  coaching_offerings?: {
    id: string;
    title: string;
    category: string;
    credits_needed: number;
    is_active: boolean;
  }[];
  coaching_sessions?: {
    id: string;
    status: string;
  }[];
  coach_availability?: {
    id: string;
    is_available: boolean;
  }[];
}

export default function Coaches() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateCodeDialog, setShowCreateCodeDialog] = useState(false);
  const [newCode, setNewCode] = useState({
    email: '',
    expiresIn: '7'
  });

  useEffect(() => {
    if (userProfile?.role === 'ADMIN') {
      fetchCoaches();
    }
  }, [userProfile]);

  const fetchCoaches = async () => {
    try {
      // Fetch coaches with their detailed information
      const { data: coachesData, error: coachesError } = await supabase
        .from('users')
        .select(
          `*,
          coaching_offerings(id, title, category, credits_needed, is_active),
          coaching_sessions(id, status),
          coach_availability(id, is_available)`
        )
        .eq('role', 'COACH')
        .order('created_at', { ascending: false });

      if (coachesError) throw coachesError;
      setCoaches((coachesData as any) || []);
    } catch (error) {
      console.error('Error fetching coaches:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch coaches',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCoachAccessCode = async () => {
    try {
      const code = Math.random().toString(36).substring(2, 12).toUpperCase();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(newCode.expiresIn));

      // Use edge function to create access code
      const { data: codeData, error: codeError } = await supabase.functions.invoke('create-access-code', {
        body: {
          code,
          organization_id: null, // Coaches are not tied to organizations
          role: 'COACH',
          expires_at: expiresAt.toISOString(),
          max_uses: 1,
          email: newCode.email
        }
      });

      if (codeError) throw codeError;

      // Send email via edge function
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-access-code', {
        body: {
          email: newCode.email,
          code,
          role: 'COACH',
          organizationName: null,
          expiresAt: expiresAt.toISOString()
        }
      });

      if (emailError) {
        console.error('Email error:', emailError);
        toast({
          title: 'Warning',
          description: 'Access code created but email failed to send.',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Success',
          description: 'Coach access code created and email sent successfully'
        });
      }

      setShowCreateCodeDialog(false);
      setNewCode({ email: '', expiresIn: '7' });
    } catch (error) {
      console.error('Error creating coach access code:', error);
      toast({
        title: 'Error',
        description: 'Failed to create coach access code',
        variant: 'destructive'
      });
    }
  };

  // Helper function to count completed sessions
  const getCompletedSessions = (sessions: any[]) => {
    if (!sessions || sessions.length === 0) return 0;
    return sessions.filter(session => session.status === 'completed').length;
  };

  // Helper function to get active offerings count
  const getActiveOfferings = (offerings: any[]) => {
    if (!offerings || offerings.length === 0) return 0;
    return offerings.filter(offering => offering.is_active).length;
  };

  // Helper function to check availability
  const isAvailable = (availability: any[]) => {
    if (!availability || availability.length === 0) return false;
    return availability.some(avail => avail.is_available);
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

  const filteredCoaches = coaches.filter(coach =>
    coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coach Management</h1>
          <p className="text-muted-foreground">Manage coaches and create access codes</p>
        </div>
        <Button onClick={() => setShowCreateCodeDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Coach Code
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Coaches</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{coaches.length}</div>
        </CardContent>
      </Card>

      {/* Search and Coaches Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Coaches</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coaches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coach Profile</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Offerings</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoaches.map((coach) => (
                <TableRow key={coach.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={coach.avatar_url} alt={coach.name} />
                        <AvatarFallback>
                          {coach.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{coach.name}</div>
                        <div className="text-sm text-muted-foreground">Coach</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{coach.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {getActiveOfferings(coach.coaching_offerings)}
                      </span>
                      <span className="text-xs text-muted-foreground">active</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {getCompletedSessions(coach.coaching_sessions)}
                      </span>
                      <span className="text-xs text-muted-foreground">completed</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Badge variant={isAvailable(coach.coach_availability) ? "default" : "secondary"}>
                        {isAvailable(coach.coach_availability) ? "Available" : "Busy"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(coach.status)}>
                      {coach.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(coach.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
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
            <DialogTitle>Generate Coach Access Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create an access code for a coach to join the platform. The code will be valid for the selected duration.
            </p>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={newCode.email}
                onChange={(e) => setNewCode({ ...newCode, email: e.target.value })}
                placeholder="Enter coach's email"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateCodeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={generateCoachAccessCode} disabled={!newCode.email}>
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