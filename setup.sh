#!/bin/bash

echo "🚀 Brand Ownership Visualization - Development Setup"
echo "=================================================="

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not found. Please install Homebrew first:"
    echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
fi

echo "✅ Homebrew found"

# Install required tools using Brewfile
echo "📦 Installing development tools from Brewfile..."
brew bundle

echo "Installing Playwright browsers..."
npx playwright install

# Install VS Code extension if VS Code is available
if command -v code &> /dev/null; then
    echo "Installing VS Code extensions..."
    code --install-extension denoland.vscode-deno
    code --install-extension Vue.volar
    echo "✅ VS Code extensions installed"
else
    echo "⚠️  VS Code CLI not found. Please install VS Code extensions manually:"
    echo "   - Deno (denoland.vscode-deno)"
    echo "   - Vue Language Features (Vue.volar)"
fi

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

# Setup environment
echo "🔧 Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "⚠️  Please add your Supabase keys to .env file"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your Supabase keys to .env file"
echo "2. Run 'npm run dev' to start development server"
echo "3. Run 'npm run functions:check' to verify Edge Functions"
echo ""
echo "Available commands:"
echo "  npm run dev                    # Start development server"
echo "  npm run build                  # Build for production"
echo "  npm run lint                   # Check code quality"
echo "  npm run typecheck              # TypeScript checking"
echo "  npm run functions:check        # Check Edge Functions"
echo "  npm run logo-search            # Search for brand logos"
echo "  npm run company-info           # Scrape company information"