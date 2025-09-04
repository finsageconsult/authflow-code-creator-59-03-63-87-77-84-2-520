import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Calendar, TrendingUp, Clock } from 'lucide-react';

interface Payout {
  id: string;
  periodStart: string;
  periodEnd: string;
  totalSessions: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'paid';
  paidAt?: string;
}

export const PayoutView = () => {
  const payouts: Payout[] = [
    {
      id: '1',
      periodStart: '2024-01-01',
      periodEnd: '2024-01-31',
      totalSessions: 28,
      totalAmount: 42000,
      status: 'paid',
      paidAt: '2024-02-05'
    },
    {
      id: '2',
      periodStart: '2024-02-01',
      periodEnd: '2024-02-29',
      totalSessions: 32,
      totalAmount: 48000,
      status: 'processing'
    },
    {
      id: '3',
      periodStart: '2024-03-01',
      periodEnd: '2024-03-15',
      totalSessions: 15,
      totalAmount: 22500,
      status: 'pending'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount / 100);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: Payout['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalEarnings = payouts.reduce((sum, payout) => sum + payout.totalAmount, 0);
  const totalSessions = payouts.reduce((sum, payout) => sum + payout.totalSessions, 0);
  const avgPerSession = totalSessions > 0 ? totalEarnings / totalSessions : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <Coins className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">Completed sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Session</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgPerSession)}</div>
            <p className="text-xs text-muted-foreground">Average rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Payout History
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            View your payment history and pending amounts (read-only)
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">
                      {formatDate(payout.periodStart)} - {formatDate(payout.periodEnd)}
                    </h4>
                    <Badge variant="outline" className={getStatusColor(payout.status)}>
                      {payout.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {payout.totalSessions} sessions • {formatCurrency(payout.totalAmount)}
                  </div>
                  {payout.paidAt && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Paid on {formatDate(payout.paidAt)}
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold">{formatCurrency(payout.totalAmount)}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(payout.totalAmount / payout.totalSessions)}/session
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};