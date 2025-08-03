# Setup Guide

This guide will help you set up the Brand Ownership Visualization project.

## Prerequisites

1. **macOS** with [Homebrew](https://brew.sh/) installed
2. **Node.js** 18+ (will be installed by setup script)

## Automated Setup (Recommended)

Run the automated setup script:

```bash
./setup.sh
```

This will install all dependencies and configure your development environment.

## Manual Setup

<details>
<summary>Click to expand manual setup instructions</summary>

### 1. Install Development Tools

```bash
# Using Brewfile (recommended)
brew bundle

# Or install individually:
brew install node
brew install deno
brew install supabase/tap/supabase
```

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

</details>

## Environment Variables

Create a `.env` file with:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Required Tools

| Tool | Purpose | Install Command |
|------|---------|------------------|
| **Node.js** | Vue.js development | `brew install node` |
| **Deno** | Edge Functions development | `brew install deno` |
| **Supabase CLI** | Database & function deployment | `brew install supabase/tap/supabase` |
| **Playwright** | Logo scraping automation | `npx playwright install` |

## Verification

Test your setup:

```bash
npm run dev                # Should start development server
npm run typecheck          # Should pass without errors
npm run functions:check    # Should validate Edge Functions
```

## CI/CD Pipeline Setup

### Required GitHub Secrets

To set up the CI/CD pipeline, you need to configure the following GitHub secrets:

#### `SUPABASE_ACCESS_TOKEN`
- **Description**: Your Supabase access token for authentication
- **How to get**: 
  1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
  2. Navigate to Account Settings > Access Tokens
  3. Generate a new token with the necessary permissions

#### `SUPABASE_PROJECT_REF`
- **Description**: Your Supabase project reference ID
- **How to get**: 
  1. Go to your project in the Supabase Dashboard
  2. Copy the project reference from the URL (e.g., `your-project-ref`)
  3. Or find it in Settings > General > Reference ID

### Setting Up Secrets

Using GitHub CLI (recommended):
```bash
gh secret set SUPABASE_ACCESS_TOKEN --body "your-access-token"
gh secret set SUPABASE_PROJECT_REF --body "your-project-ref"
```

Or manually:
1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add each secret with the exact name and value

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