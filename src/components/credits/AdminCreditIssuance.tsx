import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Coins, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCreditManagement } from '@/hooks/useCredits';
import { CreditType } from '@/types/credits';

export const AdminCreditIssuance = () => {
  const [selectedOrg, setSelectedOrg] = useState('');
  const [creditType, setCreditType] = useState<CreditType>('SESSION_1_1');
  const [amount, setAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState<Date>();
  
  const { issueOrgCredits, isIssuingCredits, orgWallets } = useCreditManagement();

  // Fetch organizations
  const { data: organizations } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const handleIssueCredits = () => {
    if (!selectedOrg || !amount) return;
    
    issueOrgCredits({
      organizationId: selectedOrg,
      creditType,
      amount: parseInt(amount),
      expiresAt: expiryDate?.toISOString()
    });
    
    // Reset form
    setAmount('');
    setExpiryDate(undefined);
  };

  const getOrgWalletBalance = (orgId: string, type: CreditType) => {
    const wallet = orgWallets?.find(w => 
      w.owner_type === 'ORG' && 
      w.owner_id === orgId && 
      w.credit_type === type
    );
    return wallet?.balance || 0;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Credit Issuance & Top-ups
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Organization</Label>
              <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations?.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Credit Type</Label>
              <Select value={creditType} onValueChange={(value: CreditType) => setCreditType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SESSION_1_1">1-on-1 Sessions</SelectItem>
                  <SelectItem value="WEBINAR">Webinars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="Enter credit amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label>Expiry Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={setExpiryDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button 
            onClick={handleIssueCredits}
            disabled={!selectedOrg || !amount || isIssuingCredits}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            {isIssuingCredits ? 'Issuing...' : 'Issue Credits'}
          </Button>
        </CardContent>
      </Card>

      {selectedOrg && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Organization Credit Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">1-on-1 Sessions</span>
                  <Badge variant="secondary">
                    {getOrgWalletBalance(selectedOrg, 'SESSION_1_1')} credits
                  </Badge>
                </div>
                <Separator />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Webinars</span>
                  <Badge variant="secondary">
                    {getOrgWalletBalance(selectedOrg, 'WEBINAR')} credits
                  </Badge>
                </div>
                <Separator />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};