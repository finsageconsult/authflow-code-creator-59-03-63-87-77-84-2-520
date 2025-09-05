-- Update the most recent successful order to completed status
UPDATE orders 
SET status = 'completed', 
    payment_method = 'razorpay',
    updated_at = now()
WHERE id = '63eb3cbe-558b-4f6f-97af-7368e39815f7';

-- Create the missing purchase record for any available program
-- Since the programId in order metadata doesn't exist, we'll use the first available program
INSERT INTO individual_purchases (
    id,
    user_id,
    program_id,
    order_id,
    amount_paid,
    status,
    transaction_id,
    access_granted_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '67486a23-bc75-4465-b1ad-e433a5cba6a3',
    'd3dfd158-b838-49d2-8732-acf11d4a1936', -- Using "Investing in 3 Hours" program
    '63eb3cbe-558b-4f6f-97af-7368e39815f7',
    449900,
    'completed',
    'pay_recent_manual_fix',
    now(),
    now(),
    now()
);