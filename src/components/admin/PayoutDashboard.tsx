import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  Download,
  Plus,
  Settings,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { usePayouts } from '@/hooks/usePayouts';
import { PayoutGenerationDialog } from './PayoutGenerationDialog';
import { CoachSettingsDialog } from './CoachSettingsDialog';
import { PayoutDetailsDialog } from './PayoutDetailsDialog';

export const PayoutDashboard = () => {
  const { 
    payouts, 
    coachSettings, 
    loading, 
    updatePayoutStatus,
    formatCurrency,
    getStatusColor 
  } = usePayouts();
  
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<string | null>(null);

  // Calculate summary statistics
  const totalPayouts = payouts.length;
  const pendingPayouts = payouts.filter(p => p.status === 'pending').length;
  const totalAmount = payouts.reduce((sum, p) => sum + p.gross_amount, 0);
  const paidAmount = payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.net_amount, 0);

  const handleStatusUpdate = async (payoutId: string, status: 'paid' | 'cancelled' | 'processing') => {
    await updatePayoutStatus(payoutId, status);
  };

  const handleViewDetails = (payoutId: string) => {
    setSelectedPayout(payoutId);
    setShowDetailsDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payout Management</h1>
          <p className="text-muted-foreground">
            Manage coach payouts and commission settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowSettingsDialog(true)}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Coach Settings
          </Button>
          <Button onClick={() => setShowGenerateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Generate Payout
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPayouts}</div>
            <p className="text-xs text-muted-foreground">
              {pendingPayouts} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Gross amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(paidAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Net paid amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coaches</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coachSettings.filter(c => c.is_active).length}</div>
            <p className="text-xs text-muted-foreground">
              With payout settings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Payout #</th>
                  <th className="text-left p-4 font-medium">Coach</th>
                  <th className="text-left p-4 font-medium">Period</th>
                  <th className="text-left p-4 font-medium">Students</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-mono text-sm">{payout.payout_number}</td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{payout.coach?.name}</div>
                        <div className="text-sm text-muted-foreground">{payout.coach?.email}</div>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      {new Date(payout.period_start).toLocaleDateString()} - 
                      {new Date(payout.period_end).toLocaleDateString()}
                    </td>
                    <td className="p-4">{payout.total_students}</td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{formatCurrency(payout.net_amount)}</div>
                        <div className="text-sm text-muted-foreground">
                          Gross: {formatCurrency(payout.gross_amount)}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor(payout.status)}>
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDetails(payout.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {payout.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatusUpdate(payout.id, 'paid')}
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatusUpdate(payout.id, 'cancelled')}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payouts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No payouts found. Generate your first payout to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <PayoutGenerationDialog 
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
      />
      
      <CoachSettingsDialog 
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
      />
      
      {selectedPayout && (
        <PayoutDetailsDialog 
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          payoutId={selectedPayout}
        />
      )}
    </div>
  );
};