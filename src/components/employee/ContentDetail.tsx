import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Tag, ExternalLink, FileText, Play, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  duration: string | null;
  category: string | null;
  tags: string[] | null;
  type: 'blog' | 'video' | 'pdf' | 'link';
  content_url: string | null;
  created_at: string;
  updated_at: string;
}

export const ContentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const mockContent: Record<string, ContentItem> = {
    '1': {
      id: '1',
      title: 'Financial Fitness Bootcamp',
      description: 'Complete guide to personal financial management and budgeting strategies. This comprehensive course covers everything from basic budgeting principles to advanced investment strategies. Learn how to take control of your finances, build wealth, and secure your financial future.',
      thumbnail: null,
      duration: '4 weeks',
      category: 'Personal Finance',
      tags: ['budgeting', 'finance', 'planning'],
      type: 'video',
      content_url: 'https://example.com/financial-fitness',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    '2': {
      id: '2',
      title: 'Investment Mastery Series',
      description: 'Learn the fundamentals of investing in stocks, bonds, and mutual funds. This series provides in-depth coverage of investment principles, risk management, and portfolio construction strategies.',
      thumbnail: null,
      duration: '1 hour',
      category: 'Investments',
      tags: ['investing', 'stocks', 'portfolio'],
      type: 'video',
      content_url: 'https://example.com/investment-mastery',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };

  useEffect(() => {
    const fetchContent = async () => {
      if (!id) return;
      
      try {
        // Try to fetch from database first
        const { data, error } = await supabase
          .from('content_library' as any)
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          setContent(data as unknown as ContentItem);
        } else {
          // Fall back to mock data
          const mockItem = mockContent[id];
          if (mockItem) {
            setContent(mockItem);
          }
        }
      } catch (error) {
        // Database error, use mock data
        const mockItem = mockContent[id];
        if (mockItem) {
          setContent(mockItem);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return FileText;
      case 'video': return Play;
      case 'pdf': return Download;
      case 'link': return ExternalLink;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blog': return 'text-blue-600 bg-blue-100';
      case 'video': return 'text-red-600 bg-red-100';
      case 'pdf': return 'text-green-600 bg-green-100';
      case 'link': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleOpenContent = () => {
    if (content?.content_url) {
      window.open(content.content_url, '_blank');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading content...</div>;
  }

  if (!content) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-8">Content not found</div>
      </div>
    );
  }

  const TypeIcon = getTypeIcon(content.type);

  // Blog-specific layout
  if (content.type === 'blog') {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Content Library
        </Button>

        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={getTypeColor(content.type)}>
                <TypeIcon className="h-3 w-3 mr-1" />
                {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
              </Badge>
              {content.category && (
                <Badge variant="secondary">{content.category}</Badge>
              )}
              {content.duration && (
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {content.duration}
                </Badge>
              )}
            </div>

            {content.tags && content.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {content.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <Tag className="h-2 w-2 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="text-sm text-muted-foreground mb-6">
              Published on {new Date(content.created_at).toLocaleDateString()}
              {content.updated_at !== content.created_at && (
                <span> • Updated on {new Date(content.updated_at).toLocaleDateString()}</span>
              )}
            </div>
          </header>

          {content.thumbnail && (
            <div className="mb-8">
              <img
                src={content.thumbnail}
                alt={content.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            {content.description && (
              <div className="text-foreground leading-relaxed whitespace-pre-line text-base">
                {content.description}
              </div>
            )}
          </div>

          {content.content_url && (
            <div className="mt-8 pt-6 border-t">
              <Button onClick={handleOpenContent} size="lg">
                <ExternalLink className="h-4 w-4 mr-2" />
                Read Full Article
              </Button>
            </div>
          )}
        </article>
      </div>
    );
  }

  // Default layout for other content types
  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Content Library
      </Button>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-start gap-4">
            {content.thumbnail && (
              <img
                src={content.thumbnail}
                alt={content.title}
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{content.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={getTypeColor(content.type)}>
                  <TypeIcon className="h-3 w-3 mr-1" />
                  {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                </Badge>
                {content.category && (
                  <Badge variant="secondary">{content.category}</Badge>
                )}
                {content.duration && (
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {content.duration}
                  </Badge>
                )}
              </div>
              {content.tags && content.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {content.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="h-2 w-2 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {content.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {content.description}
              </p>
            </div>
          )}

          {content.content_url && (
            <div className="flex gap-2">
              <Button onClick={handleOpenContent} className="flex-1 sm:flex-initial">
                <TypeIcon className="h-4 w-4 mr-2" />
                {content.type === 'video' && 'Watch Video'}
                {content.type === 'pdf' && 'Download PDF'}
                {content.type === 'link' && 'Open Link'}
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Added on {new Date(content.created_at).toLocaleDateString()}
            {content.updated_at !== content.created_at && (
              <span> • Updated on {new Date(content.updated_at).toLocaleDateString()}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};