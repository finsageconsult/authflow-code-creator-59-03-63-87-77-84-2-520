import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, FileText, Clock, Tag, X, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BlogParagraph {
  heading: string;
  body: string;
}

interface BlogItem {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  duration: string | null;
  category: string | null;
  tags: string[] | null;
  paragraphs: BlogParagraph[];
  created_at: string;
  updated_at: string;
}

interface BlogFormData {
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  category: string;
  tags: string;
  paragraphs: BlogParagraph[];
}

export const BlogManager = () => {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewBlog, setPreviewBlog] = useState<BlogItem | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    description: '',
    thumbnail: '',
    duration: '',
    category: '',
    tags: '',
    paragraphs: [{ heading: '', body: '' }]
  });
  const { toast } = useToast();

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs((data || []).map((item: any) => ({
        ...item,
        paragraphs: (() => {
          try {
            // If paragraphs is a string, parse it as JSON
            if (typeof item.paragraphs === 'string') {
              return JSON.parse(item.paragraphs) as BlogParagraph[];
            }
            // If it's already an array, use it directly
            if (Array.isArray(item.paragraphs)) {
              return item.paragraphs as BlogParagraph[];
            }
            // Default fallback
            return [];
          } catch (error) {
            console.error('Error parsing paragraphs for blog:', item.id, error);
            return [];
          }
        })()
      })) as BlogItem[]);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch blogs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handlePreview = (blog: BlogItem) => {
    setPreviewBlog(blog);
    setIsPreviewOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      thumbnail: '',
      duration: '',
      category: '',
      tags: '',
      paragraphs: [{ heading: '', body: '' }]
    });
    setEditingBlog(null);
  };

  const addParagraph = () => {
    setFormData({
      ...formData,
      paragraphs: [...formData.paragraphs, { heading: '', body: '' }]
    });
  };

  const removeParagraph = (index: number) => {
    if (formData.paragraphs.length > 1) {
      setFormData({
        ...formData,
        paragraphs: formData.paragraphs.filter((_, i) => i !== index)
      });
    }
  };

  const updateParagraph = (index: number, field: 'heading' | 'body', value: string) => {
    const updatedParagraphs = formData.paragraphs.map((para, i) => 
      i === index ? { ...para, [field]: value } : para
    );
    setFormData({ ...formData, paragraphs: updatedParagraphs });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const blogData = {
        title: formData.title,
        description: formData.description || null,
        thumbnail: formData.thumbnail || null,
        duration: formData.duration || null,
        category: formData.category || null,
        tags: tagsArray,
        paragraphs: JSON.stringify(formData.paragraphs.filter(p => p.heading || p.body))
      };

      if (editingBlog) {
        const { error } = await supabase
          .from('blog_library')
          .update(blogData)
          .eq('id', editingBlog.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Blog updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('blog_library')
          .insert([blogData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Blog created successfully"
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
      toast({
        title: "Error",
        description: "Failed to save blog",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (blog: BlogItem) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      description: blog.description || '',
      thumbnail: blog.thumbnail || '',
      duration: blog.duration || '',
      category: blog.category || '',
      tags: blog.tags?.join(', ') || '',
      paragraphs: blog.paragraphs && blog.paragraphs.length > 0 ? 
        blog.paragraphs : [{ heading: '', body: '' }]
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      const { error } = await supabase
        .from('blog_library')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Blog deleted successfully"
      });
      
      fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast({
        title: "Error",
        description: "Failed to delete blog",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading blogs...</div>;
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Blog Management</h2>
          <p className="text-sm md:text-base text-muted-foreground">Create and manage blog articles for employees</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Blog
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-3 md:mx-0">
            <DialogHeader>
              <DialogTitle className="text-lg">
                {editingBlog ? 'Edit Blog' : 'Create New Blog'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (e.g., 5 min read)</label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="5 min read"
                    className="text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Short Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Brief summary of the blog article"
                  className="text-sm"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Personal Finance, Investments"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags (comma-separated)</label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., budgeting, planning, investing"
                    className="text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Cover Image URL</label>
                <Input
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://..."
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <label className="text-sm font-medium">Blog Content (Paragraphs)</label>
                  <Button type="button" variant="outline" size="sm" onClick={addParagraph} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Section
                  </Button>
                </div>
                
                {formData.paragraphs.map((paragraph, index) => (
                  <Card key={index} className="p-3 md:p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-sm">Section {index + 1}</h4>
                      {formData.paragraphs.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeParagraph(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <Input
                        placeholder="Section heading (optional)"
                        value={paragraph.heading}
                        onChange={(e) => updateParagraph(index, 'heading', e.target.value)}
                        className="text-sm"
                      />
                      <Textarea
                        placeholder="Section content"
                        value={paragraph.body}
                        onChange={(e) => updateParagraph(index, 'body', e.target.value)}
                        rows={4}
                        className="text-sm"
                      />
                    </div>
                  </Card>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  {editingBlog ? 'Update Blog' : 'Create Blog'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">All Blogs ({blogs.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-3">
            {blogs.map((blog) => (
              <Card key={blog.id} className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-sm">{blog.title}</h3>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => handlePreview(blog)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(blog)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(blog.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>Category: {blog.category}</div>
                  <div>Duration: {blog.duration}</div>
                  <div>Created: {new Date(blog.created_at).toLocaleDateString()}</div>
                  <div>Tags: {blog.tags?.length || 0}</div>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogs.map((blog) => (
                  <TableRow key={blog.id}>
                    <TableCell className="font-medium">{blog.title}</TableCell>
                    <TableCell>{blog.category}</TableCell>
                    <TableCell>
                      {blog.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {blog.duration}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {blog.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Tag className="h-2 w-2 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {blog.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{blog.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(blog.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => handlePreview(blog)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(blog)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(blog.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {blogs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-8 w-8 md:h-12 md:w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm md:text-base text-muted-foreground">No blogs found. Create your first blog article.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blog Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Blog Preview
            </DialogTitle>
          </DialogHeader>
          
          {previewBlog && (
            <div className="space-y-6">
              {/* Blog Header */}
              <div className="space-y-4">
                {previewBlog.thumbnail && (
                  <img 
                    src={previewBlog.thumbnail} 
                    alt={previewBlog.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold mb-2">{previewBlog.title}</h1>
                  {previewBlog.description && (
                    <p className="text-lg text-muted-foreground mb-4">{previewBlog.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {previewBlog.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {previewBlog.duration}
                      </div>
                    )}
                    {previewBlog.category && (
                      <Badge variant="secondary">{previewBlog.category}</Badge>
                    )}
                    {previewBlog.tags && previewBlog.tags.length > 0 && (
                      <div className="flex gap-1">
                        {previewBlog.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Blog Content */}
              <div className="space-y-6">
                {previewBlog.paragraphs && previewBlog.paragraphs.length > 0 ? (
                  previewBlog.paragraphs.map((paragraph, index) => (
                    <div key={index} className="space-y-2">
                      {paragraph.heading && (
                        <h2 className="text-xl font-semibold">{paragraph.heading}</h2>
                      )}
                      {paragraph.body && (
                        <p className="text-base leading-relaxed whitespace-pre-wrap">
                          {paragraph.body}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">No content available.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};