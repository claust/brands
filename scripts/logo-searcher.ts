import { chromium, Browser, Page } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import type {
  BrandsData,
  Brand,
  BrandLogoData,
  SearchProgress,
  LogoSearcherOptions,
  LogoSearchResult
} from './logo-searcher-types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class LogoSearcher {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private brandsData: BrandsData;
  private progress: SearchProgress;
  private options: Required<LogoSearcherOptions>;
  private logosDir: string;
  private progressFile: string;

  constructor(brandsData: BrandsData, options: LogoSearcherOptions = {}) {
    this.brandsData = brandsData;
    this.options = {
      resume: options.resume ?? false,
      specificBrand: options.specificBrand ?? '',
      maxLogosPerBrand: options.maxLogosPerBrand ?? 3,
      delayBetweenSearches: options.delayBetweenSearches ?? 2000,
      outputDir: options.outputDir ?? path.join(__dirname, '../../public/logos'),
      limit: options.limit ?? 0
    };
    
    this.logosDir = this.options.outputDir;
    this.progressFile = path.join(__dirname, 'logo-search-progress.json');
    
    this.progress = {
      lastProcessedIndex: -1,
      totalBrands: this.brandsData.brands.length,
      completedBrands: [],
      failedBrands: [],
      startTime: new Date().toISOString(),
      lastUpdateTime: new Date().toISOString()
    };
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Logo Searcher...');
    
    // Create output directory
    await fs.mkdir(this.logosDir, { recursive: true });
    
    // Load existing progress if resuming
    if (this.options.resume) {
      await this.loadProgress();
    }
    
    // Launch browser
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();
    
    console.log(`📊 Total brands to process: ${this.brandsData.brands.length}`);
    if (this.options.resume && this.progress.completedBrands.length > 0) {
      console.log(`🔄 Resuming from brand #${this.progress.lastProcessedIndex + 1}`);
      console.log(`✅ Already completed: ${this.progress.completedBrands.length} brands`);
    }
  }

  async searchAllLogos(): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    let brands = this.options.specificBrand 
      ? this.brandsData.brands.filter(b => b.id === this.options.specificBrand || b.name.toLowerCase().includes(this.options.specificBrand.toLowerCase()))
      : this.brandsData.brands;

    // Apply limit if specified
    if (this.options.limit > 0) {
      brands = brands.slice(0, this.options.limit);
      console.log(`🎯 Limited to first ${this.options.limit} brands for testing`);
    }

    const startIndex = this.options.resume ? this.progress.lastProcessedIndex + 1 : 0;
    
    for (let i = startIndex; i < brands.length; i++) {
      const brand = brands[i];
      
      // Skip if already completed
      if (this.progress.completedBrands.includes(brand.id)) {
        console.log(`⏭️  Skipping ${brand.name} (already completed)`);
        continue;
      }

      try {
        console.log(`\n🔍 [${i + 1}/${brands.length}] Searching logos for: ${brand.name}`);
        
        const logoData = await this.searchBrandLogos(brand);
        
        if (logoData.status === 'success') {
          this.progress.completedBrands.push(brand.id);
          console.log(`✅ Found ${logoData.logos.length} logos for ${brand.name}`);
        } else {
          this.progress.failedBrands.push(brand.id);
          console.log(`❌ Failed to find logos for ${brand.name}: ${logoData.error}`);
        }
        
        this.progress.lastProcessedIndex = i;
        this.progress.lastUpdateTime = new Date().toISOString();
        await this.saveProgress();
        
        // Delay between searches to be respectful
        await this.delay(this.options.delayBetweenSearches);
        
      } catch (error) {
        console.error(`💥 Error processing ${brand.name}:`, error);
        this.progress.failedBrands.push(brand.id);
        this.progress.lastProcessedIndex = i;
        await this.saveProgress();
      }
    }

    console.log('\n🎉 Logo search completed!');
    console.log(`✅ Successful: ${this.progress.completedBrands.length}`);
    console.log(`❌ Failed: ${this.progress.failedBrands.length}`);
  }

  private async searchBrandLogos(brand: Brand): Promise<BrandLogoData> {
    if (!this.page) {
      throw new Error('Browser page not available');
    }

    const brandLogoData: BrandLogoData = {
      brandId: brand.id,
      brandName: brand.name,
      searchDate: new Date().toISOString(),
      status: 'failed',
      logos: []
    };

    try {
      // Navigate to Bing Images
      const searchQuery = encodeURIComponent(`${brand.name} logo`);
      await this.page.goto(`https://www.bing.com/images/search?q=${searchQuery}`);
      
      // Wait for images to load
      await this.page.waitForLoadState('networkidle');
      await this.delay(3000);
      
      // Get image elements from Bing Images
      const imageElements = await this.page.$$('.iusc[m] img, .imgpt img');
      console.log(`  📍 Found ${imageElements.length} images`);
      const maxImages = Math.min(this.options.maxLogosPerBrand, imageElements.length);
      
      if (imageElements.length === 0) {
        brandLogoData.error = 'No images found in search results';
        return brandLogoData;
      }

      // Extract all image URLs first to avoid context issues
      const imageUrls: string[] = [];
      for (let i = 0; i < maxImages; i++) {
        try {
          const img = imageElements[i];
          const src = (await img.getAttribute('src')) || (await img.getAttribute('data-src'));
          
          if (src && !src.startsWith('data:')) {
            imageUrls.push(src);
          }
        } catch (error) {
          console.log(`⚠️  Failed to extract URL for image ${i + 1}:`, error);
        }
      }
      
      // Create brand directory
      const brandDir = path.join(this.logosDir, brand.id);
      await fs.mkdir(brandDir, { recursive: true });
      
      // Download images using extracted URLs
      for (let i = 0; i < imageUrls.length; i++) {
        try {
          const logoResult = await this.downloadImage(imageUrls[i], brandDir, `logo-${i + 1}`);
          if (logoResult) {
            brandLogoData.logos.push(logoResult);
          }
        } catch (error) {
          console.log(`⚠️  Failed to download image ${i + 1} for ${brand.name}:`, error);
        }
      }
      
      brandLogoData.status = brandLogoData.logos.length > 0 ? 'success' : 'failed';
      if (brandLogoData.status === 'failed') {
        brandLogoData.error = 'No images could be downloaded';
      }
      
    } catch (error) {
      brandLogoData.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return brandLogoData;
  }

  private async downloadImage(url: string, dir: string, baseName: string): Promise<LogoSearchResult | null> {
    if (!this.page) return null;

    try {
      const response = await this.page.goto(url);
      if (!response || !response.ok()) {
        return null;
      }

      const buffer = await response.body();
      const contentType = response.headers()['content-type'] || '';
      
      // Determine file extension
      let extension = 'jpg';
      if (contentType.includes('png')) extension = 'png';
      else if (contentType.includes('gif')) extension = 'gif';
      else if (contentType.includes('svg')) extension = 'svg';
      else if (contentType.includes('webp')) extension = 'webp';
      
      const filename = `${baseName}.${extension}`;
      const filepath = path.join(dir, filename);
      
      await fs.writeFile(filepath, buffer);
      
      return {
        url,
        filename,
        size: buffer.length,
        format: extension
      };
      
    } catch (error) {
      console.log(`Failed to download image from ${url}:`, error);
      return null;
    }
  }

  private async loadProgress(): Promise<void> {
    try {
      const data = await fs.readFile(this.progressFile, 'utf-8');
      this.progress = { ...this.progress, ...JSON.parse(data) };
    } catch {
      console.log('📝 No existing progress file found, starting fresh');
    }
  }

  private async saveProgress(): Promise<void> {
    await fs.writeFile(this.progressFile, JSON.stringify(this.progress, null, 2));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// CLI functionality
async function main() {
  const args = process.argv.slice(2);
  const options: LogoSearcherOptions = {};
  
  // Parse command line arguments
  for (const arg of args) {
    if (arg === '--resume') {
      options.resume = true;
    } else if (arg.startsWith('--brand=')) {
      options.specificBrand = arg.split('=')[1];
    } else if (arg.startsWith('--max-logos=')) {
      options.maxLogosPerBrand = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--delay=')) {
      options.delayBetweenSearches = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1]);
    }
  }

  try {
    // Load brands data
    const brandsPath = path.join(__dirname, '../data/brands.json');
    const brandsJson = await fs.readFile(brandsPath, 'utf-8');
    const brandsData: BrandsData = JSON.parse(brandsJson);
    
    // Create and run searcher
    const searcher = new LogoSearcher(brandsData, options);
    await searcher.initialize();
    await searcher.searchAllLogos();
    await searcher.cleanup();
    
    console.log('\n🏁 Logo search process completed successfully!');
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.resolve) {
  const isMainModule = import.meta.resolve(process.argv[1]) === import.meta.resolve(__filename);
  if (isMainModule) {
    main().catch(console.error);
  }
}

export default LogoSearcher;