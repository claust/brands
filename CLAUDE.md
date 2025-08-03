# Brand Ownership Visualization

Vue 3 + Vite app with shadcn/ui for visualizing brand-company relationships.

## Key Commands

```bash
# Development
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Check code quality with oxlint
npm run typecheck # TypeScript checking
npm run format    # Format code with Prettier

# Testing
npm run test         # Run Playwright tests
npm run test:ui      # Run tests with UI
npm run test:report  # Show test report

# Logo Search Tool
npm run logo-search:test    # Test with first 5 brands
npm run logo-search         # Search all brands
npm run logo-search:resume  # Resume interrupted search

# Logo Standardization Tool
npm run logo-standardize:stats  # View current logo statistics
npm run logo-standardize:test   # Test standardization on first 5 brands
npm run logo-standardize        # Standardize all logos
npm run logo-standardize:resume # Resume interrupted standardization

# Company Info Scraper Tool
npm run company-info:test    # Test with first 5 companies
npm run company-info         # Scrape all companies
npm run company-info:resume  # Resume interrupted scraping
npm run company-info:extract # Prepare extraction prompts for AI
npm run company-info:merge   # Merge extracted data into dataset

# Supabase Edge Functions
npm run functions:check  # TypeScript checking for Edge Functions
npm run functions:lint   # Lint Edge Functions with Deno
npm run functions:fmt    # Format Edge Functions with Deno

# Database Migrations
npm run migrate       # Push database changes
npm run migrate:new   # Create new migration
npm run migrate:list  # List migrations
```

## Core Features

- **Network Graph**: D3.js force-directed visualization of companies/brands
- **Tree View**: Hierarchical corporate structure explorer
- **Category Explorer**: Browse brands by category (Food, Tech, etc.)
- **Search**: Global search with autocomplete
- **Dashboard**: Statistics and market concentration metrics
- **Logo Search Tool**: Automated Playwright-based logo collection for all brands
- **Logo Standardization**: Sharp-based logo processing for consistent format/size
- **Company Info Scraper**: Automated company information collection (HQ, founded year, employees, revenue)

## Tech Stack

- Vue 3 (Composition API)
- shadcn/ui components
- D3.js for visualizations
- Vue Router, Pinia
- Tailwind CSS
- Vite with Rolldown bundler for blazing fast builds
- TypeScript for type safety
- Playwright for E2E testing
- oxlint for fast linting

## Data Structure

**Supabase Database Tables:**

- `companies`: Core company information
  - `id`, `name`, `parent_id` (for ownership hierarchy)
  - `headquarters`, `founded`, `employees`, `revenue`
  - `metadata` (JSON for additional data)
- `brands`: Brand ownership mapping
  - `id`, `name`, `owner_id` (references companies.id)
  - `category` (Food, Tech, etc.)

## Focus Areas

- Interactive visualizations showing brand ownership hierarchies
- Responsive design with dark/light themes
- Performance optimization for large datasets
- Automated logo collection using Playwright web scraping
- Logo standardization using Sharp for consistent display
- Automated company information extraction (headquarters, founding year, employees, revenue)
- Educational tool for understanding corporate brand ownership

## Data Collection Tools

### Logo Search Tool (`scripts/logo-searcher.ts`)

- Automatically searches Bing Images for brand logos
- Downloads up to 3 logo variants per brand
- Organizes logos in `public/logos/[brand-id]/` folders
- Includes progress tracking and resume functionality
- Processes all 674+ brands sequentially with rate limiting

### Logo Standardization Tool (`scripts/logo-standardizer.ts`)

- Standardizes all logos to 200x200px WebP format
- Uses Sharp for high-performance image processing
- Maintains quality at 85% compression
- Creates backups of original files
- Progress tracking and resume functionality
- Statistics reporting for logo analysis

Both tools integrate seamlessly with the Vue app for optimal logo display.

### Company Info Scraper (`scripts/company-info-scraper.ts`)

- Searches for company official websites via Bing
- Fetches homepage and About page content
- Saves raw text content for AI-powered extraction
- Basic pattern matching for common information
- Progress tracking and resume functionality
- Outputs to `public/company-info/[company-id]/`

### Company Info Extractor (`scripts/company-info-extractor.ts`)

- Prepares extraction prompts for AI processing
- Reviews scraped content and current extraction status
- Generates prompts for Claude to extract:
  - Headquarters location (city, country)
  - Year founded
  - Number of employees
  - Annual revenue (with year)
- Merges extracted data back into main dataset

The scraper collects raw content, then the extractor helps leverage AI for accurate information extraction.
