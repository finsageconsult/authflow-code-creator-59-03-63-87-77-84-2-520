import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, FileText, PieChart, Coins, Target, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedPaymentButton } from '@/components/payments/UnifiedPaymentButton';
import { useToolUsage } from '@/hooks/useToolUsage';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { FinancialTool } from '@/types/financial-tools';

const iconMap = {
  'calculator': Calculator,
  'trending-up': TrendingUp,
  'file-text': FileText,
  'pie-chart': PieChart,
  'coins': Coins,
  'target': Target
};

export const EmployeeToolShortcuts = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [tools, setTools] = useState<FinancialTool[]>([]);
  const [purchasedTools, setPurchasedTools] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { getUsageCount, canUseFreeTool, incrementUsage } = useToolUsage();

  useEffect(() => {
    fetchFreeTools();
    if (userProfile) {
      fetchPurchasedTools();
    }
  }, [userProfile]);

  const fetchFreeTools = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_tools')
        .select('*')
        .eq('is_active', true)
        .order('created_at');

      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error('Error fetching free tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchasedTools = async () => {
    if (!userProfile) return;
    
    try {
      const { data, error } = await supabase
        .from('tool_purchases')
        .select('tool_id')
        .eq('user_id', userProfile.id)
        .eq('status', 'completed');

      if (error) throw error;
      setPurchasedTools(data?.map(p => p.tool_id) || []);
    } catch (error) {
      console.error('Error fetching purchased tools:', error);
    }
  };

  const handleToolClick = async (tool: FinancialTool) => {
    if (!userProfile) {
      toast.error('Please sign in to use tools');
      return;
    }

    // All tools are free for employees as part of organization package
    toast.success(`Opening ${tool.name}...`);
    navigate(`/tools/${tool.ui_component}`);
  };

  const handleLaunchTool = (tool: FinancialTool) => {
    navigate(`/tools/${tool.ui_component}`);
  };

  const getToolIcon = (toolType: string) => {
    const iconKey = toolType.toLowerCase().replace('_', '-');
    return iconMap[iconKey as keyof typeof iconMap] || Calculator;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calculator className="h-5 w-5" />
            Free Financial Tools
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
      <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calculator className="h-5 w-5" />
            Financial Tools
          </CardTitle>
          <Badge className="bg-green-100 text-green-700 border-green-200">
            ✓ FREE with Organization Plan
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          All financial tools included in your organization package
        </p>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, index) => {
            const IconComponent = getToolIcon(tool.tool_type);

            return (
              <Card key={tool.id} className="relative overflow-hidden hover:shadow-sm transition-shadow bg-white/70">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">{tool.name}</h3>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {tool.description}
                    </p>
                    
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-sm font-semibold text-green-600">
                        ✓ FREE - Organization Plan
                      </span>
                      <Button 
                        size="sm" 
                        onClick={() => handleToolClick(tool)}
                        variant="default"
                        className="text-xs h-7 px-2 w-full"
                      >
                        Use Tool
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {tools.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No financial tools available</p>
          </div>
        )}
      </CardContent>

    </Card>
  );
};