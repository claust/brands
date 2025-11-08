/**
 * Logo Utilities - Appwrite Version
 *
 * Enhanced logo utilities that support both:
 * 1. File system logos (legacy, fallback)
 * 2. Appwrite Storage logos (new, preferred)
 *
 * To use this:
 * 1. Rename logoUtils.ts to logoUtils.legacy.ts
 * 2. Rename this file to logoUtils.ts
 * 3. Update Brand type to include logo file IDs
 */

import { storage, LOGOS_BUCKET, isAppwriteConfigured } from '@/lib/appwrite'
import type { Brand } from '@/types'

const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || ''
const useAppwrite = isAppwriteConfigured()

export interface LogoOptions {
  width?: number
  height?: number
  quality?: number
  output?: 'webp' | 'png' | 'jpg'
}

/**
 * Get logo URL from Appwrite Storage
 * @param fileId - Appwrite file ID
 * @param options - Image transformation options
 * @returns Complete URL to the logo
 */
export function getAppwriteLogoUrl(
  fileId: string | undefined,
  options: LogoOptions = {}
): string {
  if (!fileId || !useAppwrite) {
    return '' // Return empty string if no file ID or Appwrite not configured
  }

  const params = new URLSearchParams()

  // Add image transformation parameters
  if (options.width) params.append('width', options.width.toString())
  if (options.height) params.append('height', options.height.toString())
  if (options.quality) params.append('quality', options.quality.toString())
  if (options.output) params.append('output', options.output)

  // Default to WebP if no output specified
  if (!options.output) params.append('output', 'webp')

  const baseUrl = `${APPWRITE_ENDPOINT}/storage/buckets/${LOGOS_BUCKET}/files/${fileId}/view`
  return params.toString() ? `${baseUrl}?${params}` : baseUrl
}

/**
 * Get logo URL for a brand (Appwrite-aware)
 * Falls back to file system if Appwrite not configured
 *
 * @param brand - Brand object (with logo file IDs if using Appwrite)
 * @param variant - Logo variant ('primary', 'variant_1', 'variant_2')
 * @param options - Image transformation options
 * @returns Logo URL
 */
export function getBrandLogo(
  brand: Brand & {
    logo_primary?: string
    logo_variant_1?: string
    logo_variant_2?: string
  },
  variant: 'primary' | 'variant_1' | 'variant_2' = 'primary',
  options: LogoOptions = { width: 200, height: 200, quality: 85 }
): string {
  if (useAppwrite) {
    // Use Appwrite Storage
    const fileIdMap = {
      primary: brand.logo_primary,
      variant_1: brand.logo_variant_1,
      variant_2: brand.logo_variant_2
    }

    const fileId = fileIdMap[variant]
    if (fileId) {
      return getAppwriteLogoUrl(fileId, options)
    }

    // Try other variants if preferred one doesn't exist
    for (const v of Object.values(fileIdMap)) {
      if (v) {
        return getAppwriteLogoUrl(v, options)
      }
    }
  }

  // Fallback to file system
  return getBrandLogoPath(brand.name, variant === 'primary' ? 1 : variant === 'variant_1' ? 2 : 3)
}

/**
 * Generate logo path for file system (legacy)
 * @param brandName - The brand name
 * @param variant - Logo variant (1, 2, or 3)
 * @returns The logo path
 */
export function getBrandLogoPath(brandName: string, variant: number = 1): string {
  if (!brandName) return ''

  // Convert brand name to folder format (lowercase, spaces to underscores)
  const folderName = brandName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')

  // Return path to logo variant
  return `/logos/${folderName}/logo-${variant}.webp`
}

/**
 * Get all available logo variants for a brand
 * @param brand - Brand object
 * @returns Array of logo URLs
 */
export function getBrandLogoVariants(
  brand: Brand & {
    logo_primary?: string
    logo_variant_1?: string
    logo_variant_2?: string
  }
): string[] {
  if (useAppwrite) {
    const urls: string[] = []

    if (brand.logo_primary) {
      urls.push(getAppwriteLogoUrl(brand.logo_primary, { width: 200, height: 200, quality: 85 }))
    }
    if (brand.logo_variant_1) {
      urls.push(
        getAppwriteLogoUrl(brand.logo_variant_1, { width: 200, height: 200, quality: 85 })
      )
    }
    if (brand.logo_variant_2) {
      urls.push(
        getAppwriteLogoUrl(brand.logo_variant_2, { width: 200, height: 200, quality: 85 })
      )
    }

    return urls
  }

  // Fallback to file system
  return [1, 2, 3].map((variant) => getBrandLogoPath(brand.name, variant))
}

/**
 * Get logo thumbnail (smaller size for lists)
 * @param brand - Brand object
 * @param variant - Logo variant
 * @returns Thumbnail URL
 */
export function getBrandLogoThumbnail(
  brand: Brand & {
    logo_primary?: string
    logo_variant_1?: string
    logo_variant_2?: string
  },
  variant: 'primary' | 'variant_1' | 'variant_2' = 'primary'
): string {
  return getBrandLogo(brand, variant, { width: 50, height: 50, quality: 80 })
}

/**
 * Get logo for display in network graph
 * @param brand - Brand object
 * @returns Optimized logo URL for network visualization
 */
export function getBrandLogoForNetwork(
  brand: Brand & {
    logo_primary?: string
    logo_variant_1?: string
    logo_variant_2?: string
  }
): string {
  return getBrandLogo(brand, 'primary', { width: 100, height: 100, quality: 85 })
}

/**
 * Check if a logo exists by attempting to load it
 * @param logoUrl - URL or path to the logo
 * @returns Promise that resolves to true if logo exists
 */
export function checkLogoExists(logoUrl: string): Promise<boolean> {
  if (!logoUrl) return Promise.resolve(false)

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = logoUrl
  })
}

/**
 * Get the first available logo for a brand
 * @param brand - Brand object
 * @returns Promise that resolves to the first available logo URL or empty string
 */
export async function getAvailableBrandLogo(
  brand: Brand & {
    logo_primary?: string
    logo_variant_1?: string
    logo_variant_2?: string
  }
): Promise<string> {
  const variants = getBrandLogoVariants(brand)

  for (const logoUrl of variants) {
    const exists = await checkLogoExists(logoUrl)
    if (exists) {
      return logoUrl
    }
  }

  return ''
}

/**
 * Get placeholder logo URL
 * @returns URL to placeholder/default logo
 */
export function getPlaceholderLogo(): string {
  return '/placeholder-logo.png' // You should add this to public/
}

/**
 * Get logo with fallback to placeholder
 * @param brand - Brand object
 * @param variant - Logo variant
 * @returns Logo URL or placeholder
 */
export function getBrandLogoWithFallback(
  brand: Brand & {
    logo_primary?: string
    logo_variant_1?: string
    logo_variant_2?: string
  },
  variant: 'primary' | 'variant_1' | 'variant_2' = 'primary'
): string {
  const logo = getBrandLogo(brand, variant)
  return logo || getPlaceholderLogo()
}

/**
 * Download logo file (for export/backup)
 * @param brand - Brand object
 * @param variant - Logo variant
 */
export async function downloadBrandLogo(
  brand: Brand & {
    logo_primary?: string
    logo_variant_1?: string
    logo_variant_2?: string
  },
  variant: 'primary' | 'variant_1' | 'variant_2' = 'primary'
): Promise<void> {
  const logoUrl = getBrandLogo(brand, variant, { quality: 100 })

  if (!logoUrl) {
    console.error('No logo available for download')
    return
  }

  try {
    const response = await fetch(logoUrl)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${brand.name.replace(/\s+/g, '_')}_${variant}.webp`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to download logo:', error)
  }
}

/**
 * Preload logos for better performance
 * @param brands - Array of brands to preload logos for
 */
export function preloadBrandLogos(
  brands: Array<
    Brand & {
      logo_primary?: string
      logo_variant_1?: string
      logo_variant_2?: string
    }
  >,
  variant: 'primary' | 'variant_1' | 'variant_2' = 'primary'
): void {
  brands.forEach((brand) => {
    const logoUrl = getBrandLogo(brand, variant)
    if (logoUrl) {
      const img = new Image()
      img.src = logoUrl
    }
  })
}
