# Brand Ownership Visualization

Vue 3 + Vite app with shadcn/ui for visualizing brand-company relationships.

## Features

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

## Development

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Check code quality
npm run typecheck # TypeScript checking
```

## Logo Search Tool

Automated logo collection tool that downloads brand logos from image search results:

```bash
npm run logo-search:test    # Test with first 5 brands
npm run logo-search         # Search all 674+ brands
npm run logo-search:resume  # Resume interrupted search
```

See [`scripts/README.md`](scripts/README.md) for detailed usage instructions.

Educational tool for understanding corporate brand ownership hierarchies.
