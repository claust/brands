#!/usr/bin/env tsx
/**
 * Appwrite Data Migration Script
 *
 * This script migrates brand and company data from the static JSON file
 * to Appwrite database collections.
 *
 * Prerequisites:
 * 1. Appwrite project created
 * 2. Database and collections created (see APPWRITE_MIGRATION_PLAN.md)
 * 3. APPWRITE_API_KEY environment variable set (server-side API key)
 *
 * Usage:
 *   npm run migrate:appwrite
 *   npm run migrate:appwrite -- --dry-run  # Test without writing
 *   npm run migrate:appwrite -- --companies-only  # Migrate companies only
 *   npm run migrate:appwrite -- --brands-only  # Migrate brands only
 */

import { Client, Databases, ID } from 'appwrite'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

// Configuration
const APPWRITE_ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
const APPWRITE_PROJECT = process.env.VITE_APPWRITE_PROJECT || ''
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || ''

const DATABASE_ID = 'brands_db'
const COMPANIES_COLLECTION = 'companies'
const BRANDS_COLLECTION = 'brands'

const PROGRESS_FILE = join(__dirname, 'migration-progress.json')
const DATA_FILE = join(__dirname, '..', 'public', 'brands.json')

// Parse command line arguments
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const companiesOnly = args.includes('--companies-only')
const brandsOnly = args.includes('--brands-only')
const skipExisting = args.includes('--skip-existing')

// Types
interface Company {
  id: string
  name: string
  parent_id: string | null
}

interface Brand {
  id: string
  name: string
  owner_id: string
  category: string
}

interface BrandsData {
  companies: Company[]
  brands: Brand[]
}

interface MigrationProgress {
  companiesMigrated: string[]
  brandsMigrated: string[]
  companiesFailed: Array<{ id: string; error: string }>
  brandsFailed: Array<{ id: string; error: string }>
  lastRun: string
}

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT)
  .setKey(APPWRITE_API_KEY)

const databases = new Databases(client)

// Utility functions
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function loadProgress(): MigrationProgress {
  if (existsSync(PROGRESS_FILE)) {
    const content = readFileSync(PROGRESS_FILE, 'utf-8')
    return JSON.parse(content)
  }
  return {
    companiesMigrated: [],
    brandsMigrated: [],
    companiesFailed: [],
    brandsFailed: [],
    lastRun: ''
  }
}

function saveProgress(progress: MigrationProgress): void {
  progress.lastRun = new Date().toISOString()
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2))
}

function loadBrandsData(): BrandsData {
  const content = readFileSync(DATA_FILE, 'utf-8')
  return JSON.parse(content)
}

// Validation
function validateConfiguration(): void {
  if (!APPWRITE_ENDPOINT) {
    console.error('❌ VITE_APPWRITE_ENDPOINT not set')
    process.exit(1)
  }

  if (!APPWRITE_PROJECT) {
    console.error('❌ VITE_APPWRITE_PROJECT not set')
    process.exit(1)
  }

  if (!APPWRITE_API_KEY) {
    console.error('❌ APPWRITE_API_KEY not set')
    console.error('   Get your API key from Appwrite Console > Settings > API Keys')
    console.error('   Create a new key with "databases.write" scope')
    process.exit(1)
  }

  if (!existsSync(DATA_FILE)) {
    console.error(`❌ Data file not found: ${DATA_FILE}`)
    process.exit(1)
  }
}

// Migration functions
async function migrateCompanies(
  companies: Company[],
  progress: MigrationProgress
): Promise<void> {
  console.log(`\n📦 Migrating ${companies.length} companies...`)

  let migrated = 0
  let skipped = 0
  let failed = 0

  for (const company of companies) {
    // Skip if already migrated
    if (skipExisting && progress.companiesMigrated.includes(company.id)) {
      skipped++
      continue
    }

    try {
      const documentData = {
        name: company.name,
        slug: slugify(company.name),
        parent_id: company.parent_id,
        description: '',
        website: '',
        is_public: false,
        industry: []
      }

      if (isDryRun) {
        console.log(`[DRY RUN] Would create company: ${company.name}`)
      } else {
        await databases.createDocument(
          DATABASE_ID,
          COMPANIES_COLLECTION,
          company.id,
          documentData
        )
        progress.companiesMigrated.push(company.id)
        console.log(`✓ Migrated company: ${company.name} (${company.id})`)
      }

      migrated++
    } catch (error: any) {
      failed++
      const errorMessage = error.message || String(error)
      console.error(`✗ Failed to migrate company ${company.name}:`, errorMessage)

      // Only log as failure if not a duplicate
      if (!errorMessage.includes('Document with the requested ID already exists')) {
        progress.companiesFailed.push({
          id: company.id,
          error: errorMessage
        })
      } else {
        // Count as migrated if it already exists
        if (!progress.companiesMigrated.includes(company.id)) {
          progress.companiesMigrated.push(company.id)
        }
        skipped++
        failed--
      }
    }

    // Save progress every 10 items
    if (migrated % 10 === 0 && !isDryRun) {
      saveProgress(progress)
    }
  }

  console.log(`\n📊 Companies Summary:`)
  console.log(`   ✓ Migrated: ${migrated}`)
  console.log(`   ⊘ Skipped: ${skipped}`)
  console.log(`   ✗ Failed: ${failed}`)
}

async function migrateBrands(brands: Brand[], progress: MigrationProgress): Promise<void> {
  console.log(`\n📦 Migrating ${brands.length} brands...`)

  let migrated = 0
  let skipped = 0
  let failed = 0

  for (const brand of brands) {
    // Skip if already migrated
    if (skipExisting && progress.brandsMigrated.includes(brand.id)) {
      skipped++
      continue
    }

    try {
      const documentData = {
        name: brand.name,
        slug: slugify(brand.name),
        owner_id: brand.owner_id,
        category: brand.category,
        sub_category: '',
        description: '',
        website: '',
        is_active: true,
        market_regions: [],
        tags: []
      }

      if (isDryRun) {
        console.log(`[DRY RUN] Would create brand: ${brand.name}`)
      } else {
        await databases.createDocument(
          DATABASE_ID,
          BRANDS_COLLECTION,
          brand.id,
          documentData
        )
        progress.brandsMigrated.push(brand.id)
        console.log(`✓ Migrated brand: ${brand.name} (${brand.id})`)
      }

      migrated++
    } catch (error: any) {
      failed++
      const errorMessage = error.message || String(error)
      console.error(`✗ Failed to migrate brand ${brand.name}:`, errorMessage)

      // Only log as failure if not a duplicate
      if (!errorMessage.includes('Document with the requested ID already exists')) {
        progress.brandsFailed.push({
          id: brand.id,
          error: errorMessage
        })
      } else {
        // Count as migrated if it already exists
        if (!progress.brandsMigrated.includes(brand.id)) {
          progress.brandsMigrated.push(brand.id)
        }
        skipped++
        failed--
      }
    }

    // Save progress every 10 items
    if (migrated % 10 === 0 && !isDryRun) {
      saveProgress(progress)
    }
  }

  console.log(`\n📊 Brands Summary:`)
  console.log(`   ✓ Migrated: ${migrated}`)
  console.log(`   ⊘ Skipped: ${skipped}`)
  console.log(`   ✗ Failed: ${failed}`)
}

// Main migration function
async function main(): Promise<void> {
  console.log('🚀 Appwrite Data Migration Tool\n')
  console.log('Configuration:')
  console.log(`  Endpoint: ${APPWRITE_ENDPOINT}`)
  console.log(`  Project: ${APPWRITE_PROJECT}`)
  console.log(`  Database: ${DATABASE_ID}`)
  console.log(`  Dry Run: ${isDryRun ? 'YES' : 'NO'}`)
  console.log(`  Skip Existing: ${skipExisting ? 'YES' : 'NO'}`)
  console.log('')

  // Validate configuration
  validateConfiguration()

  // Load data and progress
  const data = loadBrandsData()
  const progress = loadProgress()

  console.log(`📊 Data Statistics:`)
  console.log(`  Companies: ${data.companies.length}`)
  console.log(`  Brands: ${data.brands.length}`)
  console.log(`  Previously Migrated Companies: ${progress.companiesMigrated.length}`)
  console.log(`  Previously Migrated Brands: ${progress.brandsMigrated.length}`)

  // Confirm before proceeding
  if (!isDryRun) {
    console.log('\n⚠️  This will write data to Appwrite database.')
    console.log('   Press Ctrl+C to cancel, or wait 3 seconds to continue...\n')
    await new Promise((resolve) => setTimeout(resolve, 3000))
  }

  const startTime = Date.now()

  // Migrate companies first (they are referenced by brands)
  if (!brandsOnly) {
    await migrateCompanies(data.companies, progress)
  }

  // Migrate brands
  if (!companiesOnly) {
    await migrateBrands(data.brands, progress)
  }

  // Save final progress
  if (!isDryRun) {
    saveProgress(progress)
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2)

  console.log(`\n✅ Migration completed in ${duration}s`)

  if (!isDryRun) {
    console.log(`   Progress saved to: ${PROGRESS_FILE}`)
  }

  // Report failures
  if (progress.companiesFailed.length > 0 || progress.brandsFailed.length > 0) {
    console.log('\n⚠️  Some items failed to migrate:')
    if (progress.companiesFailed.length > 0) {
      console.log(`   Companies: ${progress.companiesFailed.length}`)
      progress.companiesFailed.forEach(({ id, error }) => {
        console.log(`     - ${id}: ${error}`)
      })
    }
    if (progress.brandsFailed.length > 0) {
      console.log(`   Brands: ${progress.brandsFailed.length}`)
      progress.brandsFailed.forEach(({ id, error }) => {
        console.log(`     - ${id}: ${error}`)
      })
    }
  }

  console.log('\n📝 Next Steps:')
  console.log('   1. Verify data in Appwrite Console')
  console.log('   2. Run logo migration: npm run migrate:logos')
  console.log('   3. Update frontend to use Appwrite SDK')
  console.log('   4. Test application thoroughly')
  console.log('')
}

// Run migration
main().catch((error) => {
  console.error('\n❌ Migration failed:', error)
  process.exit(1)
})
