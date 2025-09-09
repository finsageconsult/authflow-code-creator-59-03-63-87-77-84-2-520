import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { useIndividualPrograms } from '@/hooks/useIndividualPrograms';
import { Input } from '@/components/ui/input';

export const ContentLibrary = () => {
  const { programs, loading } = useIndividualPrograms();
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredPrograms = programs.filter(program => 
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
          placeholder="Search for finance courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPrograms.map((program, index) => (
            <Card 
              key={program.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white overflow-hidden"
            >
              <CardContent className="p-0">
                <div className={`${getIllustrationBg(index)} h-40 flex items-center justify-center`}>
                  <div className="text-4xl">
                    {index % 6 === 0 && '📚'}
                    {index % 6 === 1 && '💰'}
                    {index % 6 === 2 && '📊'}
                    {index % 6 === 3 && '🎯'}
                    {index % 6 === 4 && '💡'}
                    {index % 6 === 5 && '📈'}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-3 line-clamp-2">
                    {program.title}
                  </h3>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">{program.duration}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPrograms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No content found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
};