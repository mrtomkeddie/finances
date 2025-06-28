# Migration Checklist from Figma Make

## 📋 Pre-Migration Checklist

### 1. File Structure Setup
- [ ] Create new project directory
- [ ] Initialize with `npm init` or `yarn init`
- [ ] Install all dependencies from `package.json`
- [ ] Copy all source files to `/src/` directory

### 2. Configuration Files
- [ ] Copy `package.json` with all dependencies
- [ ] Add `vite.config.ts` for build configuration
- [ ] Add `tsconfig.json` for TypeScript configuration
- [ ] Add `tailwind.config.js` for Tailwind CSS
- [ ] Add `postcss.config.js` for PostCSS
- [ ] Add `eslint.config.js` for linting
- [ ] Create `index.html` entry point
- [ ] Add `src/main.tsx` for React mounting

### 3. Environment Variables
- [ ] Create `.env.example` with all required variables
- [ ] Create `.env.local` with actual values
- [ ] Add environment variables to deployment platform
- [ ] Update `airtableService.ts` to use environment variables

### 4. Asset Management
- [ ] Replace `figma:asset` imports with actual image files
- [ ] Copy logo to `/public/logo.png`
- [ ] Update all image references in components
- [ ] Test all image loads correctly

### 5. Import Path Updates
- [ ] Update all relative imports in components
- [ ] Ensure all utility imports work correctly
- [ ] Check all type imports resolve properly
- [ ] Test all shadcn/ui component imports

## 🔧 Migration Steps

### Step 1: Project Initialization
```bash
# Create new project
npm create vite@latest uk-financial-tracker -- --template react-ts
cd uk-financial-tracker

# Install dependencies
npm install

# Install additional dependencies
npm install lucide-react react-hook-form@7.55.0 sonner@2.0.3
# ... (install all dependencies from package.json)
```

### Step 2: File Migration
```bash
# Create directory structure
mkdir -p src/components/ui
mkdir -p src/components/figma
mkdir -p src/utils
mkdir -p src/types
mkdir -p src/styles

# Copy files (you'll need to do this manually)
# - Copy all .tsx files from /components/ to /src/components/
# - Copy all .ts files from /utils/ to /src/utils/
# - Copy all .ts files from /types/ to /src/types/
# - Copy globals.css to /src/styles/
```

### Step 3: Code Updates
- [ ] Update `App.tsx` import paths:
  ```typescript
  // Change from:
  import { Card } from './components/ui/card';
  // To:
  import { Card } from './components/ui/card';
  ```

- [ ] Update asset imports:
  ```typescript
  // Change from:
  import logoIcon from 'figma:asset/...';
  // To:
  import logoIcon from '/logo.png';
  ```

- [ ] Update environment variable usage:
  ```typescript
  // In airtableService.ts, change from:
  const AIRTABLE_API_TOKEN = 'your_token';
  // To:
  const AIRTABLE_API_TOKEN = import.meta.env.VITE_AIRTABLE_API_TOKEN;
  ```

### Step 4: Testing
- [ ] Run `npm run dev` to start development server
- [ ] Test all components load correctly
- [ ] Test all functionality works
- [ ] Test mobile responsiveness
- [ ] Test dark mode toggle
- [ ] Test Airtable integration
- [ ] Test all modals and forms

### Step 5: Build and Deploy
- [ ] Run `npm run build` to create production build
- [ ] Test production build locally with `npm run preview`
- [ ] Deploy to hosting platform (Firebase, Vercel, Netlify)
- [ ] Test deployed version thoroughly

## 🔍 Common Issues and Solutions

### Import Path Issues
**Problem**: Components can't find imports
**Solution**: Update all relative paths and ensure file structure matches

### Environment Variables
**Problem**: API calls fail due to missing environment variables
**Solution**: Ensure all environment variables are set in deployment platform

### Asset Loading
**Problem**: Images don't load after migration
**Solution**: Replace figma:asset imports with proper file paths

### Build Errors
**Problem**: TypeScript or build errors
**Solution**: Check tsconfig.json and ensure all types are properly imported

### Styling Issues
**Problem**: Tailwind classes not working
**Solution**: Ensure Tailwind CSS is properly configured and imported

## 🚀 Post-Migration Tasks

### 1. Performance Optimization
- [ ] Optimize bundle size
- [ ] Add lazy loading for components
- [ ] Optimize images and assets
- [ ] Add service worker for caching

### 2. SEO and Metadata
- [ ] Add proper meta tags
- [ ] Add Open Graph tags
- [ ] Add favicon and app icons
- [ ] Add sitemap

### 3. Analytics and Monitoring
- [ ] Add Google Analytics or similar
- [ ] Add error monitoring (Sentry)
- [ ] Add performance monitoring
- [ ] Set up logging

### 4. Security
- [ ] Review and secure API keys
- [ ] Add proper CORS configuration
- [ ] Review authentication flow
- [ ] Add input validation

### 5. Documentation
- [ ] Update README.md
- [ ] Document API endpoints
- [ ] Add component documentation
- [ ] Create user guide

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Firebase Hosting Guide](https://firebase.google.com/docs/hosting)
- [Tailwind CSS v4 Migration](https://tailwindcss.com/docs/v4-beta)
- [React TypeScript Best Practices](https://react-typescript-cheatsheet.netlify.app/)