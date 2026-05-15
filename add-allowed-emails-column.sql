-- Add allowed_emails column to discount_coupons table
-- This allows storing an array of email strings for targeted discounts.
ALTER TABLE discount_coupons 
ADD COLUMN IF NOT EXISTS allowed_emails text[];

-- Optional: If you need to make sure the column is accessible via the API,
-- Supabase automatically reloads the schema cache after DDL operations,
-- but sometimes you need to notify PostgREST explicitly:
NOTIFY pgrst, 'reload schema';
