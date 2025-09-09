import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, FileText, Play, Download, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

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

export const ContentLibrary = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const navigate = useNavigate();

  // Mock data while database is being set up
  const mockContent: ContentItem[] = [
    {
      id: '1',
      title: 'Financial Fitness Bootcamp',
      description: 'Complete guide to personal financial management and budgeting strategies',
      thumbnail: null,
      duration: '4 weeks',
      category: 'Personal Finance',
      tags: ['budgeting', 'finance', 'planning'],
      type: 'video',
      content_url: 'https://example.com/financial-fitness',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Investment Mastery Series',
      description: 'Learn the fundamentals of investing in stocks, bonds, and mutual funds',
      thumbnail: null,
      duration: '1 hour',
      category: 'Investments',
      tags: ['investing', 'stocks', 'portfolio'],
      type: 'video',
      content_url: 'https://example.com/investment-mastery',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Smart Tax Planning',
      description: 'Comprehensive tax planning strategies for individuals and families',
      thumbnail: null,
      duration: '2 weeks',
      category: 'Tax Planning',
      tags: ['tax', 'planning', 'savings'],
      type: 'pdf',
      content_url: 'https://example.com/tax-planning.pdf',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '4',
      title: 'Financial Blueprint Session',
      description: 'One-on-one session to create your personalized financial roadmap',
      thumbnail: null,
      duration: '90 min',
      category: 'Planning',
      tags: ['blueprint', 'planning', 'goals'],
      type: 'video',
      content_url: 'https://example.com/blueprint-session',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const fetchContent = async () => {
    try {
      // Try to fetch from database, fall back to mock data
      try {
        const { data, error } = await supabase
          .from('content_library' as any)
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setContent(data as unknown as ContentItem[]);
        } else {
          setContent(mockContent);
        }
      } catch (dbError) {
        // Database table doesn't exist yet, use mock data
        setContent(mockContent);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      setContent(mockContent);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const getIllustrationBg = (type: string) => {
    switch (type) {
      case 'blog': return 'bg-blue-100';
      case 'video': return 'bg-red-100';
      case 'pdf': return 'bg-green-100';
      case 'link': return 'bg-purple-100';
      default: return 'bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return FileText;
      case 'video': return Play;
      case 'pdf': return Download;
      case 'link': return ExternalLink;
      default: return FileText;
    }
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !filterCategory || item.category === filterCategory;
    const matchesType = !filterType || item.type === filterType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = [...new Set(content.map(item => item.category).filter(Boolean))];
  const types = [...new Set(content.map(item => item.type))];

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading content library...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Content Library</h2>
        <p className="text-muted-foreground">Explore all available learning resources</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search for finance content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category!}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredContent.map((item) => {
            const TypeIcon = getTypeIcon(item.type);
            return (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white overflow-hidden"
                onClick={() => navigate(`/employee-dashboard/content/${item.id}`)}
              >
                <CardContent className="p-0">
                  <div className={`${getIllustrationBg(item.type)} h-40 flex items-center justify-center relative`}>
                    {item.thumbnail ? (
                      <img 
                        src={item.thumbnail} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <TypeIcon className="text-4xl w-12 h-12" />
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">{item.duration || 'N/A'}</span>
                      </div>
                      {item.category && (
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredContent.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No content found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
};