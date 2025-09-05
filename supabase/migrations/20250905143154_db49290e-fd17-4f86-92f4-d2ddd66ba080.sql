-- First, let's get the actual program ID from the recent order metadata
-- The order shows programId: 550e8400-e29b-41d4-a716-446655440004, but this doesn't exist
-- Let's find the correct program and create the purchase record

-- Update the most recent successful order to completed status
UPDATE orders 
SET status = 'completed', 
    payment_method = 'razorpay',
    updated_at = now()
WHERE id = '63eb3cbe-558b-4f6f-97af-7368e39815f7';

-- Create the missing purchase record using an existing program ID
-- Based on the console logs, the user has purchased "Financial Fitness Bootcamp (Flagship)" 
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
    (SELECT id FROM individual_programs WHERE title ILIKE '%Financial Fitness%' LIMIT 1),
    '63eb3cbe-558b-4f6f-97af-7368e39815f7',
    449900,
    'completed',
    'pay_recent_successful_manual',
    now(),
    now(),
    now()
);