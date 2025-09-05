import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Coins, Users, Calendar, ShoppingCart, Gift, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ExtraCreditPurchaseProps {
  session1on1Balance: number;
  webinarBalance: number;
}

export const ExtraCreditPurchase: React.FC<ExtraCreditPurchaseProps> = ({
  session1on1Balance,
  webinarBalance
}) => {
  
  const handlePurchaseClick = (type: '1on1' | 'webinar', amount: number, price: number) => {
    // Placeholder for future Razorpay integration
    toast.info(`Purchase functionality coming soon! You selected ${amount} ${type} credit(s) for ₹${price}`);
  };

  return (
    <div className="space-y-6">
      {/* Current Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-600" />
            Organization Allocation
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Free credits included with your organization plan
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-green-600" />
                <div>
                  <div className="font-semibold">1-on-1 Sessions</div>
                  <div className="text-sm text-muted-foreground">Monthly allocation</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">1</div>
                <Badge className="bg-green-100 text-green-700 text-xs">FREE</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="font-semibold">Webinar Access</div>
                  <div className="text-sm text-muted-foreground">Monthly allocation</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">1</div>
                <Badge className="bg-blue-100 text-blue-700 text-xs">FREE</Badge>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-sm font-medium text-amber-800">Current Usage:</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">1-on-1 Sessions Used:</span>
                <span className="font-medium">{Math.max(0, 1 - session1on1Balance)}/1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Webinars Used:</span>
                <span className="font-medium">{Math.max(0, 1 - webinarBalance)}/1</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Extra Credits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Buy Extra Credits
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Need more sessions? Purchase additional credits at employee-friendly rates
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* 1-on-1 Session Credits */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Additional 1-on-1 Sessions</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Single Session */}
              <Card className="border-2 hover:border-green-300 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="mb-3">
                    <div className="text-2xl font-bold text-primary">₹2,500</div>
                    <div className="text-sm text-muted-foreground">per session</div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="font-medium">1 Session Credit</div>
                    <div className="text-xs text-muted-foreground">Perfect for immediate needs</div>
                  </div>
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={() => handlePurchaseClick('1on1', 1, 2500)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Buy 1 Credit
                  </Button>
                </CardContent>
              </Card>

              {/* 3 Sessions Pack */}
              <Card className="border-2 border-green-300 relative">
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-600 text-white">
                  Most Popular
                </Badge>
                <CardContent className="p-4 text-center">
                  <div className="mb-3">
                    <div className="text-2xl font-bold text-green-600">₹6,000</div>
                    <div className="text-sm text-muted-foreground">₹2,000 per session</div>
                    <div className="text-xs text-green-600 font-medium">Save ₹1,500!</div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="font-medium">3 Session Credits</div>
                    <div className="text-xs text-muted-foreground">Great value for regular users</div>
                  </div>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700" 
                    size="sm"
                    onClick={() => handlePurchaseClick('1on1', 3, 6000)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Buy 3 Credits
                  </Button>
                </CardContent>
              </Card>

              {/* 5 Sessions Pack */}
              <Card className="border-2 hover:border-green-300 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="mb-3">
                    <div className="text-2xl font-bold text-primary">₹8,750</div>
                    <div className="text-sm text-muted-foreground">₹1,750 per session</div>
                    <div className="text-xs text-green-600 font-medium">Save ₹3,750!</div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="font-medium">5 Session Credits</div>
                    <div className="text-xs text-muted-foreground">Best value for power users</div>
                  </div>
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={() => handlePurchaseClick('1on1', 5, 8750)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Buy 5 Credits
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Webinar Credits */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Additional Webinar Access</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Single Webinar */}
              <Card className="border-2 hover:border-blue-300 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="mb-3">
                    <div className="text-2xl font-bold text-primary">₹500</div>
                    <div className="text-sm text-muted-foreground">per webinar</div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="font-medium">1 Webinar Credit</div>
                    <div className="text-xs text-muted-foreground">Access to premium webinars</div>
                  </div>
                  <Button 
                    className="w-full" 
                    size="sm" 
                    variant="outline"
                    onClick={() => handlePurchaseClick('webinar', 1, 500)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Buy 1 Credit
                  </Button>
                </CardContent>
              </Card>

              {/* 5 Webinars Pack */}
              <Card className="border-2 border-blue-300 relative">
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                  Best Value
                </Badge>
                <CardContent className="p-4 text-center">
                  <div className="mb-3">
                    <div className="text-2xl font-bold text-blue-600">₹2,000</div>
                    <div className="text-sm text-muted-foreground">₹400 per webinar</div>
                    <div className="text-xs text-blue-600 font-medium">Save ₹500!</div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="font-medium">5 Webinar Credits</div>
                    <div className="text-xs text-muted-foreground">Quarterly webinar package</div>
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    size="sm"
                    onClick={() => handlePurchaseClick('webinar', 5, 2000)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Buy 5 Credits
                  </Button>
                </CardContent>
              </Card>

              {/* 10 Webinars Pack */}
              <Card className="border-2 hover:border-blue-300 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="mb-3">
                    <div className="text-2xl font-bold text-primary">₹3,500</div>
                    <div className="text-sm text-muted-foreground">₹350 per webinar</div>
                    <div className="text-xs text-blue-600 font-medium">Save ₹1,500!</div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="font-medium">10 Webinar Credits</div>
                    <div className="text-xs text-muted-foreground">Annual learning package</div>
                  </div>
                  <Button 
                    className="w-full" 
                    size="sm" 
                    variant="outline"
                    onClick={() => handlePurchaseClick('webinar', 10, 3500)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Buy 10 Credits
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border">
            <h4 className="font-medium mb-2 text-center">Why Purchase Extra Credits?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Employee-friendly pricing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>No expiry on purchased credits</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Access to premium coaches</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Flexible scheduling</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Note */}
          <div className="text-center text-sm text-muted-foreground">
            <p>💡 Secure payment processing coming soon with Razorpay integration</p>
            <p className="text-xs mt-1">All prices are inclusive of taxes • Company billing available</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};