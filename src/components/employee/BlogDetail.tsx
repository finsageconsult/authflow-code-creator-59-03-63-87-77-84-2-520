import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Tag, Calendar, User } from 'lucide-react';
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

export const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('blog_library')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setBlog({
          ...data,
          paragraphs: Array.isArray(data.paragraphs) ? 
            (data.paragraphs as unknown as BlogParagraph[]) : []
        } as BlogItem);
      } catch (error) {
        console.error('Error fetching blog:', error);
        toast({
          title: "Error",
          description: "Failed to load blog article",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading blog article...</div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Blog Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The blog article you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate('/employee-dashboard?tab=content-library')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Content Library
      </Button>

      {/* Article Header */}
      <article className="space-y-6">
        {/* Cover Image */}
        {blog.thumbnail && (
          <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden">
            <img 
              src={blog.thumbnail} 
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title and Meta */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            {blog.title}
          </h1>
          
          {blog.description && (
            <p className="text-lg text-muted-foreground">
              {blog.description}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 py-4 border-y">
            {blog.duration && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{blog.duration}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                Published on {new Date(blog.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            {blog.category && (
              <Badge variant="secondary" className="text-sm">
                {blog.category}
              </Badge>
            )}
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <Tag className="h-2 w-2 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {blog.paragraphs && blog.paragraphs.length > 0 ? (
            blog.paragraphs.map((paragraph, index) => (
              <div key={index} className="mb-8">
                {paragraph.heading && (
                  <h2 className="text-2xl font-semibold mb-4 text-foreground">
                    {paragraph.heading}
                  </h2>
                )}
                {paragraph.body && (
                  <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {paragraph.body}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No content available for this blog article.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-8 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date(blog.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/employee-dashboard?tab=content-library')}
            >
              Browse More Articles
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
};