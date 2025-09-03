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
import { 
  Plus, 
  Edit, 
  Eye, 
  Archive, 
  Star, 
  Clock, 
  DollarSign,
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
}

interface ProgramManagerProps {
  searchTerm: string;
  category: string;
}

export const ProgramManager = ({ searchTerm, category }: ProgramManagerProps) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'course',
    level: 'Beginner',
    duration: '',
    price: 0,
    tags: '',
    thumbnail_url: '',
    content_url: '',
    is_active: true
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
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
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
      }

      setFormData({
        title: '',
        description: '',
        category: 'course',
        level: 'Beginner',
        duration: '',
        price: 0,
        tags: '',
        thumbnail_url: '',
        content_url: '',
        is_active: true
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
      is_active: program.is_active
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Programs & Courses</h2>
          <p className="text-sm text-muted-foreground">
            Manage educational programs and courses
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="col-span-2">
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
                      <SelectItem value="course">Course</SelectItem>
                      <SelectItem value="coaching">Coaching</SelectItem>
                      <SelectItem value="tool">Tool</SelectItem>
                      <SelectItem value="webinar">Webinar</SelectItem>
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

                <div className="col-span-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="investing, beginner, portfolio"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                  <Input
                    id="thumbnail_url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="content_url">Content URL</Label>
                  <Input
                    id="content_url"
                    value={formData.content_url}
                    onChange={(e) => setFormData({...formData, content_url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>

                <div className="col-span-2 flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingProgram(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProgram ? 'Update' : 'Create'} Program
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map((program) => (
          <Card key={program.id} className={`${!program.is_active ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight">{program.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{program.category}</Badge>
                    <Badge variant="secondary">{program.level}</Badge>
                    {!program.is_active && (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {program.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{program.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>₹{(program.price / 100).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{program.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{program.students}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {program.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {program.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{program.tags.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(program)}
                  className="flex-1 gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant={program.is_active ? "destructive" : "default"}
                  onClick={() => toggleActive(program)}
                  className="flex-1 gap-1"
                >
                  <Archive className="h-3 w-3" />
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