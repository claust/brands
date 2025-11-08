#!/usr/bin/env tsx
/**
 * Appwrite Logo Upload Migration Script
 *
 * This script uploads brand logos from the local file system to Appwrite Storage
 * and updates brand documents with the file IDs.
 *
 * Prerequisites:
 * 1. Appwrite Storage bucket created (brand-logos)
 * 2. Brand documents already migrated to Appwrite
 * 3. APPWRITE_API_KEY environment variable set
 * 4. Logos exist in public/logos/[brand-id]/ directories
 *
 * Usage:
 *   npm run migrate:logos
 *   npm run migrate:logos -- --dry-run  # Test without uploading
 *   npm run migrate:logos -- --skip-existing  # Skip already uploaded logos
 */

import { Client, Storage, Databases, ID, InputFile } from 'appwrite'
import { readdir, readFile, stat, existsSync } from 'fs/promises'
import { join } from 'path'
import { writeFileSync, readFileSync } from 'fs'

// Configuration
const APPWRITE_ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
const APPWRITE_PROJECT = process.env.VITE_APPWRITE_PROJECT || ''
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || ''

const DATABASE_ID = 'brands_db'
const BRANDS_COLLECTION = 'brands'
const LOGOS_BUCKET = 'brand-logos'

const LOGOS_DIR = join(__dirname, '..', 'public', 'logos')
const PROGRESS_FILE = join(__dirname, 'logo-upload-progress.json')

// Parse command line arguments
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const skipExisting = args.includes('--skip-existing')

// Types
interface LogoUploadProgress {
  brandsProcessed: string[]
  logosUploaded: Array<{
    brandId: string
    fileName: string
    fileId: string
    variant: string
  }>
  failed: Array<{
    brandId: string
    fileName: string
    error: string
  }>
  lastRun: string
}

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT)
  .setKey(APPWRITE_API_KEY)

const storage = new Storage(client)
const databases = new Databases(client)

// Utility functions
function loadProgress(): LogoUploadProgress {
  if (existsSync(PROGRESS_FILE)) {
    const content = readFileSync(PROGRESS_FILE, 'utf-8')
    return JSON.parse(content)
  }
  return {
    brandsProcessed: [],
    logosUploaded: [],
    failed: [],
    lastRun: ''
  }
}

function saveProgress(progress: LogoUploadProgress): void {
  progress.lastRun = new Date().toISOString()
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2))
}

function getVariantFromFileName(fileName: string): string {
  if (fileName.includes('logo-1') || fileName.includes('primary')) {
    return 'logo_primary'
  } else if (fileName.includes('logo-2') || fileName.includes('variant-1')) {
    return 'logo_variant_1'
  } else if (fileName.includes('logo-3') || fileName.includes('variant-2')) {
    return 'logo_variant_2'
  }
  return 'logo_primary' // default
}

async function directoryExists(path: string): Promise<boolean> {
  try {
    const stats = await stat(path)
    return stats.isDirectory()
  } catch {
    return false
  }
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
    console.error('   Create a new key with "storage.write" and "databases.write" scopes')
    process.exit(1)
  }
}

async function uploadLogo(
  brandId: string,
  fileName: string,
  filePath: string
): Promise<string | null> {
  try {
    const fileBuffer = await readFile(filePath)

    // Determine file type
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'webp'
    const mimeTypes: Record<string, string> = {
      webp: 'image/webp',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      svg: 'image/svg+xml'
    }
    const mimeType = mimeTypes[fileExtension] || 'image/webp'

    // Create unique file ID based on brand and variant
    const variant = getVariantFromFileName(fileName)
    const fileId = `${brandId}_${variant}_${Date.now()}`

    if (isDryRun) {
      console.log(`[DRY RUN] Would upload: ${fileName} as ${fileId}`)
      return fileId
    }

    // Upload to Appwrite Storage
    const result = await storage.createFile(
      LOGOS_BUCKET,
      fileId,
      InputFile.fromBuffer(fileBuffer, fileName),
      // Permission: anyone can read
      // Note: File-level permissions set via bucket configuration
    )

    return result.$id
  } catch (error: any) {
    console.error(`  ✗ Failed to upload ${fileName}:`, error.message)
    return null
  }
}

async function updateBrandWithLogos(
  brandId: string,
  logoMapping: Record<string, string>
): Promise<boolean> {
  try {
    if (isDryRun) {
      console.log(`[DRY RUN] Would update brand ${brandId} with logos:`, logoMapping)
      return true
    }

    await databases.updateDocument(DATABASE_ID, BRANDS_COLLECTION, brandId, logoMapping)
    return true
  } catch (error: any) {
    console.error(`  ✗ Failed to update brand ${brandId}:`, error.message)
    return false
  }
}

async function processBrandLogos(
  brandId: string,
  progress: LogoUploadProgress
): Promise<void> {
  const brandLogoDir = join(LOGOS_DIR, brandId)

  // Check if brand has logos
  if (!(await directoryExists(brandLogoDir))) {
    console.log(`  ⊘ No logos directory for brand: ${brandId}`)
    return
  }

  try {
    const files = await readdir(brandLogoDir)
    const logoFiles = files.filter((f) =>
      /\.(webp|png|jpe?g|svg)$/i.test(f)
    )

    if (logoFiles.length === 0) {
      console.log(`  ⊘ No logo files found for brand: ${brandId}`)
      return
    }

    console.log(`\n📸 Processing brand: ${brandId} (${logoFiles.length} logos)`)

    const logoMapping: Record<string, string> = {}
    let uploadedCount = 0

    for (const fileName of logoFiles) {
      const filePath = join(brandLogoDir, fileName)
      const variant = getVariantFromFileName(fileName)

      // Skip if already uploaded
      if (
        skipExisting &&
        progress.logosUploaded.some(
          (l) => l.brandId === brandId && l.variant === variant
        )
      ) {
        console.log(`  ⊘ Skipped (already uploaded): ${fileName}`)
        continue
      }

      // Upload logo
      const fileId = await uploadLogo(brandId, fileName, filePath)

      if (fileId) {
        logoMapping[variant] = fileId
        progress.logosUploaded.push({
          brandId,
          fileName,
          fileId,
          variant
        })
        uploadedCount++
        console.log(`  ✓ Uploaded: ${fileName} → ${variant} (${fileId})`)
      } else {
        progress.failed.push({
          brandId,
          fileName,
          error: 'Upload failed'
        })
      }
    }

    // Update brand document with logo file IDs
    if (Object.keys(logoMapping).length > 0) {
      const updated = await updateBrandWithLogos(brandId, logoMapping)
      if (updated) {
        console.log(`  ✓ Updated brand document with ${uploadedCount} logo(s)`)
        progress.brandsProcessed.push(brandId)
      }
    }
  } catch (error: any) {
    console.error(`  ✗ Error processing brand ${brandId}:`, error.message)
    progress.failed.push({
      brandId,
      fileName: 'N/A',
      error: error.message
    })
  }
}

async function main(): Promise<void> {
  console.log('🚀 Appwrite Logo Upload Migration Tool\n')
  console.log('Configuration:')
  console.log(`  Endpoint: ${APPWRITE_ENDPOINT}`)
  console.log(`  Project: ${APPWRITE_PROJECT}`)
  console.log(`  Bucket: ${LOGOS_BUCKET}`)
  console.log(`  Logos Directory: ${LOGOS_DIR}`)
  console.log(`  Dry Run: ${isDryRun ? 'YES' : 'NO'}`)
  console.log(`  Skip Existing: ${skipExisting ? 'YES' : 'NO'}`)
  console.log('')

  // Validate configuration
  validateConfiguration()

  // Check if logos directory exists
  if (!(await directoryExists(LOGOS_DIR))) {
    console.error(`❌ Logos directory not found: ${LOGOS_DIR}`)
    console.error('   Run logo-searcher first to download logos')
    process.exit(1)
  }

  // Load progress
  const progress = loadProgress()

  console.log(`📊 Previous Progress:`)
  console.log(`  Brands Processed: ${progress.brandsProcessed.length}`)
  console.log(`  Logos Uploaded: ${progress.logosUploaded.length}`)
  console.log(`  Failed: ${progress.failed.length}`)

  // Confirm before proceeding
  if (!isDryRun) {
    console.log('\n⚠️  This will upload logos to Appwrite Storage.')
    console.log('   Press Ctrl+C to cancel, or wait 3 seconds to continue...\n')
    await new Promise((resolve) => setTimeout(resolve, 3000))
  }

  const startTime = Date.now()

  // Get all brand directories
  const brandDirs = await readdir(LOGOS_DIR)
  console.log(`\n📁 Found ${brandDirs.length} brand directories`)

  // Process each brand
  for (const brandId of brandDirs) {
    // Skip if already processed
    if (skipExisting && progress.brandsProcessed.includes(brandId)) {
      continue
    }

    await processBrandLogos(brandId, progress)

    // Save progress every 5 brands
    if (progress.brandsProcessed.length % 5 === 0 && !isDryRun) {
      saveProgress(progress)
    }
  }

  // Save final progress
  if (!isDryRun) {
    saveProgress(progress)
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2)

  console.log(`\n✅ Logo upload completed in ${duration}s`)
  console.log(`\n📊 Final Summary:`)
  console.log(`  ✓ Brands Processed: ${progress.brandsProcessed.length}`)
  console.log(`  ✓ Logos Uploaded: ${progress.logosUploaded.length}`)
  console.log(`  ✗ Failed: ${progress.failed.length}`)

  if (!isDryRun) {
    console.log(`\n💾 Progress saved to: ${PROGRESS_FILE}`)
  }

  // Report failures
  if (progress.failed.length > 0) {
    console.log('\n⚠️  Failed uploads:')
    progress.failed.forEach(({ brandId, fileName, error }) => {
      console.log(`   - ${brandId}/${fileName}: ${error}`)
    })
  }

  console.log('\n📝 Next Steps:')
  console.log('   1. Verify logos in Appwrite Console > Storage')
  console.log('   2. Update frontend logo utilities')
  console.log('   3. Test logo display in application')
  console.log('')
}

// Run migration
main().catch((error) => {
  console.error('\n❌ Logo upload failed:', error)
  process.exit(1)
})
