import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface StandardizationProgress {
  lastProcessedBrand: string;
  totalBrands: number;
  completedBrands: string[];
  failedBrands: string[];
  startTime: string;
  lastUpdateTime: string;
}

interface StandardizationOptions {
  resume?: boolean;
  limit?: number;
  targetSize?: number;
  targetFormat?: 'webp' | 'png';
  quality?: number;
  outputDir?: string;
  backupOriginals?: boolean;
}

interface LogoStandardizationResult {
  brandId: string;
  originalFiles: string[];
  standardizedFiles: string[];
  errors: string[];
  status: 'success' | 'failed' | 'partial';
}

export class LogoStandardizer {
  private options: Required<StandardizationOptions>;
  private progress: StandardizationProgress;
  private logosDir: string;
  private backupDir: string;
  private progressFile: string;

  constructor(options: StandardizationOptions = {}) {
    this.options = {
      resume: options.resume ?? false,
      limit: options.limit ?? 0,
      targetSize: options.targetSize ?? 200,
      targetFormat: options.targetFormat ?? 'webp',
      quality: options.quality ?? 85,
      outputDir: options.outputDir ?? path.join(__dirname, '../../public/logos'),
      backupOriginals: options.backupOriginals ?? true
    };
    
    this.logosDir = this.options.outputDir;
    this.backupDir = path.join(this.logosDir, '_originals_backup');
    this.progressFile = path.join(__dirname, 'logo-standardization-progress.json');
    
    this.progress = {
      lastProcessedBrand: '',
      totalBrands: 0,
      completedBrands: [],
      failedBrands: [],
      startTime: new Date().toISOString(),
      lastUpdateTime: new Date().toISOString()
    };
  }

  async initialize(): Promise<void> {
    console.log('🎨 Initializing Logo Standardizer...');
    console.log(`📐 Target size: ${this.options.targetSize}x${this.options.targetSize}px`);
    console.log(`📁 Target format: ${this.options.targetFormat.toUpperCase()}`);
    console.log(`🎯 Quality: ${this.options.quality}%`);
    
    // Create backup directory if needed
    if (this.options.backupOriginals) {
      await fs.mkdir(this.backupDir, { recursive: true });
      console.log(`💾 Backup directory created: ${this.backupDir}`);
    }
    
    // Load existing progress if resuming
    if (this.options.resume) {
      await this.loadProgress();
    }
  }

  async standardizeAllLogos(): Promise<void> {
    // Get all brand directories
    const brandDirs = await this.getBrandDirectories();
    
    if (brandDirs.length === 0) {
      console.log('📭 No brand directories found in logos folder');
      return;
    }

    // Apply limit if specified
    const dirsToProcess = this.options.limit > 0 
      ? brandDirs.slice(0, this.options.limit)
      : brandDirs;

    this.progress.totalBrands = dirsToProcess.length;
    console.log(`📊 Found ${brandDirs.length} brand directories`);
    if (this.options.limit > 0) {
      console.log(`🎯 Limited to first ${this.options.limit} brands for testing`);
    }

    let startIndex = 0;
    if (this.options.resume && this.progress.lastProcessedBrand) {
      startIndex = dirsToProcess.findIndex(dir => dir === this.progress.lastProcessedBrand) + 1;
      if (startIndex > 0) {
        console.log(`🔄 Resuming from brand: ${this.progress.lastProcessedBrand}`);
        console.log(`✅ Already completed: ${this.progress.completedBrands.length} brands`);
      }
    }

    for (let i = startIndex; i < dirsToProcess.length; i++) {
      const brandId = dirsToProcess[i];
      
      // Skip if already completed
      if (this.progress.completedBrands.includes(brandId)) {
        console.log(`⏭️  Skipping ${brandId} (already completed)`);
        continue;
      }

      try {
        console.log(`\n🔧 [${i + 1}/${dirsToProcess.length}] Standardizing logos for: ${brandId}`);
        
        const result = await this.standardizeBrandLogos(brandId);
        
        if (result.status === 'success') {
          this.progress.completedBrands.push(brandId);
          console.log(`✅ Standardized ${result.standardizedFiles.length} logos for ${brandId}`);
        } else if (result.status === 'partial') {
          this.progress.completedBrands.push(brandId);
          console.log(`⚠️  Partially standardized ${brandId}: ${result.standardizedFiles.length} success, ${result.errors.length} errors`);
        } else {
          this.progress.failedBrands.push(brandId);
          console.log(`❌ Failed to standardize ${brandId}: ${result.errors.join(', ')}`);
        }
        
        this.progress.lastProcessedBrand = brandId;
        this.progress.lastUpdateTime = new Date().toISOString();
        await this.saveProgress();
        
      } catch (error) {
        console.error(`💥 Error processing ${brandId}:`, error);
        this.progress.failedBrands.push(brandId);
        this.progress.lastProcessedBrand = brandId;
        await this.saveProgress();
      }
    }

    console.log('\n🎉 Logo standardization completed!');
    console.log(`✅ Successful: ${this.progress.completedBrands.length}`);
    console.log(`❌ Failed: ${this.progress.failedBrands.length}`);
  }

  private async getBrandDirectories(): Promise<string[]> {
    try {
      const entries = await fs.readdir(this.logosDir, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory() && !entry.name.startsWith('_'))
        .map(entry => entry.name)
        .sort();
    } catch (error) {
      console.error('Failed to read logos directory:', error);
      return [];
    }
  }

  private async standardizeBrandLogos(brandId: string): Promise<LogoStandardizationResult> {
    const brandDir = path.join(this.logosDir, brandId);
    const result: LogoStandardizationResult = {
      brandId,
      originalFiles: [],
      standardizedFiles: [],
      errors: [],
      status: 'failed'
    };

    try {
      // Get all image files in brand directory
      const files = await fs.readdir(brandDir);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file)
      );

      if (imageFiles.length === 0) {
        result.errors.push('No image files found');
        return result;
      }

      result.originalFiles = imageFiles;
      console.log(`  📍 Found ${imageFiles.length} image files`);

      // Process each image file
      for (let i = 0; i < imageFiles.length; i++) {
        const filename = imageFiles[i];
        const inputPath = path.join(brandDir, filename);
        
        try {
          // Create backup if enabled
          if (this.options.backupOriginals) {
            await this.backupOriginalFile(inputPath, brandId, filename);
          }

          // Generate new standardized filename
          const newFilename = `logo-${i + 1}.${this.options.targetFormat}`;
          const outputPath = path.join(brandDir, newFilename);

          // Skip if input and output are the same file
          if (inputPath === outputPath) {
            // Still process to ensure standardized size/quality
            const tempPath = outputPath + '.tmp';
            await this.processImage(inputPath, tempPath);
            await fs.rename(tempPath, outputPath);
          } else {
            await this.processImage(inputPath, outputPath);
            
            // Remove original file if different format
            if (filename !== newFilename) {
              await fs.unlink(inputPath);
            }
          }

          result.standardizedFiles.push(newFilename);
          console.log(`    ✓ ${filename} → ${newFilename}`);

        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(`${filename}: ${errorMsg}`);
          console.log(`    ✗ Failed to process ${filename}: ${errorMsg}`);
        }
      }

      // Determine final status
      if (result.standardizedFiles.length === imageFiles.length) {
        result.status = 'success';
      } else if (result.standardizedFiles.length > 0) {
        result.status = 'partial';
      } else {
        result.status = 'failed';
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(errorMsg);
    }

    return result;
  }

  private async processImage(inputPath: string, outputPath: string): Promise<void> {
    const { targetSize, targetFormat, quality } = this.options;

    let sharpInstance = sharp(inputPath)
      .resize(targetSize, targetSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      });

    // Apply format-specific settings
    if (targetFormat === 'webp') {
      sharpInstance = sharpInstance.webp({ quality });
    } else if (targetFormat === 'png') {
      sharpInstance = sharpInstance.png({ quality });
    }

    await sharpInstance.toFile(outputPath);
  }

  private async backupOriginalFile(inputPath: string, brandId: string, filename: string): Promise<void> {
    const brandBackupDir = path.join(this.backupDir, brandId);
    await fs.mkdir(brandBackupDir, { recursive: true });
    
    const backupPath = path.join(brandBackupDir, filename);
    
    // Only backup if not already exists
    try {
      await fs.access(backupPath);
      // File already exists, skip backup
    } catch {
      // File doesn't exist, create backup
      await fs.copyFile(inputPath, backupPath);
    }
  }

  private async loadProgress(): Promise<void> {
    try {
      const data = await fs.readFile(this.progressFile, 'utf-8');
      this.progress = { ...this.progress, ...JSON.parse(data) };
      console.log('📝 Loaded existing progress');
    } catch {
      console.log('📝 No existing progress file found, starting fresh');
    }
  }

  private async saveProgress(): Promise<void> {
    await fs.writeFile(this.progressFile, JSON.stringify(this.progress, null, 2));
  }

  async getStatistics(): Promise<void> {
    const brandDirs = await this.getBrandDirectories();
    let totalFiles = 0;
    let totalSize = 0;
    const formatCounts: Record<string, number> = {};
    const sizeCounts: Record<string, number> = {};

    console.log('\n📊 Current Logo Statistics:');
    console.log('════════════════════════════');

    for (const brandId of brandDirs) {
      const brandDir = path.join(this.logosDir, brandId);
      try {
        const files = await fs.readdir(brandDir);
        const imageFiles = files.filter(file => 
          /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file)
        );

        for (const file of imageFiles) {
          const filePath = path.join(brandDir, file);
          const stats = await fs.stat(filePath);
          const ext = path.extname(file).toLowerCase().slice(1);
          
          totalFiles++;
          totalSize += stats.size;
          formatCounts[ext] = (formatCounts[ext] || 0) + 1;

          // Try to get image dimensions
          try {
            const metadata = await sharp(filePath).metadata();
            const sizeKey = `${metadata.width}x${metadata.height}`;
            sizeCounts[sizeKey] = (sizeCounts[sizeKey] || 0) + 1;
          } catch {
            // Skip if can't read metadata
          }
        }
      } catch (error) {
        console.log(`⚠️  Could not analyze ${brandId}:`, error);
      }
    }

    console.log(`📁 Total brands: ${brandDirs.length}`);
    console.log(`🖼️  Total logo files: ${totalFiles}`);
    console.log(`💾 Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    
    console.log('\n📊 Format distribution:');
    Object.entries(formatCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([format, count]) => {
        const percentage = ((count / totalFiles) * 100).toFixed(1);
        console.log(`  ${format.toUpperCase()}: ${count} (${percentage}%)`);
      });

    console.log('\n📏 Size distribution (top 10):');
    Object.entries(sizeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([size, count]) => {
        const percentage = ((count / totalFiles) * 100).toFixed(1);
        console.log(`  ${size}: ${count} (${percentage}%)`);
      });
  }
}

// CLI functionality
async function main() {
  const args = process.argv.slice(2);
  const options: StandardizationOptions = {};
  let showStats = false;
  
  // Parse command line arguments
  for (const arg of args) {
    if (arg === '--resume') {
      options.resume = true;
    } else if (arg === '--stats') {
      showStats = true;
    } else if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--size=')) {
      options.targetSize = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--format=')) {
      const format = arg.split('=')[1];
      if (format === 'webp' || format === 'png') {
        options.targetFormat = format;
      }
    } else if (arg.startsWith('--quality=')) {
      options.quality = Math.min(100, Math.max(1, parseInt(arg.split('=')[1])));
    } else if (arg === '--no-backup') {
      options.backupOriginals = false;
    }
  }

  try {
    const standardizer = new LogoStandardizer(options);
    await standardizer.initialize();
    
    if (showStats) {
      await standardizer.getStatistics();
    } else {
      await standardizer.standardizeAllLogos();
    }
    
    console.log('\n🏁 Logo standardization process completed successfully!');
    
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

export default LogoStandardizer;