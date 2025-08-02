# Development Setup Guide

This guide will help you set up the Brand Ownership Visualization project on a new Mac.

## Prerequisites

1. **Homebrew** - Install from [brew.sh](https://brew.sh/) or run:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

## Quick Setup (Recommended)

Run the automated setup script:

```bash
./setup.sh
```

This will install all dependencies and configure your development environment.

## Manual Setup

If you prefer to install manually:

### 1. Install Development Tools

```bash
# Using Brewfile (recommended)
brew bundle
```

<details>
<summary>Or install individually if needed</summary>

```bash
brew install node
brew install deno
brew install supabase/tap/supabase
```
</details>

### 2. Install VS Code Extensions

```bash
code --install-extension denoland.vscode-deno
code --install-extension Vue.volar
```

### 3. Install Node Dependencies

```bash
npm install
```

### 4. Install Playwright Browsers

```bash
npx playwright install
```

### 5. Setup Environment

```bash
cp .env.example .env
# Add your Supabase keys to .env
```

## Required Tools Summary

| Tool | Purpose | Install Command |
|------|---------|-----------------|
| **Node.js** | Vue.js development | `brew install node` |
| **Deno** | Edge Functions development | `brew install deno` |
| **Supabase CLI** | Database & function deployment | `brew install supabase/tap/supabase` |
| **Playwright** | Logo scraping automation | `npx playwright install` |

## VS Code Extensions

- **Deno** (`denoland.vscode-deno`) - TypeScript support for Edge Functions
- **Vue Language Features** (`Vue.volar`) - Vue.js development

## Environment Variables

Copy `.env.example` to `.env` and add:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Verification

Test your setup:

```bash
npm run dev                # Should start development server
npm run typecheck          # Should pass without errors
npm run functions:check    # Should validate Edge Functions
```

## Development Commands

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run lint                   # Check code quality

# Edge Functions
npm run functions:check        # TypeScript validation
npm run functions:lint         # Deno linting
npm run functions:fmt          # Format code

# Data Tools
npm run logo-search           # Search for brand logos
npm run company-info          # Scrape company data
```

## Troubleshooting

**Edge Functions TypeScript errors:**
- Ensure Deno is installed: `deno --version`
- Restart VS Code after installing Deno extension

**Supabase connection issues:**
- Verify your `.env` file has correct keys
- Check Supabase project is accessible

**Build errors:**
- Run `npm install` to ensure dependencies are up to date
- Check Node.js version: `node --version` (should be v18+)