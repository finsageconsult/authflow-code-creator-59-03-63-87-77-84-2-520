-- Add item_type and item_id columns to payments table for unified payment tracking
ALTER TABLE payments ADD COLUMN IF NOT EXISTS item_type text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS item_id uuid;

-- Add transaction_id column to payments for external payment gateway reference
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_id text;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_item_type_id ON payments(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

-- Add transaction_id to individual_purchases for program purchases
ALTER TABLE individual_purchases ADD COLUMN IF NOT EXISTS transaction_id text;

-- Add transaction_id to tool_purchases for tool purchases  
ALTER TABLE tool_purchases ADD COLUMN IF NOT EXISTS transaction_id text;