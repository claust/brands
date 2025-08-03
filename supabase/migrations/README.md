# Database Migrations

## Using Supabase CLI for Migrations

This project uses the Supabase CLI for database schema management and migrations. All migration files should follow the naming pattern `<timestamp>_<description>.sql`.

### Available Commands

```bash
# Create a new migration file
npm run migrate:new <migration_name>

# Apply all pending migrations to remote database
npm run migrate

# List migration history (local vs remote)
npm run migrate:list
```

### Authentication Setup

#### Prerequisites
- Supabase CLI installed (`brew install supabase/tap/supabase`)
- Project linked to remote Supabase instance

#### Linking Project to Remote Database

1. **Link the project** (one-time setup):
   ```bash
   supabase link --project-ref <project-reference-id>
   ```

2. **Authentication Troubleshooting**:
   If you encounter SASL authentication errors, use the explicit password flag:
   ```bash
   supabase link --project-ref <project-ref> --password <db-password>
   ```

3. **Applying Migrations**:
   ```bash
   # Push migrations with explicit password if needed
   supabase db push --password <db-password>
   ```

#### Common Authentication Issues

**Error**: `failed SASL auth (invalid SCRAM server-final-message received)`

**Solution**: Use the `--password` flag explicitly:
```bash
supabase db push --password <your-db-password>
```

The CLI sometimes has issues with stored credentials, so providing the password explicitly resolves most authentication problems.

### Migration Workflow

1. **Create Migration**: `npm run migrate:new fix_security_issue`
2. **Edit the generated SQL file** in `supabase/migrations/`
3. **Apply Migration**: `npm run migrate` (or with `--password` flag if needed)
4. **Verify**: `npm run migrate:list` to confirm migration was applied

### Important Notes

- **Keep Migration Files**: Never delete applied migration files - they're needed for version control and team collaboration
- **PostgreSQL 15+ Required**: Security invoker views require PostgreSQL 15 or higher
- **Timestamp Format**: Use the format `YYYYMMDDHHMMSS` for migration timestamps
- **Team Collaboration**: All developers should apply the same migrations in order

---

## Security Fix: companies_with_counts View

### Issue
The `companies_with_counts` view was defined with `SECURITY DEFINER`, which poses a security risk as it enforces the view creator's permissions rather than the current user's permissions, potentially bypassing Row Level Security (RLS) policies.

### Solution Applied
Used `ALTER VIEW` with `security_invoker = true` to ensure proper RLS policy enforcement.

**Migration File**: `20250803000001_fix_view_security_invoker.sql`

```sql
-- Fix security_invoker for companies_with_counts view
ALTER VIEW public.companies_with_counts SET (security_invoker = true);
```

### Verification
After applying the migration:
1. ✅ The view returns correct data
2. ✅ RLS policies are properly enforced
3. ✅ Supabase console security warning resolved

### Security Benefits
- ✅ Enforces current user's permissions
- ✅ Respects Row Level Security policies  
- ✅ Prevents unauthorized data access
- ✅ Follows security best practices