-- Add a raw payload column to ivr_call_logs for debugging
ALTER TABLE public.ivr_call_logs ADD COLUMN IF NOT EXISTS raw_payload jsonb;
