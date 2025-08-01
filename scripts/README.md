# Logo Search Tool

A simple Playwright-based tool to automatically search and download logos for all brands in the dataset.

## Features

- ✅ Single-threaded, sequential processing
- ✅ Uses Bing image search (no API keys needed)
- ✅ Progress tracking and resumable functionality
- ✅ Downloads multiple logo variants per brand
- ✅ Organizes logos by brand ID in folders
- ✅ Respectful rate limiting between searches

## Usage

### Install dependencies
```bash
npm install
```

### Basic Commands

```bash
# Test with first 5 brands
npm run logo-search:test

# Search all brands
npm run logo-search

# Resume interrupted search
npm run logo-search:resume

# Search specific brand
npm run logo-search -- --brand="pepsi"

# Custom options
npm run logo-search -- --limit=10 --max-logos=2 --delay=3000
```

### Command Line Options

- `--limit=N` - Process only first N brands (great for testing)
- `--resume` - Resume from last processed brand
- `--brand="name"` - Search specific brand by name or ID
- `--max-logos=N` - Max logos to download per brand (default: 3)
- `--delay=N` - Delay between searches in milliseconds (default: 2000)

## Output Structure

```
public/logos/
├── nestle/
│   ├── logo-1.png
│   ├── logo-2.jpg
│   └── logo-3.png
├── pepsi/
│   ├── logo-1.png
│   └── logo-2.jpg
└── ...

scripts/logo-search-progress.json (progress tracking)
```

## How it Works

1. **Load brands** from `src/data/brands.json`
2. **Sequential processing** - one brand at a time
3. **Search strategy**:
   - Navigate to Bing Images
   - Search for `"[brand name] logo"`
   - Extract first few high-quality images
   - Download and save to brand folder
4. **Progress tracking** - saves after each brand
5. **Error handling** - skips failed brands, continues processing

## Notes

- The tool is respectful with 2-second delays between searches
- Progress is automatically saved, so you can safely interrupt and resume
- Failed brands are logged but don't stop the entire process
- Images are saved in their original format (PNG, JPG, etc.)
- Use `--limit=5` for testing before running on all 674+ brands

## Troubleshooting

- If a search fails, the tool will continue with the next brand
- Use `--resume` to continue from where you left off
- Check `scripts/logo-search-progress.json` for detailed progress
- Logos are saved to `public/logos/` so they're accessible to the Vue app