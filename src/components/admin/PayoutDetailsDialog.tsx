import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { usePayouts } from '@/hooks/usePayouts';
import { Download, Calendar, User, DollarSign } from 'lucide-react';

interface PayoutDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payoutId: string;
}

export const PayoutDetailsDialog: React.FC<PayoutDetailsDialogProps> = ({
  open,
  onOpenChange,
  payoutId,
}) => {
  const { payouts, getPayoutLineItems, formatCurrency, getStatusColor } = usePayouts();
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const payout = payouts.find(p => p.id === payoutId);

  useEffect(() => {
    if (open && payoutId) {
      fetchLineItems();
    }
  }, [open, payoutId]);

  const fetchLineItems = async () => {
    try {
      setLoading(true);
      const items = await getPayoutLineItems(payoutId);
      setLineItems(items);
    } catch (error) {
      console.error('Error fetching line items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    // This would generate and download a PDF receipt
    // For now, we'll just show a message
    alert('Receipt download functionality would be implemented here');
  };

  if (!payout) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Payout Details
            <Badge className={getStatusColor(payout.status)}>
              {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Detailed breakdown of payout {payout.payout_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payout Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payout Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Payout Number</div>
                  <div className="font-mono font-medium">{payout.payout_number}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Coach</div>
                  <div className="font-medium">{payout.coach?.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Period</div>
                  <div className="font-medium">
                    {new Date(payout.period_start).toLocaleDateString()} - 
                    {new Date(payout.period_end).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Students</div>
                  <div className="font-medium">{payout.total_students}</div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Rate per Student</div>
                  <div className="font-medium">{formatCurrency(payout.payment_rate_per_student)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Gross Amount</div>
                  <div className="font-medium">{formatCurrency(payout.gross_amount)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Tax Amount</div>
                  <div className="font-medium">{formatCurrency(payout.tax_amount)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Net Amount</div>
                  <div className="font-bold text-lg">{formatCurrency(payout.net_amount)}</div>
                </div>
              </div>

              {payout.payment_date && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Payment Date</div>
                      <div className="font-medium">
                        {new Date(payout.payment_date).toLocaleDateString()}
                      </div>
                    </div>
                    {payout.payment_reference && (
                      <div>
                        <div className="text-sm text-muted-foreground">Payment Reference</div>
                        <div className="font-medium">{payout.payment_reference}</div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {payout.notes && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground">Notes</div>
                    <div className="font-medium">{payout.notes}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Student Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Student</th>
                        <th className="text-left p-3 font-medium">Course</th>
                        <th className="text-left p-3 font-medium">Enrollment Date</th>
                        <th className="text-right p-3 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <div>
                              <div className="font-medium">{item.student_name}</div>
                              <div className="text-sm text-muted-foreground">{item.student_email}</div>
                            </div>
                          </td>
                          <td className="p-3">{item.course_title}</td>
                          <td className="p-3">
                            {new Date(item.enrollment_date).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-right font-medium">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {lineItems.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No student details found for this payout.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleDownloadReceipt} className="gap-2">
            <Download className="h-4 w-4" />
            Download Receipt
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};