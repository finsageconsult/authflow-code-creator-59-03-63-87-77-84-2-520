import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Mail, Search, UserCheck, Clock, BookOpen, Calendar, Trash2, Eye } from 'lucide-react';
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
  specialties?: string[];
  experience?: string;
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
  const navigate = useNavigate();
  
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateCodeDialog, setShowCreateCodeDialog] = useState(false);
  const [newCode, setNewCode] = useState({
    email: '',
    expiresIn: '7'
  });
  const [deletingCoach, setDeletingCoach] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile?.role === 'ADMIN') {
      fetchCoaches();

      // Set up real-time subscription for coaches
      const channel = supabase
        .channel('admin-coaches-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'users',
            filter: 'role=eq.COACH'
          },
          (payload) => {
            console.log('Coach change detected:', payload);
            fetchCoaches(); // Refresh data on any change
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userProfile]);

  const fetchCoaches = async () => {
    try {
      // Fetch coaches basic information first
      const { data: coachesData, error: coachesError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'COACH')
        .order('created_at', { ascending: false });

      if (coachesError) throw coachesError;
      
      if (coachesData && coachesData.length > 0) {
        const processedCoaches = await Promise.all(
          coachesData.map(async (coach: any) => {
            // Fetch related data separately to avoid join issues
            const [offeringsResult, sessionsResult, availabilityResult] = await Promise.all([
              supabase
                .from('coaching_offerings')
                .select('id, title, category, credits_needed, is_active')
                .eq('coach_id', coach.id),
              supabase
                .from('coaching_sessions')
                .select('id, status')
                .eq('coach_id', coach.id),
              supabase
                .from('coach_availability')
                .select('id, is_available')
                .eq('coach_id', coach.id)
            ]);
            
            return {
              id: coach.id,
              name: coach.name,
              email: coach.email,
              role: coach.role,
              status: coach.status,
              created_at: coach.created_at,
              auth_id: coach.auth_id,
              avatar_url: coach.avatar_url,
              organization_id: coach.organization_id,
              updated_at: coach.updated_at,
              specialties: coach.specialties || [],
              experience: coach.experience || '',
              coaching_offerings: offeringsResult.data || [],
              coaching_sessions: sessionsResult.data || [],
              coach_availability: availabilityResult.data || []
            };
          })
        );
        setCoaches(processedCoaches);
      } else {
        setCoaches([]);
      }
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

      // Use edge function to create access code with proper null handling
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
          email: newCode.email
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

  const deleteCoach = async (coachId: string, coachName: string) => {
    if (!userProfile?.id) return;

    setDeletingCoach(coachId);
    try {
      // Use edge function to completely delete coach from both users and auth.users tables
      const { data, error } = await supabase.functions.invoke('delete-coach', {
        body: {
          coach_id: coachId,
          admin_user_id: userProfile.id,
          coach_name: coachName
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete coach');
      }

      toast({
        title: "Coach Deleted",
        description: data.message || `${coachName} has been permanently removed from the platform`
      });

      // Real-time update will handle UI refresh
    } catch (error) {
      console.error('Error deleting coach:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete coach",
        variant: "destructive"
      });
    } finally {
      setDeletingCoach(null);
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
                <TableHead>Experience</TableHead>
                <TableHead>Offerings</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
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
                        {coach.specialties && coach.specialties.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {coach.specialties.slice(0, 2).map((specialty, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                            {coach.specialties.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{coach.specialties.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{coach.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {coach.experience ? (
                        <span className="text-foreground">{coach.experience}</span>
                      ) : (
                        <span className="text-muted-foreground italic">Not specified</span>
                      )}
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
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin-dashboard/coaches/${coach.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            disabled={deletingCoach === coach.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Coach</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete <strong>{coach.name}</strong>? 
                              This action cannot be undone and will permanently remove this coach from the platform.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteCoach(coach.id, coach.name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deletingCoach === coach.id ? 'Deleting...' : 'Delete Coach'}
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