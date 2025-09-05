import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, FileText, PieChart, Coins, Target, Lock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedPaymentButton } from '@/components/payments/UnifiedPaymentButton';
import { useUserPurchases } from '@/hooks/useUserPurchases';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { FinancialTool } from '@/types/financial-tools';

const iconMap = {
  'calculator': Calculator,
  'trending-up': TrendingUp,
  'file-text': FileText,
  'pie-chart': PieChart,
  'coins': Coins,
  'target': Target
};

export const ToolShortcuts = () => {
  const { userProfile } = useAuth();
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
        .eq('individual_access', 'paid')
        .order('created_at');

      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToolClick = async (tool: FinancialTool) => {
    if (!userProfile) {
      toast.error('Please sign in to use tools');
      return;
    }

    // For individual access, always check if purchased first
    if (isPurchased('tool', tool.id)) {
      toast.success(`Opening ${tool.name}...`);
      console.log('Navigate to owned paid tool:', tool.name);
      // TODO: Implement actual tool navigation
    } else {
      toast.error('Please purchase this tool to access it.');
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
            Premium Financial Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          Premium Financial Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, index) => {
            const IconComponent = getToolIcon(tool.tool_type);
            const isOwned = isPurchased('tool', tool.id);

            return (
              <Card key={tool.id} className="relative overflow-hidden hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">{tool.name}</h3>
                      {!isOwned && (
                        <Lock className="h-4 w-4 text-amber-600" />
                      )}
                      {isOwned && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {tool.description}
                    </p>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-sm font-semibold">
                        ₹{tool.price.toLocaleString()}
                      </span>
                      {!isOwned ? (
                        <UnifiedPaymentButton
                          itemType="tool"
                          itemId={tool.id}
                          title={tool.name}
                          description={tool.description}
                          price={tool.price * 100} // Convert to paisa for payment
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
                          Open Tool
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {tools.length === 0 && (
          <div className="text-center py-8">
            <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No premium tools available</h3>
            <p className="text-muted-foreground">
              Premium financial tools will appear here when they become available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};