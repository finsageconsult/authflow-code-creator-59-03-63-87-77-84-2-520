import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

export const ContentLibrary = () => {
  const contentLibrary = [
    {
      id: 1,
      title: "Funding Your Children's Education: A Practical Guide",
      duration: "3 mins",
      color: "bg-gradient-to-br from-teal-100 to-teal-200",
      illustration: "👨‍👩‍👧‍👦"
    },
    {
      id: 2,
      title: "Understand Your Personal Finance",
      duration: "3 mins", 
      color: "bg-gradient-to-br from-orange-100 to-orange-200",
      illustration: "📊"
    },
    {
      id: 3,
      title: "Planning Your Finances",
      duration: "3 mins",
      color: "bg-gradient-to-br from-blue-100 to-blue-200", 
      illustration: "💡"
    },
    {
      id: 4,
      title: "Financial Wellbeing Scale",
      duration: "3 mins",
      color: "bg-gradient-to-br from-yellow-100 to-yellow-200",
      illustration: "🧘‍♀️"
    },
    {
      id: 5,
      title: "Investment Basics",
      duration: "5 mins",
      color: "bg-gradient-to-br from-green-100 to-green-200",
      illustration: "📈"
    },
    {
      id: 6,
      title: "Budgeting Made Simple", 
      duration: "4 mins",
      color: "bg-gradient-to-br from-purple-100 to-purple-200",
      illustration: "💰"
    },
    {
      id: 7,
      title: "Retirement Planning Strategies",
      duration: "6 mins",
      color: "bg-gradient-to-br from-indigo-100 to-indigo-200",
      illustration: "🏖️"
    },
    {
      id: 8,
      title: "Emergency Fund Essentials",
      duration: "3 mins",
      color: "bg-gradient-to-br from-red-100 to-red-200",
      illustration: "🚨"
    }
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {contentLibrary.map((content) => (
          <Card 
            key={content.id} 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200 bg-white overflow-hidden rounded-2xl"
          >
            <CardContent className="p-0">
              <div className={`${content.color} h-48 flex items-center justify-center relative`}>
                <div className="text-6xl filter drop-shadow-sm">
                  {content.illustration}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-800 text-base mb-3 leading-tight">
                  {content.title}
                </h3>
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{content.duration}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};