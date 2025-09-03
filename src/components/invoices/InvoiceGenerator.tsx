import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  item_type: string;
}

interface InvoiceGeneratorProps {
  organizationId: string;
  onInvoiceGenerated?: (invoice: any) => void;
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({
  organizationId,
  onInvoiceGenerated
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [billingMonth, setBillingMonth] = React.useState('');
  const [items, setItems] = React.useState<InvoiceItem[]>([
    { description: '', quantity: 1, unit_price: 0, item_type: 'service' }
  ]);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, item_type: 'service' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateGST = () => {
    return Math.round(calculateSubtotal() * 0.18);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateGST();
  };

  const generateInvoice = async () => {
    try {
      setLoading(true);

      if (!billingMonth) {
        toast({
          title: "Missing Information",
          description: "Please select a billing month",
          variant: "destructive"
        });
        return;
      }

      const validItems = items.filter(item => 
        item.description.trim() && item.quantity > 0 && item.unit_price > 0
      );

      if (validItems.length === 0) {
        toast({
          title: "Missing Items",
          description: "Please add at least one valid invoice item",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-invoice', {
        body: {
          organizationId,
          billingMonth,
          items: validItems
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate invoice');
      }

      toast({
        title: "Invoice Generated",
        description: `Invoice ${data.invoice.invoice_number} has been created successfully`,
      });

      onInvoiceGenerated?.(data.invoice);

      // Reset form
      setBillingMonth('');
      setItems([{ description: '', quantity: 1, unit_price: 0, item_type: 'service' }]);

    } catch (error: any) {
      console.error('Invoice generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate invoice",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generate Invoice
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="billingMonth">Billing Month</Label>
          <Input
            id="billingMonth"
            type="month"
            value={billingMonth}
            onChange={(e) => setBillingMonth(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Invoice Items</Label>
            <Button onClick={addItem} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>

          {items.map((item, index) => (
            <Card key={index}>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Item {index + 1}</span>
                  {items.length > 1 && (
                    <Button
                      onClick={() => removeItem(index)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Describe the service or product..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={item.item_type}
                      onValueChange={(value) => updateItem(index, 'item_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="subscription">Subscription</SelectItem>
                        <SelectItem value="credit_pack">Credit Pack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Unit Price (₹)</Label>
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm text-muted-foreground">
                    Line Total: {formatAmount(item.quantity * item.unit_price)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">{formatAmount(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>GST (18%):</span>
                <span>{formatAmount(calculateGST())}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>{formatAmount(calculateTotal())}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={generateInvoice}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Generating Invoice...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Generate Invoice
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};