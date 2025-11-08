# Appwrite Migration Guide

Complete step-by-step guide to migrate from static JSON to Appwrite backend.

---

## Overview

This guide will help you migrate the Brand Ownership Visualization app from:
- **From**: Static JSON files + file system storage
- **To**: Appwrite Database + Appwrite Storage

**Estimated Time**: 2-4 hours (depending on logo count)

**Prerequisites**:
- Node.js 18+ installed
- Basic understanding of Appwrite
- Appwrite Cloud account OR self-hosted Appwrite instance

---

## Phase 1: Appwrite Setup

### Step 1: Create Appwrite Project

#### Option A: Appwrite Cloud (Recommended)

1. Visit [cloud.appwrite.io](https://cloud.appwrite.io)
2. Sign up or log in
3. Click "Create Project"
4. Enter project name: `Brand Ownership Visualization`
5. Note your **Project ID** (you'll need this later)
6. Your **Endpoint** will be: `https://cloud.appwrite.io/v1`

#### Option B: Self-Hosted Appwrite

1. Install Docker on your server
2. Run Appwrite installation:
   ```bash
   docker run -d \
     --name appwrite \
     -p 80:80 -p 443:443 \
     -v appwrite-data:/storage \
     appwrite/appwrite:latest
   ```
3. Visit `http://your-server-ip`
4. Complete setup wizard
5. Create project
6. Note your **Project ID** and **Endpoint**

### Step 2: Configure Platforms

1. In Appwrite Console, go to **Settings > Platforms**
2. Click "Add Platform" → "Web App"
3. Add your domains:
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com` (if applicable)
4. Save

### Step 3: Create API Key

1. Go to **Settings > API Keys**
2. Click "Create API Key"
3. Name: `Migration Key`
4. Expiration: Set to 30 days (or "Never" for testing)
5. Scopes: Select:
   - ✅ `databases.read`
   - ✅ `databases.write`
   - ✅ `storage.read`
   - ✅ `storage.write`
6. Click "Create"
7. **IMPORTANT**: Copy the API key immediately (you can't see it again)

---

## Phase 2: Database Setup

### Step 4: Create Database

1. In Appwrite Console, go to **Databases**
2. Click "Create Database"
3. Database ID: `brands_db`
4. Database Name: `Brand Ownership Database`
5. Click "Create"

### Step 5: Create Companies Collection

1. Click on `brands_db` database
2. Click "Create Collection"
3. Collection ID: `companies`
4. Collection Name: `Companies`
5. Click "Create"

#### Configure Companies Attributes

Click "Create Attribute" and add the following:

| Attribute | Type | Size | Required | Default |
|-----------|------|------|----------|---------|
| `name` | String | 255 | ✅ Yes | - |
| `slug` | String | 255 | ✅ Yes | - |
| `parent_id` | String | 255 | ❌ No | null |
| `description` | String | 1000 | ❌ No | "" |
| `website` | String | 500 | ❌ No | "" |
| `founded` | Integer | - | ❌ No | 0 |
| `headquarters` | String | 255 | ❌ No | "" |
| `revenue` | Float | - | ❌ No | 0 |
| `logo_url` | String | 500 | ❌ No | "" |
| `is_public` | Boolean | - | ❌ No | false |
| `stock_symbol` | String | 10 | ❌ No | "" |
| `industry` | String[] | 100 | ❌ No | [] |

#### Create Companies Indexes

Click "Create Index" and add:

1. **Name Search Index**
   - Key: `name_index`
   - Type: `key`
   - Attributes: `name`
   - Order: `ASC`

2. **Slug Index (Unique)**
   - Key: `slug_index`
   - Type: `unique`
   - Attributes: `slug`
   - Order: `ASC`

3. **Parent ID Index**
   - Key: `parent_id_index`
   - Type: `key`
   - Attributes: `parent_id`
   - Order: `ASC`

#### Set Companies Permissions

1. Click "Settings" tab
2. Under "Permissions", click "Add Role"
3. Add:
   - Read: `Any` (anyone can read)
   - Create: `Users` (only authenticated users, optional)
   - Update: `Users` (only authenticated users, optional)
   - Delete: `Users` (only authenticated users, optional)

For now, you can set all to "Any" if you don't have authentication.

### Step 6: Create Brands Collection

Repeat the process for brands:

1. Click "Create Collection"
2. Collection ID: `brands`
3. Collection Name: `Brands`

#### Configure Brands Attributes

| Attribute | Type | Size | Required | Default |
|-----------|------|------|----------|---------|
| `name` | String | 255 | ✅ Yes | - |
| `slug` | String | 255 | ✅ Yes | - |
| `owner_id` | String | 255 | ✅ Yes | - |
| `category` | String | 100 | ✅ Yes | - |
| `sub_category` | String | 100 | ❌ No | "" |
| `description` | String | 2000 | ❌ No | "" |
| `website` | String | 500 | ❌ No | "" |
| `founded` | Integer | - | ❌ No | 0 |
| `logo_primary` | String | 255 | ❌ No | "" |
| `logo_variant_1` | String | 255 | ❌ No | "" |
| `logo_variant_2` | String | 255 | ❌ No | "" |
| `is_active` | Boolean | - | ❌ No | true |
| `market_regions` | String[] | 100 | ❌ No | [] |
| `tags` | String[] | 50 | ❌ No | [] |

#### Create Brands Indexes

1. **Name Search Index**
   - Key: `name_index`
   - Type: `key`
   - Attributes: `name`
   - Order: `ASC`

2. **Slug Index (Unique)**
   - Key: `slug_index`
   - Type: `unique`
   - Attributes: `slug`
   - Order: `ASC`

3. **Owner ID Index**
   - Key: `owner_id_index`
   - Type: `key`
   - Attributes: `owner_id`
   - Order: `ASC`

4. **Category Index**
   - Key: `category_index`
   - Type: `key`
   - Attributes: `category`
   - Order: `ASC`

#### Set Brands Permissions

Same as companies - set to "Any" for now.

---

## Phase 3: Storage Setup

### Step 7: Create Storage Bucket

1. Go to **Storage** in Appwrite Console
2. Click "Create Bucket"
3. Bucket ID: `brand-logos`
4. Bucket Name: `Brand Logos`
5. Configuration:
   - **Max File Size**: `5000000` (5 MB)
   - **Allowed Extensions**: `jpg,jpeg,png,webp,svg`
   - **Compression**: ✅ Enabled
   - **Encryption**: ✅ Enabled
   - **Antivirus**: ✅ Enabled (if available)
6. Click "Create"

#### Set Bucket Permissions

1. Click "Settings" tab
2. Under "Permissions":
   - Read: `Any` (public access)
   - Create: `Users` or `Any` (depending on your needs)
   - Update: `Users`
   - Delete: `Users`

---

## Phase 4: Local Project Setup

### Step 8: Install Dependencies

1. Navigate to project directory:
   ```bash
   cd /path/to/brands
   ```

2. Install Appwrite SDK:
   ```bash
   npm install appwrite
   ```

   This installs the Appwrite client library.

### Step 9: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your Appwrite details:
   ```bash
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT=your-project-id-here
   APPWRITE_API_KEY=your-api-key-here
   ```

   Replace:
   - `your-project-id-here` with your Appwrite Project ID
   - `your-api-key-here` with the API key you created in Step 3

3. **IMPORTANT**: Never commit `.env` to git!
   - `.env` is already in `.gitignore`
   - Only commit `.env.example`

---

## Phase 5: Data Migration

### Step 10: Test Migration (Dry Run)

Before migrating, test the migration script:

```bash
npm run migrate:appwrite:dry-run
```

This will:
- ✅ Validate configuration
- ✅ Show what would be migrated
- ❌ Not write any data

Review the output to ensure everything looks correct.

### Step 11: Migrate Companies

Migrate companies first (brands reference companies):

```bash
npm run migrate:appwrite:companies
```

Expected output:
```
🚀 Appwrite Data Migration Tool

Configuration:
  Endpoint: https://cloud.appwrite.io/v1
  Project: 673abc...
  Database: brands_db
  Dry Run: NO

📦 Migrating 213 companies...
✓ Migrated company: The Coca-Cola Company (coca_cola_company)
✓ Migrated company: PepsiCo (pepsico)
...

✅ Migration completed in 45.32s
```

### Step 12: Migrate Brands

Now migrate brands:

```bash
npm run migrate:appwrite:brands
```

Expected output:
```
📦 Migrating 279 brands...
✓ Migrated brand: Coca-Cola (coca_cola)
✓ Migrated brand: Sprite (sprite)
...

✅ Migration completed in 28.14s
```

### Step 13: Verify Data in Appwrite Console

1. Go to **Databases > brands_db**
2. Click on **companies** collection
3. Verify:
   - ✅ 213 documents (companies)
   - ✅ All companies have names
   - ✅ Parent-child relationships look correct

4. Click on **brands** collection
5. Verify:
   - ✅ 279 documents (brands)
   - ✅ All brands have owners
   - ✅ Categories are populated

---

## Phase 6: Logo Migration

### Step 14: Ensure Logos Exist Locally

Before uploading logos, make sure they exist:

```bash
ls -la public/logos/ | head -20
```

You should see directories like:
```
coca_cola/
sprite/
fanta/
...
```

If logos don't exist, run the logo searcher first:
```bash
npm run logo-search
```

### Step 15: Test Logo Upload (Dry Run)

Test logo upload without actually uploading:

```bash
npm run migrate:logos:dry-run
```

Review the output to ensure paths are correct.

### Step 16: Upload Logos to Appwrite

Upload all logos:

```bash
npm run migrate:logos
```

This will:
1. Upload each logo to Appwrite Storage
2. Update brand documents with logo file IDs
3. Save progress to `scripts/logo-upload-progress.json`

Expected output:
```
🚀 Appwrite Logo Upload Migration Tool

📁 Found 279 brand directories

📸 Processing brand: coca_cola (3 logos)
  ✓ Uploaded: logo-1.webp → logo_primary (673abc...)
  ✓ Uploaded: logo-2.webp → logo_variant_1 (673def...)
  ✓ Updated brand document with 2 logo(s)
...

✅ Logo upload completed in 315.42s
```

**Note**: This may take a while depending on:
- Number of brands with logos
- Number of logo variants per brand
- Network speed
- Appwrite server location

If interrupted, resume with:
```bash
npm run migrate:logos:resume
```

### Step 17: Verify Logos in Appwrite Console

1. Go to **Storage > brand-logos**
2. You should see hundreds of logo files
3. Click on a file to preview
4. Check that images display correctly

---

## Phase 7: Frontend Integration

### Step 18: Enable Appwrite in Frontend

The Appwrite integration files have been created but are not active yet.

#### Activate Appwrite Brand Store

1. Backup current store:
   ```bash
   mv src/stores/brandStore.ts src/stores/brandStore.legacy.ts
   ```

2. Activate Appwrite store:
   ```bash
   mv src/stores/brandStore.appwrite.ts src/stores/brandStore.ts
   ```

#### Activate Appwrite Logo Utils

1. Backup current utils:
   ```bash
   mv src/utils/logoUtils.ts src/utils/logoUtils.legacy.ts
   ```

2. Activate Appwrite utils:
   ```bash
   mv src/utils/logoUtils.appwrite.ts src/utils/logoUtils.ts
   ```

### Step 19: Test Locally

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173` and verify:

1. **Dashboard Page**:
   - ✅ Statistics load correctly
   - ✅ Top companies display
   - ✅ Brand count matches

2. **Network Graph**:
   - ✅ Graph renders
   - ✅ Logos display (if migrated)
   - ✅ Relationships are correct

3. **Categories Page**:
   - ✅ All categories show
   - ✅ Brand counts are correct
   - ✅ Brands list when clicking category

4. **Search**:
   - ✅ Search works
   - ✅ Results are relevant
   - ✅ Filtering works

5. **Company Details**:
   - ✅ Click on a company
   - ✅ Brands list loads
   - ✅ Subsidiaries display

### Step 20: Check Browser Console

Open browser DevTools (F12) and check console:

Expected messages:
```
Loading data from Appwrite...
✓ Loaded 213 companies and 279 brands from Appwrite
```

If you see errors:
1. Check `.env` configuration
2. Verify Appwrite project is accessible
3. Check network tab for failed requests
4. Review Appwrite Console for permission issues

---

## Phase 8: Testing & Validation

### Step 21: Performance Testing

Compare load times:

1. **Before (Static JSON)**:
   - Open DevTools > Network
   - Refresh page
   - Check time to load `brands.json`
   - Note: Usually 50-200ms

2. **After (Appwrite)**:
   - Refresh page
   - Check time to load data
   - Note: Usually 200-500ms (depends on location)

Appwrite may be slightly slower initially but enables:
- Pagination (faster for large datasets)
- Server-side filtering
- Real-time updates

### Step 22: Data Integrity Check

Run these checks in browser console:

```javascript
// Get store
const store = useBrandStore()

// Check totals
console.log('Companies:', store.companies.length) // Should be 213
console.log('Brands:', store.brands.length)       // Should be 279

// Check relationships
const orphanBrands = store.brands.filter(b =>
  !store.companies.find(c => c.id === b.owner_id)
)
console.log('Orphan brands:', orphanBrands) // Should be []

// Check logos (if migrated)
const brandsWithLogos = store.brands.filter(b => b.logo_primary)
console.log('Brands with logos:', brandsWithLogos.length)
```

All checks should pass.

---

## Phase 9: Deployment

### Step 23: Update Production Environment

1. Set environment variables in your hosting platform:
   - Vercel: Settings > Environment Variables
   - Netlify: Site settings > Build & deploy > Environment
   - Other: Follow provider documentation

2. Add:
   ```
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT=your-production-project-id
   ```

   **Note**: Do NOT add `APPWRITE_API_KEY` to frontend - it's only for migration scripts

### Step 24: Build & Deploy

1. Build production bundle:
   ```bash
   npm run build
   ```

2. Test production build locally:
   ```bash
   npm run preview
   ```

3. Deploy to your hosting platform:
   ```bash
   # Example for Vercel
   vercel --prod

   # Example for Netlify
   netlify deploy --prod
   ```

4. Visit production URL and verify everything works

---

## Troubleshooting

### Issue: "Failed to load data from Appwrite"

**Cause**: Appwrite configuration or permissions issue

**Solutions**:
1. Check `.env` file has correct values
2. Verify project ID is correct
3. Check collection permissions (should allow "Any" to read)
4. Verify platform is configured for your domain

### Issue: "Logos not displaying"

**Cause**: Logo upload incomplete or permissions issue

**Solutions**:
1. Check logos were uploaded: Go to Storage in Appwrite Console
2. Verify bucket permissions allow public read
3. Check brand documents have `logo_primary` field
4. Review browser console for 404 errors

### Issue: "Migration script fails with 401 Unauthorized"

**Cause**: Invalid or missing API key

**Solutions**:
1. Check `APPWRITE_API_KEY` in `.env`
2. Verify API key has correct scopes
3. Check API key hasn't expired
4. Try creating a new API key

### Issue: "Document with the requested ID already exists"

**Cause**: Running migration twice

**Solutions**:
1. This is normal if re-running migration
2. Use `--skip-existing` flag to skip duplicates
3. Or delete all documents in Appwrite Console and re-run

### Issue: "Rate limit exceeded"

**Cause**: Too many requests too quickly

**Solutions**:
1. Wait 1 minute and retry
2. Migration scripts have built-in rate limiting
3. For Appwrite Cloud, upgrade to Pro tier for higher limits

---

## Rollback Plan

If you need to rollback to static JSON:

1. **Restore original files**:
   ```bash
   mv src/stores/brandStore.legacy.ts src/stores/brandStore.ts
   mv src/utils/logoUtils.legacy.ts src/utils/logoUtils.ts
   ```

2. **Remove Appwrite config**:
   ```bash
   rm .env
   ```

3. **Restart dev server**:
   ```bash
   npm run dev
   ```

App will work with static JSON again.

---

## Next Steps

After successful migration, consider:

1. **Enable Authentication**:
   - Add user login
   - Restrict create/update/delete to admins
   - See `docs/APPWRITE_MIGRATION_PLAN.md` Phase 3

2. **Add Real-time Updates**:
   - Subscribe to database changes
   - Show live updates in UI
   - See `docs/APPWRITE_MIGRATION_PLAN.md` Phase 4

3. **Build Admin Dashboard**:
   - Add/edit brands via UI
   - Upload logos directly
   - Manage companies

4. **Optimize Performance**:
   - Implement pagination
   - Add caching
   - Use Appwrite Functions for heavy processing

---

## Support

- **Appwrite Docs**: https://appwrite.io/docs
- **Appwrite Discord**: https://appwrite.io/discord
- **Project Issues**: Create issue in project repository

---

**Migration Guide Version**: 1.0
**Last Updated**: 2025-11-08
**Status**: Ready for use
