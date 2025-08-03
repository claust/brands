# Database Migrations

## Security Fix: companies_with_counts View

### Issue
The `companies_with_counts` view was defined with `SECURITY DEFINER`, which poses a security risk as it enforces the view creator's permissions rather than the current user's permissions, potentially bypassing Row Level Security (RLS) policies.

### Solution
Recreate the view with `SECURITY INVOKER` to ensure proper RLS policy enforcement.

### How to Apply

#### Option 1: Using the TypeScript script (Recommended)
```bash
# Set your Supabase service role key
export SUPABASE_SERVICE_KEY=your_service_role_key_here

# Run the migration script
npm run migrate:fix-view-security
```

#### Option 2: Manual SQL execution
Run the SQL in `001_fix_companies_with_counts_security.sql` in your Supabase SQL Editor or via psql:

```sql
-- Drop the existing view
DROP VIEW IF EXISTS public.companies_with_counts;

-- Recreate the view with SECURITY INVOKER
CREATE VIEW public.companies_with_counts 
WITH (security_invoker=on) AS
SELECT 
  c.*,
  COUNT(DISTINCT b.id) as brand_count,
  COUNT(DISTINCT s.id) as subsidiary_count
FROM companies c
LEFT JOIN brands b ON b.owner_id = c.id
LEFT JOIN companies s ON s.parent_id = c.id
GROUP BY c.id;
```

### Verification
After applying the migration, verify that:
1. The view still returns correct data
2. RLS policies are properly enforced
3. The security warning in Supabase console is resolved

### Security Benefits
- ✅ Enforces current user's permissions
- ✅ Respects Row Level Security policies  
- ✅ Prevents unauthorized data access
- ✅ Follows security best practices