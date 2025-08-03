-- Fix security_invoker for companies_with_counts view
-- This changes the view from SECURITY DEFINER to SECURITY INVOKER
-- ensuring proper RLS policy enforcement

-- Alter the existing view to use security_invoker
ALTER VIEW public.companies_with_counts SET (security_invoker = true);

-- Verify the change was applied
-- Note: This query will show the updated view definition
SELECT 
  schemaname, 
  viewname, 
  definition 
FROM pg_views 
WHERE viewname = 'companies_with_counts';