import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Video, 
  Users, 
  Wrench, 
  Search, 
  Filter,
  Plus,
  FileText,
  Download,
  MoreHorizontal,
  Settings
} from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  type: 'program' | 'webinar' | 'coaching' | 'tool' | 'asset';
  category: string;
  status: 'active' | 'draft' | 'archived';
  lastUpdated: string;
  usage: number;
  rating?: number;
}

export const ContentCatalog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('programs');

  // Mock data for content items
  const contentItems: ContentItem[] = [
    {
      id: '1',
      title: 'Emergency Fund Masterclass',
      type: 'program',
      category: 'Financial Planning',
      status: 'active',
      lastUpdated: '2 days ago',
      usage: 145,
      rating: 4.8
    },
    {
      id: '2',
      title: 'Investment Basics Webinar',
      type: 'webinar',
      category: 'Investing',
      status: 'active',
      lastUpdated: '1 week ago',
      usage: 89,
      rating: 4.6
    },
    {
      id: '3',
      title: 'Debt Payoff Calculator',
      type: 'tool',
      category: 'Debt Management',
      status: 'active',
      lastUpdated: '3 days ago',
      usage: 234
    },
    {
      id: '4',
      title: '1-on-1 Financial Planning',
      type: 'coaching',
      category: 'Personal Finance',
      status: 'active',
      lastUpdated: '1 day ago',
      usage: 67,
      rating: 4.9
    },
    {
      id: '5',
      title: 'Budget Template Pack',
      type: 'asset',
      category: 'Budgeting',
      status: 'active',
      lastUpdated: '5 days ago',
      usage: 178
    }
  ];

  const stats = [
    { title: 'Programs & Courses', count: 6, icon: BookOpen, color: 'text-blue-600' },
    { title: 'Webinars', count: 0, icon: Video, color: 'text-green-600' },
    { title: 'Coaching Offerings', count: 5, icon: Users, color: 'text-purple-600' },
    { title: 'Financial Tools', count: 6, icon: Wrench, color: 'text-orange-600' }
  ];

  const tabs = [
    { id: 'programs', label: 'Programs', icon: BookOpen },
    { id: 'webinars', label: 'Webinars', icon: Video },
    { id: 'coaching', label: 'Coaching', icon: Users },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'assets', label: 'Assets', icon: FileText }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'program': return BookOpen;
      case 'webinar': return Video;
      case 'coaching': return Users;
      case 'tool': return Wrench;
      case 'asset': return FileText;
      default: return FileText;
    }
  };

  const filteredItems = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    return matchesSearch && matchesCategory && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Content Catalog & CMS</h2>
          <p className="text-muted-foreground">
            Manage courses, webinars, coaching offerings, and financial tools
          </p>
        </div>
        <Button className="w-fit">
          <Plus className="w-4 h-4 mr-2" />
          Content Manager
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.count}</div>
                  <div className="text-sm text-muted-foreground">{stat.title}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
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
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Financial Planning">Financial Planning</SelectItem>
                <SelectItem value="Investing">Investing</SelectItem>
                <SelectItem value="Debt Management">Debt Management</SelectItem>
                <SelectItem value="Budgeting">Budgeting</SelectItem>
                <SelectItem value="Personal Finance">Personal Finance</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <div className="flex flex-wrap gap-2 border-b">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2"
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Content List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} & Courses
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage educational programs and courses
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No content found matching your criteria
              </div>
            ) : (
              filteredItems.map((item) => {
                const TypeIcon = getTypeIcon(item.type);
                return (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 rounded-lg bg-muted">
                        <TypeIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium">{item.usage} users</div>
                        <div className="text-xs text-muted-foreground">
                          Updated {item.lastUpdated}
                        </div>
                        {item.rating && (
                          <div className="text-xs text-yellow-600">
                            ★ {item.rating}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {filteredItems.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {filteredItems.length} of {contentItems.length} items
              </div>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Program
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};