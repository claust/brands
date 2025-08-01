# Brand Ownership Visualization - Vue 3 + shadcn/ui

Create a comprehensive brand ownership visualization website using Vue 3 with Composition API and shadcn/ui components. This will be an interactive web application that helps users understand the complex relationships between consumer brands and their parent companies.

## Project Setup Requirements

1. **Vue 3 + Vite** - Use the latest Vue 3 with Composition API
2. **shadcn/ui for Vue** - Install and configure shadcn/ui components
3. **Additional Dependencies:**
   - D3.js for data visualization
   - Vue Router for navigation
   - Pinia for state management
   - Tailwind CSS (comes with shadcn/ui)
   - Lucide Vue for icons

## Data Structure

The application will work with a JSON dataset containing:

- `companies` array: Objects with `id`, `name`, `parent_id` (null for top-level companies)
- `brands` array: Objects with `id`, `name`, `owner_id`, `category`

Categories include: Food & Beverages, Personal Care, Household Products, Clothing & Fashion, Electronics & Technology, Automotive, Pharmaceuticals/Health, Entertainment/Media, Retail, Financial Services, Pet Care.

## Core Features to Implement

### 1. **Interactive Network Graph**

- **Primary visualization**: D3.js force-directed graph showing companies and brands as nodes
- **Visual hierarchy**: Different node sizes/colors for parent companies vs subsidiaries vs brands
- **Interactive features**:
  - Click nodes to expand/collapse subsidiaries
  - Hover for quick info tooltips
  - Drag nodes to rearrange
  - Zoom and pan functionality
- **Filtering**: Filter by category, company size, or search

### 2. **Hierarchical Tree View**

- **Alternative visualization**: Collapsible tree showing corporate hierarchies
- **Company focus**: Click any company to see it as root with all subsidiaries and brands
- **Breadcrumb navigation**: Show current path in hierarchy
- **Quick stats**: Show brand count, revenue data if available

### 3. **Category Explorer**

- **Grid/card layout**: Browse brands by category with company logos/info
- **Cross-category analysis**: Show which companies dominate multiple categories
- **Market concentration**: Visualize how many brands each company owns per category
- **Comparison tool**: Side-by-side company comparisons

### 4. **Search & Discovery**

- **Global search**: Find any brand or company instantly
- **Smart suggestions**: Autocomplete with brand/company names
- **Surprise me**: Random brand discovery with ownership reveal
- **Recently viewed**: Track user's exploration history

### 5. **Dashboard Overview**

- **Key statistics**: Total companies, brands, categories
- **Market concentration metrics**: Top 10 companies by brand count
- **Category breakdown**: Distribution charts
- **Recent changes**: Highlight recent acquisitions/spinoffs if data includes dates

## Technical Implementation Details

### Component Structure

```
src/
├── components/
│   ├── ui/ (shadcn/ui components)
│   ├── visualizations/
│   │   ├── NetworkGraph.vue
│   │   ├── TreeView.vue
│   │   └── CategoryGrid.vue
│   ├── common/
│   │   ├── SearchBar.vue
│   │   ├── FilterPanel.vue
│   │   └── BrandCard.vue
├── views/
│   ├── Dashboard.vue
│   ├── NetworkView.vue
│   ├── CategoryView.vue
│   └── CompanyDetails.vue
├── stores/
│   └── brandStore.js
└── data/
    └── brands.json
```

### State Management (Pinia)

- Store the complete dataset
- Track current filters and view state
- Handle search functionality
- Manage user preferences (theme, layout)

### Responsive Design

- Desktop-first with mobile adaptations
- Collapsible sidebar for filters
- Touch-friendly interactions for mobile
- Progressive disclosure of information

## UI/UX Requirements

### Design System

- Use shadcn/ui components consistently
- Dark/light theme toggle
- Clean, modern interface with good contrast
- Subtle animations and transitions

### User Experience

- **Loading states**: Skeleton screens while data loads
- **Empty states**: Helpful messages when no results
- **Error handling**: Graceful fallbacks for data issues
- **Performance**: Virtualization for large datasets
- **Accessibility**: Proper ARIA labels, keyboard navigation

## Advanced Features (Phase 2)

### 6. **Timeline View** (if acquisition dates available)

- Show M&A activity over time
- Animated transitions showing ownership changes
- Filter by time periods

### 7. **Comparison Tools**

- Side-by-side company portfolio comparisons
- Market share analysis by category
- Competitive landscape views

### 8. **Export & Sharing**

- Export visualizations as PNG/SVG
- Share specific views via URL
- Generate reports

### 9. **Data Insights**

- AI-powered insights about market concentration
- Trend analysis and predictions
- Anomaly detection (unusual ownership patterns)

## Sample Data Integration

Load the provided JSON dataset and create a robust data processing layer that:

- Builds parent-child relationships efficiently
- Calculates derived metrics (brand counts, category distributions)
- Handles data validation and error cases
- Supports future data updates/additions

## Performance Considerations

- Implement virtual scrolling for large lists
- Use D3.js efficiently with proper data binding
- Lazy load components and data when possible
- Optimize bundle size with proper tree-shaking
- Cache processed data in localStorage

## Getting Started

1. Set up Vue 3 + Vite project
2. Install and configure shadcn/ui
3. Create the basic routing structure
4. Implement data loading and processing
5. Start with the dashboard view and network graph
6. Add filtering and search functionality
7. Implement remaining visualizations
8. Polish UI and add advanced features

Focus on creating an engaging, educational tool that helps users understand the often-hidden connections between the brands they use daily and the corporations that own them. The visualization should be both informative and visually appealing, suitable for general consumers, researchers, and business analysts.
