import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText,
  Download,
  Calendar,
  DollarSign
} from 'lucide-react';

export const HRInvoices = () => {
  // Mock invoice data for now
  const mockInvoices = [
    {
      id: 'INV-2024-001',
      date: '2024-01-15',
      amount: 2500.00,
      status: 'paid',
      description: 'Monthly Employee Wellness Program'
    },
    {
      id: 'INV-2024-002', 
      date: '2024-02-15',
      amount: 2500.00,
      status: 'paid',
      description: 'Monthly Employee Wellness Program'
    },
    {
      id: 'INV-2024-003',
      date: '2024-03-15', 
      amount: 2500.00,
      status: 'pending',
      description: 'Monthly Employee Wellness Program'
    }
  ];

  const downloadInvoice = (invoiceId: string) => {
    // Mock download functionality
    console.log(`Downloading invoice ${invoiceId}`);
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Invoices & Billing</h1>
        <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
          <Download className="h-4 w-4" />
          Download All
        </Button>
      </div>

      {/* Billing Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent (YTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$7,500.00</div>
            <p className="text-xs text-muted-foreground">3 invoices this year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,500.00</div>
            <p className="text-xs text-muted-foreground">1 pending invoice</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Apr 15</div>
            <p className="text-xs text-muted-foreground">Monthly billing cycle</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            {mockInvoices.map((invoice) => (
              <div key={invoice.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 md:p-4 border rounded-lg">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="p-2 rounded-full bg-blue-100 flex-shrink-0">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm md:text-base">{invoice.id}</h4>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{invoice.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Date: {new Date(invoice.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                  <div className="text-left sm:text-right">
                    <p className="font-medium text-sm md:text-base">${invoice.amount.toFixed(2)}</p>
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'} className="text-xs">
                      {invoice.status}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadInvoice(invoice.id)}
                    className="flex items-center gap-1 text-xs md:text-sm flex-shrink-0"
                  >
                    <Download className="h-3 w-3" />
                    <span className="hidden xs:inline">Download</span>
                    <span className="xs:hidden">DL</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 md:p-4 border rounded-lg">
              <div>
                <h4 className="font-medium text-sm md:text-base">Primary Payment Method</h4>
                <p className="text-xs md:text-sm text-muted-foreground">**** **** **** 4567</p>
                <p className="text-xs text-muted-foreground">Expires 12/25</p>
              </div>
              <Badge variant="outline" className="self-start sm:self-center">Default</Badge>
            </div>
            <Button variant="outline" className="w-full">
              Update Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h4 className="font-medium text-sm md:text-base">Billing Cycle</h4>
              <p className="text-xs md:text-sm text-muted-foreground">Monthly billing on the 15th</p>
            </div>
            <Button variant="outline" size="sm" className="self-start sm:self-center">Edit</Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h4 className="font-medium text-sm md:text-base">Invoice Notifications</h4>
              <p className="text-xs md:text-sm text-muted-foreground">Email alerts enabled</p>
            </div>
            <Button variant="outline" size="sm" className="self-start sm:self-center">Manage</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};