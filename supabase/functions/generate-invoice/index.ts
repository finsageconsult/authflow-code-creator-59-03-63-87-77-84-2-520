import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateInvoiceRequest {
  organizationId: string;
  billingMonth: string; // YYYY-MM format
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    item_type?: string;
    metadata?: any;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { organizationId, billingMonth, items }: GenerateInvoiceRequest = await req.json();
    console.log("Generating invoice for:", { organizationId, billingMonth });

    if (!organizationId || !billingMonth || !items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Get organization details
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single();

    if (orgError || !organization) {
      return new Response(
        JSON.stringify({ error: "Organization not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Calculate totals
    let subtotalAmount = 0;
    const processedItems = items.map(item => {
      const totalPrice = item.quantity * item.unit_price;
      subtotalAmount += totalPrice;
      return {
        ...item,
        total_price: totalPrice
      };
    });

    // Calculate GST (18%)
    const gstRate = 18.00;
    const totalGstAmount = Math.round(subtotalAmount * (gstRate / 100));
    
    // For Karnataka (same state), split GST into CGST and SGST
    const cgstAmount = Math.round(totalGstAmount / 2);
    const sgstAmount = totalGstAmount - cgstAmount;
    const igstAmount = 0; // Only for inter-state transactions

    const totalAmount = subtotalAmount + totalGstAmount;

    // Generate invoice number
    const invoiceNumber = `INV${new Date().toISOString().slice(0, 7).replace('-', '')}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        organization_id: organizationId,
        invoice_number: invoiceNumber,
        billing_month: `${billingMonth}-01`,
        subtotal_amount: subtotalAmount,
        gst_rate: gstRate,
        cgst_amount: cgstAmount,
        sgst_amount: sgstAmount,
        igst_amount: igstAmount,
        total_gst_amount: totalGstAmount,
        total_amount: totalAmount,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        status: 'draft',
        place_of_supply: 'Karnataka',
        currency: 'INR',
        billing_address: {
          name: organization.name,
          state: 'Karnataka',
          country: 'India'
        }
      })
      .select()
      .single();

    if (invoiceError) {
      console.error("Error creating invoice:", invoiceError);
      return new Response(
        JSON.stringify({ error: "Failed to create invoice" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create invoice line items
    const lineItemsToInsert = processedItems.map(item => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      item_type: item.item_type || 'service',
      metadata: item.metadata || {}
    }));

    const { error: lineItemsError } = await supabase
      .from('invoice_line_items')
      .insert(lineItemsToInsert);

    if (lineItemsError) {
      console.error("Error creating line items:", lineItemsError);
      // Clean up the invoice if line items failed
      await supabase.from('invoices').delete().eq('id', invoice.id);
      
      return new Response(
        JSON.stringify({ error: "Failed to create invoice items" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get the complete invoice with line items
    const { data: completeInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_line_items (*),
        organizations (name)
      `)
      .eq('id', invoice.id)
      .single();

    if (fetchError) {
      console.error("Error fetching complete invoice:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch invoice" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Invoice generated successfully:", invoice.invoice_number);

    return new Response(
      JSON.stringify({
        success: true,
        invoice: completeInvoice
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error generating invoice:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);