-- Fix Function Search Path Mutable issue for update_updated_at_column function
-- This addresses the Supabase lint warning about mutable search_path

-- Drop the existing function
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate the function with explicit search_path for security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update the updated_at timestamp
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Comment explaining the security fix
COMMENT ON FUNCTION public.update_updated_at_column() IS 
'Trigger function to automatically update updated_at column. Uses fixed search_path for security.';