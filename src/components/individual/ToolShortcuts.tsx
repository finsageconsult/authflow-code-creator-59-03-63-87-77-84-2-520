import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, FileText, PieChart, Coins, Target, Lock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ToolPaymentModal } from './ToolPaymentModal';
import { useToast } from '@/hooks/use-toast';
import { RazorpayTest } from '../RazorpayTest';

const iconMap = {
  'calculator': Calculator,
  'trending-up': TrendingUp,
  'file-text': FileText,
  'pie-chart': PieChart,
  'coins': Coins,
  'target': Target
};

interface Tool {
  id: string;
  name: string;
  description: string;
  price: number;
  tool_type: string;
  is_active: boolean;
  one_time_purchase: boolean;
}

interface ToolPurchase {
  tool_id: string;
  status: string;
}

export const ToolShortcuts = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [tools, setTools] = useState<Tool[]>([]);
  const [purchases, setPurchases] = useState<ToolPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchTools();
    if (userProfile) {
      fetchPurchases();
    }
  }, [userProfile]);

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
      toast({
        title: "Error",
        description: "Failed to load tools",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchases = async () => {
    if (!userProfile) return;

    try {
      const { data, error } = await supabase
        .from('tool_purchases')
        .select('tool_id, status')
        .eq('user_id', userProfile.id)
        .eq('status', 'completed');

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
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

  const isPurchased = (toolId: string) => {
    return purchases.some(p => p.tool_id === toolId);
  };

  const handleToolClick = (tool: Tool) => {
    if (isPurchased(tool.id)) {
      // Open the tool (for now just show a message)
      toast({
        title: "Tool Access",
        description: `Opening ${tool.name}...`,
      });
      return;
    }

    if (tool.price > 0) {
      setSelectedTool(tool);
      setShowPaymentModal(true);
    } else {
      // Free tool
      toast({
        title: "Tool Access",
        description: `Opening ${tool.name}...`,
      });
    }
  };

  const handlePaymentSuccess = () => {
    fetchPurchases(); // Refresh purchases
    toast({
      title: "Purchase Successful!",
      description: "You now have access to this tool.",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price / 100);
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
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
    <>
      {/* Temporary Debug Component */}
      <div className="mb-4 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">🔧 Debug: Test Razorpay API Keys</h3>
        <RazorpayTest />
      </div>

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
              const purchased = isPurchased(tool.id);
              const isFree = tool.price === 0;
              
              return (
                <Card key={tool.id} className="relative overflow-hidden hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`p-3 rounded-full ${getToolColor(index)}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-xs sm:text-sm leading-tight">{tool.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {tool.description}
                        </p>
                        {!isFree && (
                          <p className="text-xs font-semibold text-primary mt-1">
                            {formatPrice(tool.price)}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant={purchased ? "default" : (isFree ? "outline" : "secondary")}
                        onClick={() => handleToolClick(tool)}
                        className="w-full text-xs h-8"
                      >
                        {purchased ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Open
                          </>
                        ) : isFree ? (
                          'Free Access'
                        ) : (
                          <>
                            <Lock className="h-3 w-3 mr-1" />
                            Buy Now
                          </>
                        )}
                      </Button>
                    </div>
                    {purchased && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                          Owned
                        </span>
                      </div>
                    )}
                    {isFree && !purchased && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                          Free
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

      {selectedTool && (
        <ToolPaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedTool(null);
          }}
          tool={selectedTool}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};