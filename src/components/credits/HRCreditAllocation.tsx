import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, BarChart3, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCreditManagement } from '@/hooks/useCredits';
import { CreditType } from '@/types/credits';

export const HRCreditAllocation = () => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [creditType, setCreditType] = useState<CreditType>('SESSION_1_1');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  
  const { allocateCredits, isAllocatingCredits, orgWallets } = useCreditManagement();

  // Fetch employees in the organization
  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'EMPLOYEE')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Get employee wallets with user details
  const employeeWallets = orgWallets?.filter(w => 
    w.owner_type === 'USER' && employees?.some(emp => emp.id === w.owner_id)
  ) || [];

  const handleAllocateCredits = () => {
    if (!selectedEmployee || !amount || !reason) return;
    
    allocateCredits({
      userId: selectedEmployee,
      creditType,
      amount: parseInt(amount),
      reason
    });
    
    // Reset form
    setAmount('');
    setReason('');
  };

  const getEmployeeBalance = (employeeId: string, type: CreditType) => {
    const wallet = employeeWallets.find(w => 
      w.owner_id === employeeId && w.credit_type === type
    );
    return wallet?.balance || 0;
  };

  const getLowBalanceEmployees = () => {
    const lowBalanceThreshold = 5;
    return employees?.filter(emp => {
      const session1on1Balance = getEmployeeBalance(emp.id, 'SESSION_1_1');
      const webinarBalance = getEmployeeBalance(emp.id, 'WEBINAR');
      return session1on1Balance <= lowBalanceThreshold || webinarBalance <= lowBalanceThreshold;
    }) || [];
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="allocate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="allocate">Allocate Credits</TabsTrigger>
          <TabsTrigger value="usage">Usage Overview</TabsTrigger>
          <TabsTrigger value="alerts">Low Balance Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="allocate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Allocate Credits to Employees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Employee</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees?.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} ({employee.email})
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
                  <Label>Reason</Label>
                  <Textarea
                    placeholder="Enter allocation reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              <Button 
                onClick={handleAllocateCredits}
                disabled={!selectedEmployee || !amount || !reason || isAllocatingCredits}
                className="w-full"
              >
                {isAllocatingCredits ? 'Allocating...' : 'Allocate Credits'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Employee Credit Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>1-on-1 Credits</TableHead>
                    <TableHead>Webinar Credits</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees?.map((employee) => {
                    const session1on1Balance = getEmployeeBalance(employee.id, 'SESSION_1_1');
                    const webinarBalance = getEmployeeBalance(employee.id, 'WEBINAR');
                    const hasLowBalance = session1on1Balance <= 5 || webinarBalance <= 5;
                    
                    return (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-muted-foreground">{employee.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={session1on1Balance <= 5 ? "destructive" : "secondary"}>
                            {session1on1Balance}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={webinarBalance <= 5 ? "destructive" : "secondary"}>
                            {webinarBalance}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {hasLowBalance ? (
                            <Badge variant="destructive">Low Balance</Badge>
                          ) : (
                            <Badge variant="outline">Good</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Low Balance Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getLowBalanceEmployees().length > 0 ? (
                <div className="space-y-4">
                  {getLowBalanceEmployees().map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">
                          1-on-1: {getEmployeeBalance(employee.id, 'SESSION_1_1')} credits, 
                          Webinar: {getEmployeeBalance(employee.id, 'WEBINAR')} credits
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEmployee(employee.id)}
                      >
                        Allocate Credits
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No employees with low balance alerts
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};