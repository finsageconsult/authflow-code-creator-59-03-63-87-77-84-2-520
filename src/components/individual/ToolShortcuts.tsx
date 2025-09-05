import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, FileText, PieChart, Coins, Target, Lock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedPaymentButton } from '@/components/payments/UnifiedPaymentButton';
import { useUserPurchases } from '@/hooks/useUserPurchases';

const iconMap = {
  'calculator': Calculator,
  'trending-up': TrendingUp,
  'file-text': FileText,
  'pie-chart': PieChart,
  'coins': Coins,
  'target': Target
};

interface FinancialTool {
  id: string;
  name: string;
  description: string;
  price: number;
  tool_type: string;
  is_active: boolean;
  is_premium: boolean;
  one_time_purchase: boolean;
}

export const ToolShortcuts = () => {
  const [tools, setTools] = useState<FinancialTool[]>([]);
  const [loading, setLoading] = useState(true);
  const { isPurchased, refetch: refetchPurchases } = useUserPurchases();

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_tools')
        .select('*')
        .eq('is_active', true)
        .order('created_at');

      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToolClick = (tool: FinancialTool) => {
    if (tool.is_premium && tool.one_time_purchase && !isPurchased('tool', tool.id)) {
      // Payment will be handled by the UnifiedPaymentButton
      return;
    } else if (isPurchased('tool', tool.id) || !tool.is_premium) {
      // Handle access to owned tools or free tools
      console.log('Navigate to tool:', tool.name);
    }
  };

  const getToolIcon = (toolType: string) => {
    const iconKey = toolType.toLowerCase().replace('_', '-');
    return iconMap[iconKey as keyof typeof iconMap] || Calculator;
  };

  const getToolColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600', 
      'bg-purple-100 text-purple-600',
      'bg-orange-100 text-orange-600',
      'bg-indigo-100 text-indigo-600',
      'bg-pink-100 text-pink-600'
    ];
    return colors[index % colors.length];
  };

  if (loading) {
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
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
          {tools.map((tool, index) => {
            const IconComponent = getToolIcon(tool.tool_type);
            const isOwned = isPurchased('tool', tool.id);
            const isFree = !tool.is_premium || tool.price === 0;

            return (
              <Card key={tool.id} className="relative overflow-hidden hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">{tool.name}</h3>
                      {tool.is_premium && tool.one_time_purchase && !isOwned && (
                        <Lock className="h-4 w-4 text-amber-600" />
                      )}
                      {isOwned && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {tool.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        {tool.is_premium && tool.price > 0 
                          ? `₹${(tool.price / 100).toLocaleString()}`
                          : 'Free'
                        }
                      </span>
                      {tool.is_premium && tool.one_time_purchase ? (
                        <UnifiedPaymentButton
                          itemType="tool"
                          itemId={tool.id}
                          title={tool.name}
                          description={tool.description}
                          price={tool.price}
                          isOwned={isOwned}
                          onSuccess={refetchPurchases}
                        />
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => handleToolClick(tool)}
                          variant="outline"
                          className="text-xs h-7 px-2"
                        >
                          {isOwned ? 'Open' : 'Use'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};