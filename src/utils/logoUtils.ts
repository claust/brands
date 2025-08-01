/**
 * Utility functions for brand logo handling
 */

/**
 * Generate logo path for a brand
 * @param brandName - The brand name
 * @param variant - Logo variant (1, 2, or 3)
 * @returns The logo path or fallback
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
 * @param brandName - The brand name
 * @returns Array of logo paths
 */
export function getBrandLogoVariants(brandName: string): string[] {
  return [1, 2, 3].map(variant => getBrandLogoPath(brandName, variant))
}

/**
 * Check if a logo exists by attempting to load it
 * @param logoPath - Path to the logo
 * @returns Promise that resolves to true if logo exists
 */
export function checkLogoExists(logoPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = logoPath
  })
}

/**
 * Get the first available logo for a brand
 * @param brandName - The brand name
 * @returns Promise that resolves to the first available logo path or empty string
 */
export async function getAvailableBrandLogo(brandName: string): Promise<string> {
  const variants = getBrandLogoVariants(brandName)
  
  for (const logoPath of variants) {
    const exists = await checkLogoExists(logoPath)
    if (exists) {
      return logoPath
    }
  }
  
  return ''
}