import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, FileText, PieChart, Coins, Target, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedPaymentButton } from '@/components/payments/UnifiedPaymentButton';
import { useToolUsage } from '@/hooks/useToolUsage';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const iconMap = {
  'calculator': Calculator,
  'trending-up': TrendingUp,
  'file-text': FileText,
  'pie-chart': PieChart,
  'coins': Coins,
  'target': Target
};

import { FinancialTool } from '@/types/financial-tools';

export const EmployeeToolShortcuts = () => {
  const { userProfile } = useAuth();
  const [tools, setTools] = useState<FinancialTool[]>([]);
  const [loading, setLoading] = useState(true);
  const { getUsageCount, canUseFreeTool, incrementUsage } = useToolUsage();

  useEffect(() => {
    fetchFreeTools();
  }, []);

  const fetchFreeTools = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_tools')
        .select('*')
        .eq('is_active', true)
        .eq('employee_access', 'free')
        .order('created_at');

      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error('Error fetching free tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFreeToolClick = async (tool: FinancialTool) => {
    if (!userProfile) {
      toast.error('Please sign in to use tools');
      return;
    }

    const canUse = canUseFreeTool(tool.id, tool.employee_free_limit || 5);
    if (canUse) {
      const success = await incrementUsage(tool.id);
      if (success) {
        toast.success(`Opening ${tool.name}...`);
        // TODO: Implement actual tool navigation
        console.log('Navigate to free tool:', tool.name);
      }
    } else {
      toast.error(`You've reached the free usage limit (${tool.employee_free_limit}) for ${tool.name}.`);
    }
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
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Calculator className="h-5 w-5" />
          Free Financial Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, index) => {
            const IconComponent = getToolIcon(tool.tool_type);
            const usageCount = getUsageCount(tool.id);
            const canUseFree = canUseFreeTool(tool.id, tool.employee_free_limit || 5);
            const remainingUses = Math.max(0, (tool.employee_free_limit || 5) - usageCount);

            return (
              <Card key={tool.id} className="relative overflow-hidden hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">{tool.name}</h3>
                      {canUseFree ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-600" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {tool.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      <div className="flex justify-between items-center">
                        <span>Usage: {usageCount}/{tool.employee_free_limit || 5}</span>
                        <span className={`font-medium ${remainingUses === 0 ? 'text-red-600' : remainingUses <= 1 ? 'text-amber-600' : 'text-green-600'}`}>
                          {remainingUses} left
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            remainingUses === 0 ? 'bg-red-500' : 
                            remainingUses <= 1 ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.max(10, (remainingUses / (tool.employee_free_limit || 5)) * 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-sm font-semibold text-green-600">
                        Free Access
                      </span>
                      {canUseFree ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleFreeToolClick(tool)}
                          variant="default"
                          className="text-xs h-7 px-2 w-full"
                        >
                          Use Tool ({remainingUses} left)
                        </Button>
                      ) : (
                        <div className="w-full space-y-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-xs h-7 px-2 w-full cursor-not-allowed"
                            disabled
                          >
                            Free Limit Reached
                          </Button>
                          {tool.price > 0 && (
                            <UnifiedPaymentButton
                              itemType="tool"
                              itemId={tool.id}
                              title={tool.name}
                              description={`${tool.description} - Unlimited access`}
                              price={tool.price}
                              isOwned={false}
                              onSuccess={() => {
                                // Refresh usage data after purchase
                                window.location.reload();
                              }}
                            />
                          )}
                        </div>
                      )}
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
            <p>No free financial tools available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};