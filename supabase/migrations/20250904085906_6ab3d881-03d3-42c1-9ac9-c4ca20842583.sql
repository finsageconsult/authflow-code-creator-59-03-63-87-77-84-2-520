-- Update the support-attachments bucket to be public for easier access
UPDATE storage.buckets 
SET public = true 
WHERE id = 'support-attachments';

-- If the bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public) 
VALUES ('support-attachments', 'support-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;