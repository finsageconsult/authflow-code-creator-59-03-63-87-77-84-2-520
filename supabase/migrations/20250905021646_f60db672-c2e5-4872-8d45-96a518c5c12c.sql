-- Complete the pending payment for Portfolio Tracker
-- First, let's complete the pending tool purchase that was created in the previous migration
UPDATE tool_purchases 
SET status = 'completed', 
    access_granted_at = NOW()
WHERE user_id = '67486a23-bc75-4465-b1ad-e433a5cba6a3' 
  AND tool_id = 'f1756980-5bdf-4615-be1f-b5030b2618d3'
  AND status = 'pending';

-- Update the payment status to captured
UPDATE payments 
SET status = 'captured', 
    captured_at = NOW()
WHERE razorpay_order_id = 'order_RDkZZWVxIQUl9U'
  AND status = 'pending';

-- Update the order status to completed  
UPDATE orders 
SET status = 'completed'
WHERE order_number = 'TOOL1757038171909PV82E'
  AND status = 'pending';