-- Create enums for payment and order status
CREATE TYPE payment_status AS ENUM ('pending', 'authorized', 'captured', 'failed', 'refunded');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_method AS ENUM ('razorpay', 'credits');
CREATE TYPE user_type AS ENUM ('individual', 'employee', 'organization');

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES public.organizations(id),
  order_number TEXT UNIQUE NOT NULL,
  user_type user_type NOT NULL,
  service_type TEXT NOT NULL, -- 'session_1on1', 'webinar', 'credit_pack'
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL, -- in paise (INR cents)
  total_amount INTEGER NOT NULL, -- in paise
  gst_amount INTEGER DEFAULT 0, -- in paise
  final_amount INTEGER NOT NULL, -- total + gst in paise
  currency TEXT DEFAULT 'INR',
  status order_status DEFAULT 'pending',
  payment_method payment_method,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  amount INTEGER NOT NULL, -- in paise
  currency TEXT DEFAULT 'INR',
  status payment_status DEFAULT 'pending',
  payment_method TEXT,
  razorpay_signature TEXT,
  failure_reason TEXT,
  captured_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices table (for organizations)
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  invoice_number TEXT UNIQUE NOT NULL,
  billing_month DATE NOT NULL, -- first day of billing month
  subtotal_amount INTEGER NOT NULL, -- in paise
  gst_rate DECIMAL(5,2) DEFAULT 18.00, -- GST percentage
  cgst_amount INTEGER DEFAULT 0, -- in paise
  sgst_amount INTEGER DEFAULT 0, -- in paise
  igst_amount INTEGER DEFAULT 0, -- in paise
  total_gst_amount INTEGER DEFAULT 0, -- in paise
  total_amount INTEGER NOT NULL, -- subtotal + gst in paise
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'draft', -- draft, sent, paid, overdue
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  
  -- GST details
  gstin TEXT, -- Organization GST number
  place_of_supply TEXT DEFAULT 'Karnataka', -- State for GST calculation
  
  -- Billing address
  billing_address JSONB,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Invoice line items
CREATE TABLE public.invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL, -- in paise
  total_price INTEGER NOT NULL, -- quantity * unit_price in paise
  item_type TEXT, -- 'subscription', 'credit_pack', 'overage'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (auth.uid() IN (SELECT auth_id FROM users WHERE role IN ('HR', 'ADMIN') AND organization_id = orders.organization_id))
  );

CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL USING (auth.uid() IN (SELECT auth_id FROM users WHERE role = 'ADMIN'));

-- RLS Policies for payments
CREATE POLICY "Users can view their order payments" ON public.payments
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all payments" ON public.payments
  FOR ALL USING (auth.uid() IN (SELECT auth_id FROM users WHERE role = 'ADMIN'));

-- RLS Policies for invoices
CREATE POLICY "HR can view org invoices" ON public.invoices
  FOR SELECT USING (
    auth.uid() IN (SELECT auth_id FROM users WHERE role IN ('HR', 'ADMIN') AND organization_id = invoices.organization_id)
  );

CREATE POLICY "Admins can manage all invoices" ON public.invoices
  FOR ALL USING (auth.uid() IN (SELECT auth_id FROM users WHERE role = 'ADMIN'));

-- RLS Policies for invoice line items
CREATE POLICY "Users can view invoice items" ON public.invoice_line_items
  FOR SELECT USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE 
      auth.uid() IN (SELECT auth_id FROM users WHERE role IN ('HR', 'ADMIN') AND organization_id = invoices.organization_id)
    )
  );

-- Create indexes for performance
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_organization_id ON public.orders(organization_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_payments_razorpay_payment_id ON public.payments(razorpay_payment_id);
CREATE INDEX idx_invoices_organization_id ON public.invoices(organization_id);
CREATE INDEX idx_invoices_billing_month ON public.invoices(billing_month);

-- Add updated_at triggers
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT := 'ORD';
  timestamp_part TEXT := to_char(NOW(), 'YYYYMMDD');
  random_part TEXT := upper(substring(gen_random_uuid()::text, 1, 8));
BEGIN
  RETURN prefix || timestamp_part || random_part;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT := 'INV';
  timestamp_part TEXT := to_char(NOW(), 'YYYYMM');
  sequence_part TEXT := lpad((SELECT COUNT(*) + 1 FROM invoices WHERE created_at >= date_trunc('month', NOW()))::TEXT, 4, '0');
BEGIN
  RETURN prefix || timestamp_part || sequence_part;
END;
$$ LANGUAGE plpgsql;