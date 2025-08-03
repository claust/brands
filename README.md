# Brand Ownership Visualization

Vue 3 + Vite app with shadcn/ui for visualizing brand-company relationships.

Educational tool for understanding corporate brand ownership hierarchies.

## 🚀 Quick Start

```bash
./setup.sh          # Automated setup (recommended)
npm run dev         # Start development server
```

📋 **For detailed setup instructions, see [SETUP.md](SETUP.md)**

## ✨ Features

- **Network Graph**: D3.js force-directed visualization of companies/brands
- **Tree View**: Hierarchical corporate structure explorer  
- **Category Explorer**: Browse brands by category (Food, Tech, etc.)
- **Search**: Global search with autocomplete
- **Dashboard**: Statistics and market concentration metrics
- **Logo Search Tool**: Automated logo collection for all brands using Playwright

## Tech Stack

- Vue 3 (Composition API)
- shadcn/ui components
- D3.js for visualizations
- Vue Router, Pinia
- Tailwind CSS
- Vite with Rolldown bundler

## 💻 Development

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run lint      # Check code quality
npm run typecheck # TypeScript checking
```

### Edge Functions Commands

```bash
npm run functions:check  # TypeScript validation
npm run functions:lint   # Deno linting
npm run functions:fmt    # Format code
```

## Logo Search Tool

Automated logo collection tool that downloads brand logos from image search results:

```bash
npm run logo-search:test    # Test with first 5 brands
npm run logo-search         # Search all 674+ brands
npm run logo-search:resume  # Resume interrupted search
```

## Company Information Extraction

Extract company information (headquarters, founded year, employees, revenue) using Gemini CLI:

```bash
# Single company extraction using Claude CLI (saves to file)
sed 's/\[COMPANY_NAME\]/PepsiCo Inc./g' scripts/company-extraction-agent-prompt.md | claude -p "Extract company information for PepsiCo Inc.:" > pepsico_inc.json

# Single company extraction using Gemini CLI (saves to file)
sed 's/\[COMPANY_NAME\]/PepsiCo Inc./g' scripts/company-extraction-agent-prompt.md | gemini -p "Extract company information for PepsiCo Inc.:" > pepsico_inc.json

# Replace "PepsiCo Inc." with any company name from the dataset
# The prompt now returns only JSON output that can be directly saved to a file
```

See [`scripts/README.md`](scripts/README.md) for detailed usage instructions.

## 🚢 CI/CD Pipeline

This project includes a GitHub Actions workflow that automatically:
- Runs linting and type checking on all pushes and pull requests
- Deploys Supabase Edge Functions when pushing to the `master` branch

For GitHub secrets setup, see [SETUP.md](SETUP.md#cicd-pipeline-setup).