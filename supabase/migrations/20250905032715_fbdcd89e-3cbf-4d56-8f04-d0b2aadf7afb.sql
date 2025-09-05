-- Add new access control columns to financial_tools table
ALTER TABLE public.financial_tools 
ADD COLUMN employee_access text DEFAULT 'none' CHECK (employee_access IN ('none', 'free')),
ADD COLUMN employee_free_limit integer DEFAULT 5,
ADD COLUMN individual_access text DEFAULT 'none' CHECK (individual_access IN ('none', 'paid')),
ADD COLUMN tool_price decimal DEFAULT 0;

-- Remove old columns that are being replaced
ALTER TABLE public.financial_tools 
DROP COLUMN IF EXISTS category,
DROP COLUMN IF EXISTS access_level,
DROP COLUMN IF EXISTS is_premium,
DROP COLUMN IF EXISTS free_limit;

-- Update existing tools to have reasonable defaults
UPDATE public.financial_tools 
SET employee_access = 'free', 
    employee_free_limit = 5,
    individual_access = 'paid',
    tool_price = COALESCE(price::decimal / 100, 29.99)
WHERE is_active = true;

-- Drop the old price column (stored in paisa) and rename new one
ALTER TABLE public.financial_tools 
DROP COLUMN IF EXISTS price;

ALTER TABLE public.financial_tools 
RENAME COLUMN tool_price TO price;