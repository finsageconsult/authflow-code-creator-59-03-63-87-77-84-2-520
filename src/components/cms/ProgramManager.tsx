import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Eye, 
  Archive, 
  Star, 
  Clock, 
  CreditCard,
  Tag,
  Users,
  BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Program {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  price: number;
  rating: number;
  students: number;
  tags: string[];
  is_active: boolean;
  thumbnail_url?: string;
  content_url?: string;
  course_type?: string;
}

interface ProgramManagerProps {
  searchTerm: string;
  category: string;
}

export const ProgramManager = ({ searchTerm, category }: ProgramManagerProps) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '1-1-sessions',
    level: 'Beginner',
    duration: '',
    price: 0,
    tags: '',
    thumbnail_url: '',
    content_url: '',
    is_active: true,
    course_type: 'individual'
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      let query = supabase
        .from('individual_programs')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch programs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const programData = {
        ...formData,
        price: formData.price * 100, // Convert to paise
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        course_type: formData.course_type
      };

      if (editingProgram) {
        const { error } = await supabase
          .from('individual_programs')
          .update(programData)
          .eq('id', editingProgram.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Program updated successfully'
        });
      } else {
        const { error } = await supabase
          .from('individual_programs')
          .insert([programData]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Program created successfully'
        });

        // Navigate based on course type
        if (formData.course_type === 'hr-dashboard') {
          navigate('/hr-dashboard');
        } else if (formData.course_type === 'individual') {
          navigate('/individual-dashboard');
        }
      }

      setFormData({
        title: '',
        description: '',
        category: '1-1-sessions',
        level: 'Beginner',
        duration: '',
        price: 0,
        tags: '',
        thumbnail_url: '',
        content_url: '',
        is_active: true,
        course_type: 'individual'
      });
      setEditingProgram(null);
      setIsCreateDialogOpen(false);
      fetchPrograms();
    } catch (error) {
      console.error('Error saving program:', error);
      toast({
        title: 'Error',
        description: 'Failed to save program',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      title: program.title,
      description: program.description || '',
      category: program.category,
      level: program.level,
      duration: program.duration,
      price: program.price / 100, // Convert from paise
      tags: program.tags.join(', '),
      thumbnail_url: program.thumbnail_url || '',
      content_url: program.content_url || '',
      is_active: program.is_active,
      course_type: program.course_type || 'individual'
    });
    setIsCreateDialogOpen(true);
  };

  const toggleActive = async (program: Program) => {
    try {
      const { error } = await supabase
        .from('individual_programs')
        .update({ is_active: !program.is_active })
        .eq('id', program.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Program ${!program.is_active ? 'activated' : 'deactivated'}`
      });

      fetchPrograms();
    } catch (error) {
      console.error('Error toggling program status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update program status',
        variant: 'destructive'
      });
    }
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = category === 'all' || program.category === category;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading programs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Programs & Courses</h2>
          <p className="text-sm text-muted-foreground">
            Manage educational programs and courses
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Create Program
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProgram ? 'Edit Program' : 'Create New Program'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-1-sessions">1:1 Sessions</SelectItem>
                      <SelectItem value="short-program">Short Program</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                 <div>
                   <Label htmlFor="level">Level</Label>
                   <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                     <SelectTrigger>
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="Beginner">Beginner</SelectItem>
                       <SelectItem value="Intermediate">Intermediate</SelectItem>
                       <SelectItem value="Advanced">Advanced</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>

                 {formData.category === '1-1-sessions' && (
                   <div>
                     <Label htmlFor="course_type">Course Type</Label>
                     <Select value={formData.course_type} onValueChange={(value) => setFormData({...formData, course_type: value})}>
                       <SelectTrigger>
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="individual">Individual</SelectItem>
                         <SelectItem value="hr-dashboard">HR Dashboard</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                 )}

                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g., 3 hours, 2 weeks"
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="investing, beginner, portfolio"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                  <Input
                    id="thumbnail_url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="content_url">Content URL</Label>
                  <Input
                    id="content_url"
                    value={formData.content_url}
                    onChange={(e) => setFormData({...formData, content_url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>

                <div className="sm:col-span-2 flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingProgram(null);
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  {editingProgram ? 'Update' : 'Create'} Program
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredPrograms.map((program) => (
          <Card key={program.id} className={`w-full ${!program.is_active ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3 px-4 pt-4">
              <div className="space-y-3">
                <CardTitle className="text-lg leading-tight line-clamp-2 min-h-[3.5rem]">
                  {program.title}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className="text-xs px-2 py-1">{program.category}</Badge>
                  <Badge variant="secondary" className="text-xs px-2 py-1">{program.level}</Badge>
                  {!program.is_active && (
                    <Badge variant="destructive" className="text-xs px-2 py-1">Inactive</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-4">
              <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3.75rem]">
                {program.description}
              </p>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">{program.duration}</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">₹{(program.price / 100).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                  <span className="text-sm">{program.rating}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">{program.students}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {program.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs px-2 py-1">
                    {tag}
                  </Badge>
                ))}
                {program.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    +{program.tags.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(program)}
                  className="w-full gap-2 h-9"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant={program.is_active ? "destructive" : "default"}
                  onClick={() => toggleActive(program)}
                  className="w-full gap-2 h-9"
                >
                  <Archive className="h-4 w-4" />
                  {program.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No programs found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || category !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first program to get started'
            }
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Program
          </Button>
        </div>
      )}
    </div>
  );
};