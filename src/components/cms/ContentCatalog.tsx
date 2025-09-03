import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  BookOpen, 
  Video, 
  Calendar, 
  Calculator,
  Plus,
  Search,
  Filter,
  Tag,
  Users,
  Clock,
  DollarSign,
  Edit,
  Eye,
  Archive
} from 'lucide-react';
import { ProgramManager } from './ProgramManager';
import { WebinarManager } from './WebinarManager';
import { CoachingOfferingsManager } from './CoachingOfferingsManager';
import { ToolsManager } from './ToolsManager';
import { ContentAssetManager } from './ContentAssetManager';

interface ContentStats {
  programs: number;
  webinars: number;
  offerings: number;
  tools: number;
  assets: number;
}

export const ContentCatalog = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState<ContentStats>({
    programs: 0,
    webinars: 0,
    offerings: 0,
    tools: 0,
    assets: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContentStats();
  }, []);

  const fetchContentStats = async () => {
    try {
      const [programsCount, webinarsCount, offeringsCount, toolsCount, assetsCount] = 
        await Promise.all([
          supabase.from('individual_programs').select('*', { count: 'exact', head: true }),
          supabase.from('webinars').select('*', { count: 'exact', head: true }),
          supabase.from('coaching_offerings').select('*', { count: 'exact', head: true }),
          supabase.from('financial_tools').select('*', { count: 'exact', head: true }),
          supabase.from('content_assets').select('*', { count: 'exact', head: true })
        ]);

      setStats({
        programs: programsCount.count || 0,
        webinars: webinarsCount.count || 0,
        offerings: offeringsCount.count || 0,
        tools: toolsCount.count || 0,
        assets: assetsCount.count || 0
      });
    } catch (error) {
      console.error('Error fetching content stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const contentStats = [
    {
      title: 'Programs & Courses',
      value: stats.programs.toString(),
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Webinars',
      value: stats.webinars.toString(),
      icon: Video,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Coaching Offerings',
      value: stats.offerings.toString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Financial Tools',
      value: stats.tools.toString(),
      icon: Calculator,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading content catalog...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Content Catalog & CMS</h1>
          <p className="text-muted-foreground">
            Manage courses, webinars, coaching offerings, and financial tools
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {userProfile?.role === 'ADMIN' ? 'Super Admin' : 'Content Manager'}
          </Badge>
        </div>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {contentStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search content by title, tags, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="investing">Investing</SelectItem>
                <SelectItem value="tax">Tax Planning</SelectItem>
                <SelectItem value="budgeting">Budgeting</SelectItem>
                <SelectItem value="debt">Debt Management</SelectItem>
                <SelectItem value="retirement">Retirement</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Management Tabs */}
      <Tabs defaultValue="programs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="programs" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Programs
          </TabsTrigger>
          <TabsTrigger value="webinars" className="gap-2">
            <Video className="h-4 w-4" />
            Webinars
          </TabsTrigger>
          <TabsTrigger value="offerings" className="gap-2">
            <Users className="h-4 w-4" />
            Coaching
          </TabsTrigger>
          <TabsTrigger value="tools" className="gap-2">
            <Calculator className="h-4 w-4" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="assets" className="gap-2">
            <Tag className="h-4 w-4" />
            Assets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="programs">
          <ProgramManager searchTerm={searchTerm} category={selectedCategory} />
        </TabsContent>

        <TabsContent value="webinars">
          <WebinarManager searchTerm={searchTerm} category={selectedCategory} />
        </TabsContent>

        <TabsContent value="offerings">
          <CoachingOfferingsManager searchTerm={searchTerm} category={selectedCategory} />
        </TabsContent>

        <TabsContent value="tools">
          <ToolsManager searchTerm={searchTerm} category={selectedCategory} />
        </TabsContent>

        <TabsContent value="assets">
          <ContentAssetManager searchTerm={searchTerm} category={selectedCategory} />
        </TabsContent>
      </Tabs>
    </div>
  );
};