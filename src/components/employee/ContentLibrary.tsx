import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, BookOpen, Video, Calculator } from 'lucide-react';
import { useIndividualPrograms } from '@/hooks/useIndividualPrograms';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const ContentLibrary = () => {
  const { programs, loading, getFilteredPrograms } = useIndividualPrograms();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const getIllustrationBg = (index: number) => {
    const colors = [
      'bg-blue-100',
      'bg-green-100', 
      'bg-purple-100',
      'bg-yellow-100',
      'bg-pink-100',
      'bg-indigo-100'
    ];
    return colors[index % colors.length];
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'short-program':
        return BookOpen;
      case '1-1-sessions':
        return Video;
      default:
        return Calculator;
    }
  };

  const filteredPrograms = getFilteredPrograms(activeTab as any).filter(program => 
    program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Input
          placeholder="Search for content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Content</TabsTrigger>
            <TabsTrigger value="short-program">Programs</TabsTrigger>
            <TabsTrigger value="1-1-sessions">1-on-1 Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPrograms.map((program, index) => {
                const Icon = getIcon(program.category);
                return (
                  <Card 
                    key={program.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow border-0 bg-white"
                  >
                    <CardContent className="p-4">
                      <div className={`${getIllustrationBg(index)} rounded-lg p-6 mb-3 flex items-center justify-center`}>
                        <Icon className="h-12 w-12 text-gray-600" />
                      </div>
                      <h3 className="font-medium text-sm mb-2 line-clamp-2">
                        {program.title}
                      </h3>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">{program.duration}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredPrograms.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No content found matching your search</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};