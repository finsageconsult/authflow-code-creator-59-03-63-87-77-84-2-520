import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, X, Save, Users, BookOpen, Star, Calendar, TrendingUp } from 'lucide-react';
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
  avatar_url?: string;
  specialties?: string[];
  experience?: string;
}

interface CoachStats {
  totalSessions: number;
  completedSessions: number;
  totalBookings: number;
  averageRating: number;
  totalOfferings: number;
  totalEnrollments: number;
}

interface CoachOffering {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  credits_needed: number;
  duration_minutes: number;
  max_participants: number;
  is_active: boolean;
  tags: string[];
}

interface UserEnrollment {
  id: string;
  user_name: string;
  user_email: string;
  offering_title: string;
  status: string;
  enrolled_at: string;
  amount_paid: number;
}

interface AccessCode {
  id: string;
  code: string;
  email: string;
  expires_at: string;
  created_at: string;
  used_count: number;
  max_uses: number;
  role: string;
  organization_id?: string;
}

export default function CoachProfile() {
  const { coachId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [experience, setExperience] = useState('');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<CoachStats | null>(null);
  const [offerings, setOfferings] = useState<CoachOffering[]>([]);
  const [enrollments, setEnrollments] = useState<UserEnrollment[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);

  useEffect(() => {
    if (coachId && userProfile?.role === 'ADMIN') {
      fetchAllCoachData();
    }
  }, [coachId, userProfile]);

  const fetchAllCoachData = async () => {
    try {
      setLoading(true);
      
      // Fetch coach details
      const { data: coachData, error: coachError } = await supabase
        .from('users')
        .select('*')
        .eq('id', coachId)
        .eq('role', 'COACH')
        .single();

      if (coachError) throw coachError;
      
      if (coachData) {
        setCoach(coachData);
        setSpecialties(coachData.specialties || []);
        setSelectedTags(coachData.specialties || []);
        setExperience(coachData.experience || '');
      }

      // Fetch coach offerings
      const { data: offeringsData, error: offeringsError } = await supabase
        .from('coaching_offerings')
        .select('*')
        .eq('coach_id', coachId);

      if (offeringsError) throw offeringsError;
      setOfferings(offeringsData || []);

      // Fetch program tags associated with this coach and automatically set as specialties
      const { data: programsData, error: programsError } = await supabase
        .from('individual_programs')
        .select('tags')
        .eq('is_active', true);

      if (programsError) throw programsError;
      
      // Extract unique tags from all programs
      const allTags = programsData?.flatMap(program => program.tags || []) || [];
      const uniqueTags = [...new Set(allTags)].filter(tag => tag && tag.trim() !== '');
      setAvailableTags(uniqueTags);

      // Fetch comprehensive data for coach analytics
      const [
        sessionsResult,
        bookingsResult,
        enrollmentsResult,
        accessCodesResult,
        usersResult,
        programsResult
      ] = await Promise.all([
        // Fetch coaching sessions
        supabase
          .from('coaching_sessions')
          .select('id, status, scheduled_at, client_id')
          .eq('coach_id', coachId),
        
        // Fetch individual bookings
        supabase
          .from('individual_bookings')
          .select('id, status, scheduled_at, rating, feedback, created_at, user_id, program_id')
          .eq('coach_id', coachId),
        
        // Fetch enrollments
        supabase
          .from('enrollments')
          .select('id, status, enrollment_date, scheduled_at, amount_paid, payment_status, user_id, course_id')
          .eq('coach_id', coachId),
        
        // Fetch access codes - check both by email and by role
        supabase
          .from('access_codes')
          .select('*')
          .or(`email.eq.${coachData.email},role.eq.COACH`)
          .order('created_at', { ascending: false }),
        
        // Fetch all users to map names and emails
        supabase
          .from('users')
          .select('id, name, email'),
        
        // Fetch all programs to map titles and prices
        supabase
          .from('individual_programs')
          .select('id, title, price')
      ]);

      const sessions = sessionsResult.data || [];
      const bookings = bookingsResult.data || [];
      const enrollments = enrollmentsResult.data || [];
      const accessCodes = accessCodesResult.data || [];
      const users = usersResult.data || [];
      const programs = programsResult.data || [];

      // Create lookup maps for users and programs
      const usersMap = new Map(users.map(u => [u.id, u]));
      const programsMap = new Map(programs.map(p => [p.id, p]));

      console.log('Coach data fetched:', {
        sessions: sessions.length,
        bookings: bookings.length,
        enrollments: enrollments.length,
        accessCodes: accessCodes.length,
        users: users.length,
        programs: programs.length
      });

      // Calculate comprehensive statistics
      const totalSessions = sessions.length;
      const completedSessions = sessions.filter(s => s.status === 'completed').length;
      const totalBookings = bookings.length;
      
      // Calculate average rating from bookings
      const ratingsArray = bookings.filter(b => b.rating && b.rating > 0).map(b => b.rating);
      const averageRating = ratingsArray.length > 0 
        ? ratingsArray.reduce((sum, rating) => sum + rating, 0) / ratingsArray.length
        : 0;

      setStats({
        totalSessions,
        completedSessions,
        totalBookings,
        averageRating: Number(averageRating.toFixed(1)),
        totalOfferings: offeringsData?.length || 0,
        totalEnrollments: enrollments.length + bookings.length
      });

      // Format enrollments from both enrollments and bookings tables
      const formattedEnrollments: UserEnrollment[] = [
        // From enrollments table
        ...enrollments.map(e => {
          const user = usersMap.get(e.user_id);
          const program = programsMap.get(e.course_id);
          return {
            id: e.id,
            user_name: user?.name || 'Unknown',
            user_email: user?.email || 'Unknown',
            offering_title: program?.title || 'Program',
            status: e.status,
            enrolled_at: e.enrollment_date || e.scheduled_at,
            amount_paid: e.amount_paid || 0
          };
        }),
        // From bookings table
        ...bookings.map(b => {
          const user = usersMap.get(b.user_id);
          const program = programsMap.get(b.program_id);
          return {
            id: b.id,
            user_name: user?.name || 'Unknown',
            user_email: user?.email || 'Unknown',
            offering_title: program?.title || 'Coaching Session',
            status: b.status,
            enrolled_at: b.scheduled_at || b.created_at,
            amount_paid: program?.price || 0
          };
        })
      ];

      setEnrollments(formattedEnrollments);
      setAccessCodes(accessCodes);

      if (sessionsResult.error) console.error('Sessions error:', sessionsResult.error);
      if (bookingsResult.error) console.error('Bookings error:', bookingsResult.error);
      if (enrollmentsResult.error) console.error('Enrollments error:', enrollmentsResult.error);
      if (accessCodesResult.error) console.error('Access codes error:', accessCodesResult.error);

    } catch (error) {
      console.error('Error fetching coach data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch coach details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter(s => s !== specialty));
  };

  const toggleTagSelection = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const saveSelectedTags = async () => {
    if (!coach) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          specialties: selectedTags,
          experience: experience 
        })
        .eq('id', coach.id);

      if (error) throw error;

      setSpecialties(selectedTags);
      setCoach({ ...coach, specialties: selectedTags, experience: experience });

      toast({
        title: 'Success',
        description: 'Coach profile updated successfully'
      });
    } catch (error) {
      console.error('Error updating coach profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update coach profile',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
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

  if (!coach) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Coach not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/admin/coaches')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Coaches
        </Button>
        <h1 className="text-3xl font-bold">Coach Profile</h1>
      </div>

      {/* Coach Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={coach.avatar_url} alt={coach.name} />
              <AvatarFallback className="text-lg">
                {coach.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{coach.name}</h2>
              <p className="text-muted-foreground">{coach.email}</p>
              <Badge className={coach.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {coach.status}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Joined: {new Date(coach.created_at).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold">
                    {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="specialties" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="specialties">Specialties</TabsTrigger>
          <TabsTrigger value="access-codes">Access Codes</TabsTrigger>
          <TabsTrigger value="enrollments">Students</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="specialties">
          <Card>
            <CardHeader>
              <CardTitle>Select Coach Specialties</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose from available program tags to set as this coach's specialties
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Coach Experience Section */}
              <div className="space-y-2">
                <Label htmlFor="experience">Coach Experience</Label>
                <Input
                  id="experience"
                  type="text"
                  placeholder="e.g., 5+ years in financial coaching, CFA certified"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Describe the coach's experience, qualifications, and expertise
                </p>
              </div>

              {/* Current Selected Specialties */}
              <div className="space-y-2">
                <Label>Current Specialties ({selectedTags.length})</Label>
                <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border rounded-lg bg-muted/20">
                  {selectedTags.map((specialty) => (
                    <Badge 
                      key={specialty} 
                      variant="default" 
                      className="flex items-center gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={() => toggleTagSelection(specialty)}
                    >
                      {specialty}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  {selectedTags.length === 0 && (
                    <p className="text-muted-foreground text-sm">No specialties selected yet</p>
                  )}
                </div>
              </div>

              {/* Available Program Tags Selection */}
              <div className="space-y-2">
                <Label>Available Program Tags (Click to select/deselect)</Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer transition-all hover:scale-105 ${
                        selectedTags.includes(tag) 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-primary/10'
                      }`}
                      onClick={() => toggleTagSelection(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                  {availableTags.length === 0 && (
                    <p className="text-muted-foreground text-sm">No program tags available yet</p>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t">
                <Button 
                  onClick={saveSelectedTags} 
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Selected Specialties'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access-codes">
          <Card>
            <CardHeader>
              <CardTitle>Access Codes</CardTitle>
            </CardHeader>
            <CardContent>
              {accessCodes.length === 0 ? (
                <p className="text-muted-foreground">No access codes found for this coach</p>
              ) : (
                <div className="space-y-4">
                  {accessCodes.map((accessCode) => (
                    <div key={accessCode.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold font-mono text-lg">{accessCode.code}</h3>
                          <p className="text-sm text-muted-foreground">{accessCode.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={accessCode.used_count < accessCode.max_uses ? 'default' : 'secondary'}>
                            {accessCode.used_count}/{accessCode.max_uses} used
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Role: {accessCode.role}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span>{new Date(accessCode.created_at).toLocaleDateString()}</span>
                        </div>
                        {accessCode.organization_id && (
                          <div className="flex justify-between">
                            <span>Organization:</span>
                            <span className="text-xs">{accessCode.organization_id}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollments">
          <Card>
            <CardHeader>
              <CardTitle>Student Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <p className="text-muted-foreground">No enrollments yet</p>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{enrollment.user_name}</h3>
                          <p className="text-sm text-muted-foreground">{enrollment.user_email}</p>
                        </div>
                        <Badge variant="outline">{enrollment.status}</Badge>
                      </div>
                      <div className="text-sm">
                        <p><strong>Program:</strong> {enrollment.offering_title}</p>
                        <p><strong>Enrolled:</strong> {new Date(enrollment.enrolled_at).toLocaleDateString()}</p>
                        <p><strong>Amount Paid:</strong> ₹{(enrollment.amount_paid / 100).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {stats && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Session Performance</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Total Sessions:</span>
                        <span>{stats.totalSessions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed Sessions:</span>
                        <span>{stats.completedSessions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completion Rate:</span>
                        <span>
                          {stats.totalSessions > 0 
                            ? `${((stats.completedSessions / stats.totalSessions) * 100).toFixed(1)}%`
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Student Metrics</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Total Bookings:</span>
                        <span>{stats.totalBookings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Rating:</span>
                        <span>{stats.averageRating > 0 ? `${stats.averageRating}/5` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Enrollments:</span>
                        <span>{stats.totalEnrollments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}