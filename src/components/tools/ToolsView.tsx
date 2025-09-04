import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calculator, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Crown, 
  ExternalLink,
  Wrench
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ToolPaymentModal } from '@/components/individual/ToolPaymentModal';
import { EmptyState } from '@/components/ui/empty-state';

interface FinancialTool {
  id: string;
  name: string;
  description: string;
  tool_type: string;
  tool_config: any;
  ui_component: string;
  is_premium: boolean;
  is_active: boolean;
  access_level: string;
  tags: string[];
  price: number;
  one_time_purchase: boolean;
}

interface ToolPurchase {
  tool_id: string;
  status: string;
}

const getToolIcon = (toolType: string) => {
  switch (toolType) {
    case 'calculator':
      return Calculator;
    case 'planner':
      return Target;
    case 'tracker':
      return BarChart3;
    case 'analyzer':
      return TrendingUp;
    default:
      return Calculator;
  }
};

const getToolIconColor = (toolType: string) => {
  switch (toolType) {
    case 'calculator':
      return 'text-blue-600';
    case 'planner':
      return 'text-green-600';
    case 'tracker':
      return 'text-purple-600';
    case 'analyzer':
      return 'text-orange-600';
    default:
      return 'text-blue-600';
  }
};

export const ToolsView = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [tools, setTools] = useState<FinancialTool[]>([]);
  const [purchasedTools, setPurchasedTools] = useState<ToolPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    tool: FinancialTool | null;
  }>({
    isOpen: false,
    tool: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tools
        const { data: toolsData, error: toolsError } = await supabase
          .from('financial_tools')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (toolsError) throw toolsError;
        setTools(toolsData || []);

        // Fetch user's tool purchases if logged in
        if (userProfile) {
          const { data: purchasesData, error: purchasesError } = await supabase
            .from('tool_purchases')
            .select('tool_id, status')
            .eq('user_id', userProfile.id)
            .eq('status', 'completed');

          if (purchasesError) {
            console.error('Error fetching purchases:', purchasesError);
          } else {
            setPurchasedTools(purchasesData || []);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load financial tools",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, userProfile]);

  const hasAccess = (tool: FinancialTool) => {
    // Free tools are always accessible
    if (tool.access_level === 'free') return true;
    
    // Check if user has purchased premium tools
    return purchasedTools.some(purchase => purchase.tool_id === tool.id);
  };

  const handleUseTool = (tool: FinancialTool) => {
    if (!hasAccess(tool)) {
      // Open payment modal for premium tools
      setPaymentModal({ isOpen: true, tool });
      return;
    }

    toast({
      title: "Launching Tool",
      description: `Opening ${tool.name}...`,
    });

    // TODO: Implement actual tool launching logic
    // This would typically open a modal or navigate to a tool-specific page
  };

  const handlePaymentSuccess = () => {
    // Refetch purchases after successful payment
    if (userProfile) {
      supabase
        .from('tool_purchases')
        .select('tool_id, status')
        .eq('user_id', userProfile.id)
        .eq('status', 'completed')
        .then(({ data, error }) => {
          if (!error) {
            setPurchasedTools(data || []);
          }
        });
    }
    setPaymentModal({ isOpen: false, tool: null });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price / 100);
  };

  const groupedTools = tools.reduce((acc, tool) => {
    if (!acc[tool.tool_type]) {
      acc[tool.tool_type] = [];
    }
    acc[tool.tool_type].push(tool);
    return acc;
  }, {} as Record<string, FinancialTool[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading financial tools...</p>
        </div>
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Financial Tools</h1>
        </div>
        
        <EmptyState
          icon={<Wrench className="w-8 h-8 text-primary/60" />}
          title="No Tools Available"
          description="Financial planning tools are not yet available. Check back later for calculators, planners, and tracking tools."
          supportiveMessage="New tools are being added regularly to help with your financial journey"
          className="max-w-md mx-auto"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Tools</h1>
          <p className="text-muted-foreground mt-1">
            Use our interactive tools to plan, calculate, and track your financial goals
          </p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {tools.length} Available
        </Badge>
      </div>

      {Object.entries(groupedTools).map(([toolType, typeTools]) => {
        const IconComponent = getToolIcon(toolType);
        const iconColor = getToolIconColor(toolType);
        
        return (
          <div key={toolType} className="space-y-4">
            <div className="flex items-center gap-3">
              <IconComponent className={`h-6 w-6 ${iconColor}`} />
              <h2 className="text-xl font-semibold capitalize">
                {toolType}s ({typeTools.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {typeTools.map((tool) => {
                const ToolIcon = getToolIcon(tool.tool_type);
                const toolIconColor = getToolIconColor(tool.tool_type);
                
                return (
                  <Card key={tool.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2 flex items-center gap-2">
                          <ToolIcon className={`h-5 w-5 ${toolIconColor}`} />
                          {tool.name}
                        </CardTitle>
                        <div className="flex flex-col gap-1">
                          {hasAccess(tool) ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Access Granted
                            </Badge>
                          ) : tool.access_level === 'premium' ? (
                            <Badge 
                              variant="secondary" 
                              className="bg-yellow-100 text-yellow-800 text-xs gap-1"
                            >
                              <Crown className="h-3 w-3" />
                              Premium
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              Free
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs capitalize">
                            {tool.tool_type}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col gap-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {tool.description}
                      </p>

                      {tool.access_level === 'premium' && !hasAccess(tool) && (
                        <div className="text-center py-2">
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(tool.price)}
                          </p>
                          <p className="text-xs text-muted-foreground">One-time purchase</p>
                        </div>
                      )}
                      
                      {tool.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {tool.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {tool.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{tool.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="mt-auto pt-4">
                        <Button 
                          onClick={() => handleUseTool(tool)}
                          className="w-full gap-2"
                          variant={hasAccess(tool) ? "default" : "outline"}
                        >
                          <ExternalLink className="h-4 w-4" />
                          {hasAccess(tool) 
                            ? 'Use Tool' 
                            : tool.access_level === 'premium' 
                            ? `Buy Now - ${formatPrice(tool.price)}`
                            : 'Use Tool'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Payment Modal */}
      {paymentModal.tool && (
        <ToolPaymentModal
          isOpen={paymentModal.isOpen}
          onClose={() => setPaymentModal({ isOpen: false, tool: null })}
          tool={{
            id: paymentModal.tool.id,
            name: paymentModal.tool.name,
            price: paymentModal.tool.price,
            description: paymentModal.tool.description
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Usage Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-blue-100">
              <Calculator className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-blue-900">How to Use Financial Tools</h3>
              <p className="text-sm text-blue-800">
                Our financial tools are designed to help you make informed decisions. Calculators help with quick computations, 
                planners assist with long-term strategies, trackers monitor your progress, and analyzers provide insights.
                {tools.some(t => t.is_premium) && (
                  <span className="block mt-2">
                    <Crown className="h-4 w-4 inline mr-1" />
                    Premium tools offer advanced features and detailed analysis for comprehensive financial planning.
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};