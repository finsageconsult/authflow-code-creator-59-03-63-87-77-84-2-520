import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, FileText, PieChart, DollarSign, Target } from 'lucide-react';

const tools = [
  {
    id: 'budget-planner',
    name: 'Budget Planner',
    description: 'Plan and track your monthly budget',
    icon: Calculator,
    color: 'bg-blue-100 text-blue-600',
    comingSoon: true
  },
  {
    id: 'portfolio-tracker',
    name: 'Portfolio Tracker',
    description: 'Monitor your investment portfolio',
    icon: TrendingUp,
    color: 'bg-green-100 text-green-600',
    comingSoon: true
  },
  {
    id: 'tax-optimizer',
    name: 'Tax Optimizer',
    description: 'Optimize your tax savings',
    icon: FileText,
    color: 'bg-purple-100 text-purple-600',
    comingSoon: true
  },
  {
    id: 'expense-analyzer',
    name: 'Expense Analyzer',
    description: 'Analyze your spending patterns',
    icon: PieChart,
    color: 'bg-orange-100 text-orange-600',
    comingSoon: true
  },
  {
    id: 'sip-calculator',
    name: 'SIP Calculator',
    description: 'Calculate SIP returns and goals',
    icon: DollarSign,
    color: 'bg-indigo-100 text-indigo-600',
    comingSoon: true
  },
  {
    id: 'goal-tracker',
    name: 'Goal Tracker',
    description: 'Track your financial goals',
    icon: Target,
    color: 'bg-pink-100 text-pink-600',
    comingSoon: true
  }
];

export const ToolShortcuts = () => {
  const handleToolClick = (toolId: string) => {
    // For now, show coming soon message
    console.log(`Opening ${toolId} tool...`);
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Calculator className="h-5 w-5" />
          Financial Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Card key={tool.id} className="relative overflow-hidden hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`p-3 rounded-full ${tool.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-xs sm:text-sm leading-tight">{tool.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {tool.description}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={tool.comingSoon ? "outline" : "default"}
                      onClick={() => handleToolClick(tool.id)}
                      disabled={tool.comingSoon}
                      className="w-full text-xs h-8"
                    >
                      {tool.comingSoon ? 'Coming Soon' : 'Open'}
                    </Button>
                  </div>
                  {tool.comingSoon && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                        Soon
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};