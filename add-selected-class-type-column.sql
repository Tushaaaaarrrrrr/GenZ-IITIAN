-- Add selected class type storage for fixed bundle pricing tiers.
-- This keeps the selected LIVE/RECORDED tier attached to the order.
ALTER TABLE website_orders
ADD COLUMN IF NOT EXISTS selected_class_type text;
