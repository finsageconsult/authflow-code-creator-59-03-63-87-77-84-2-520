-- Fix the purchase record to match the actual program that was paid for
-- The order shows programId: 550e8400-e29b-41d4-a716-446655440004 which is "Debt-Free Journey"
-- But the purchase record was created with a different program ID

UPDATE individual_purchases 
SET program_id = '550e8400-e29b-41d4-a716-446655440004'
WHERE order_id = '63eb3cbe-558b-4f6f-97af-7368e39815f7';