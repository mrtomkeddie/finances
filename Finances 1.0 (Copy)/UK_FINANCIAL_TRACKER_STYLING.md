# 🏦 UK Financial Tracker - Styling

**Document 4 of 5: Tailwind v4 CSS with custom dark theme**

## 📁 File: `src/styles/globals.css`

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
  --font-size: 14px;
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  --card: #ffffff;
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: #030213;
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.95 0.0058 264.53);
  --secondary-foreground: #030213;
  --muted: #ececf0;
  --muted-foreground: #717182;
  --accent: #e9ebef;
  --accent-foreground: #030213;
  --destructive: #d4183d;
  --destructive-foreground: #ffffff;
  --border: rgba(0, 0, 0, 0.1);
  --input: transparent;
  --input-background: #f3f3f5;
  --switch-background: #cbced4;
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: #030213;
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
  
  /* Text size variables */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  
  /* Subtle color variants */
  --success-subtle: #10b981;
  --success-muted: #6b7280;
  --warning-subtle: #fbbf24;
  --warning-muted: #9ca3af;
  --danger-subtle: #ef4444;
  --danger-muted: #9ca3af;
  --info-subtle: #3b82f6;
  --info-muted: #9ca3af;
}

.dark {
  --background: #191919;
  --foreground: oklch(0.985 0 0);
  --card: #242424;
  --card-foreground: oklch(0.985 0 0);
  --popover: #242424;
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: #2a2a2a;
  --secondary-foreground: oklch(0.985 0 0);
  --muted: #2a2a2a;
  --muted-foreground: oklch(0.708 0 0);
  --accent: #2a2a2a;
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: #333333;
  --input: #2a2a2a;
  --ring: oklch(0.439 0 0);
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: #2a2a2a;
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: #333333;
  --sidebar-ring: oklch(0.439 0 0);
  
  /* Subtle color variants for dark mode */
  --success-subtle: #10b981;
  --success-muted: #6b7280;
  --warning-subtle: #fbbf24;
  --warning-muted: #9ca3af;
  --danger-subtle: #ef4444;
  --danger-muted: #9ca3af;
  --info-subtle: #3b82f6;
  --info-muted: #9ca3af;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-input-background: var(--input-background);
  --color-switch-background: var(--switch-background);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  
  /* Add custom color utilities */
  --color-success-subtle: var(--success-subtle);
  --color-success-muted: var(--success-muted);
  --color-warning-subtle: var(--warning-subtle);
  --color-warning-muted: var(--warning-muted);
  --color-danger-subtle: var(--danger-subtle);
  --color-danger-muted: var(--danger-muted);
  --color-info-subtle: var(--info-subtle);
  --color-info-muted: var(--info-muted);
  
  /* Override orange with lighter version */
  --color-orange-500: #fbbf24;
  --color-orange-400: #fcd34d;
  --color-orange-600: #f59e0b;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground;
  }
}

/**
 * Base typography. This is not applied to elements which have an ancestor with a Tailwind text class.
 */
@layer base {
  :where(:not(:has([class*=" text-"]), :not(:has([class^="text-"])))) {
    h1 {
      font-size: var(--text-2xl);
      font-weight: var(--font-weight-medium);
      line-height: 1.4;
    }

    h2 {
      font-size: var(--text-xl);
      font-weight: var(--font-weight-medium);
      line-height: 1.4;
    }

    h3 {
      font-size: var(--text-lg);
      font-weight: var(--font-weight-medium);
      line-height: 1.4;
    }

    h4 {
      font-size: var(--text-base);
      font-weight: var(--font-weight-medium);
      line-height: 1.4;
    }

    p {
      font-size: var(--text-base);
      font-weight: var(--font-weight-normal);
      line-height: 1.5;
    }

    label {
      font-size: var(--text-base);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    button {
      font-size: var(--text-base);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      border-width: 2px;
      border-color: transparent;
    }

    button:hover:not(:disabled) {
      transform: translateY(-1px) rotate(-0.5deg);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: rgba(255, 255, 255, 0.1);
    }

    button:active:not(:disabled) {
      transform: translateY(0) rotate(0deg);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
    }

    input {
      font-size: var(--text-base);
      font-weight: var(--font-weight-normal);
      line-height: 1.5;
    }
  }
}

/* Enhanced button hover effects for dark mode */
@layer base {
  .dark button:hover:not(:disabled) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.2);
    background-color: rgba(255, 255, 255, 0.03);
  }

  .dark button:active:not(:disabled) {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }

  /* Primary button effects */
  .dark button[class*="bg-primary"]:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.9);
    color: rgba(0, 0, 0, 0.9);
    border-color: rgba(255, 255, 255, 0.8);
  }

  /* Green button effects */
  .dark button[class*="bg-green"]:hover:not(:disabled) {
    background-color: rgba(34, 197, 94, 0.9);
    border-color: rgba(34, 197, 94, 0.6);
  }

  /* Destructive button effects */
  .dark button[class*="bg-red"]:hover:not(:disabled),
  .dark button[class*="bg-destructive"]:hover:not(:disabled) {
    background-color: rgba(239, 68, 68, 0.9);
    border-color: rgba(239, 68, 68, 0.6);
  }

  .dark button[class*="text-destructive"]:hover:not(:disabled) {
    background-color: rgba(239, 68, 68, 0.1);
    color: rgb(248, 113, 113);
    border-color: rgba(239, 68, 68, 0.3);
  }

  /* Ghost button effects */
  .dark button[class*="variant-ghost"]:hover:not(:disabled),
  .dark button[class*="bg-transparent"]:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

/* Light mode button effects */
@layer base {
  button:hover:not(:disabled) {
    background-color: rgba(0, 0, 0, 0.03);
  }

  /* Primary button effects */
  button[class*="bg-primary"]:hover:not(:disabled) {
    background-color: rgba(3, 2, 19, 0.9);
    border-color: rgba(3, 2, 19, 0.8);
  }

  /* Green button effects */
  button[class*="bg-green"]:hover:not(:disabled) {
    background-color: rgba(34, 197, 94, 0.9);
    border-color: rgba(34, 197, 94, 0.6);
  }

  /* Destructive button effects */
  button[class*="bg-red"]:hover:not(:disabled),
  button[class*="bg-destructive"]:hover:not(:disabled) {
    background-color: rgba(212, 24, 61, 0.9);
    border-color: rgba(212, 24, 61, 0.6);
  }

  button[class*="text-destructive"]:hover:not(:disabled) {
    background-color: rgba(212, 24, 61, 0.1);
    color: rgb(185, 28, 28);
    border-color: rgba(212, 24, 61, 0.3);
  }

  /* Ghost button effects */
  button[class*="variant-ghost"]:hover:not(:disabled),
  button[class*="bg-transparent"]:hover:not(:disabled) {
    background-color: rgba(0, 0, 0, 0.03);
    border-color: rgba(0, 0, 0, 0.08);
  }

  /* Secondary button effects */
  button[class*="bg-secondary"]:hover:not(:disabled) {
    background-color: rgba(233, 235, 239, 0.8);
    border-color: rgba(113, 113, 130, 0.3);
  }

  .dark button[class*="bg-secondary"]:hover:not(:disabled) {
    background-color: rgba(38, 38, 38, 0.9);
    border-color: rgba(115, 115, 115, 0.4);
  }
}

/* Bank tab button specific styling - More subtle */
@layer base {
  .bank-tab-button {
    /* Override default button hover transform for bank tabs */
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .bank-tab-button:hover:not(:disabled) {
    transform: translateY(-1px) scale(1.01);
    /* Reduced movement and scale for subtlety */
  }

  .bank-tab-button:active:not(:disabled) {
    transform: translateY(0) scale(1);
    transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Prevent stacking issues with tab buttons */
  .bank-tab-button {
    position: relative;
    z-index: 1;
  }

  .bank-tab-button:hover {
    z-index: 10;
  }

  /* Selected tab should stay above hover states */
  .bank-tab-button[class*="bg-slate"] {
    z-index: 20;
  }
}

/* Tab-specific hover and stacking fixes */
@layer base {
  /* Fix tab trigger stacking on hover */
  [role="tablist"] button {
    position: relative;
    z-index: 1;
  }

  [role="tablist"] button:hover {
    z-index: 10;
  }

  /* Active tab should stay above hover states */
  [role="tablist"] button[data-state="active"] {
    z-index: 20;
  }

  /* Reduce transform on tab hovers to prevent overlap */
  [role="tablist"] button:hover:not(:disabled) {
    transform: translateY(-1px) rotate(-0.3deg);
  }
}

/* Category filter button specific styling */
@layer base {
  .category-filter-btn {
    position: relative;
    z-index: 1;
  }

  /* Prevent transform on category filter buttons to avoid overlap */
  .category-filter-btn:hover:not(:disabled) {
    transform: none !important;
    box-shadow: none !important;
    border-color: transparent !important;
  }

  /* Override the global button hover effects for category filters */
  .category-filter-btn:active:not(:disabled) {
    transform: none !important;
    box-shadow: none !important;
    transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Ensure selected state stays above hover states */
  .category-filter-btn[class*="bg-card"] {
    z-index: 10;
  }
}

/* Icon background adjustments for better visibility */
@layer utilities {
  /* Override orange color backgrounds and borders with better transparency */
  .bg-orange-500\/10 {
    background-color: rgba(251, 191, 36, 0.15) !important;
  }
  
  .border-orange-500\/20 {
    border-color: rgba(251, 191, 36, 0.35) !important;
  }
  
  /* Also adjust green and red icon backgrounds for consistency */
  .bg-green-500\/10 {
    background-color: rgba(16, 185, 129, 0.15) !important;
  }
  
  .border-green-500\/20 {
    border-color: rgba(16, 185, 129, 0.35) !important;
  }
  
  .bg-red-500\/10 {
    background-color: rgba(239, 68, 68, 0.15) !important;
  }
  
  .border-red-500\/20 {
    border-color: rgba(239, 68, 68, 0.35) !important;
  }
}

/* Custom subtle color utilities */
@layer utilities {
  .text-success-subtle { color: var(--color-success-subtle); }
  .text-success-muted { color: var(--color-success-muted); }
  .text-warning-subtle { color: var(--color-warning-subtle); }
  .text-warning-muted { color: var(--color-warning-muted); }
  .text-danger-subtle { color: var(--color-danger-subtle); }
  .text-danger-muted { color: var(--color-danger-muted); }
  .text-info-subtle { color: var(--color-info-subtle); }
  .text-info-muted { color: var(--color-info-muted); }
  
  .bg-success-subtle { background-color: var(--color-success-subtle); }
  .bg-success-muted { background-color: var(--color-success-muted); }
  .bg-warning-subtle { background-color: var(--color-warning-subtle); }
  .bg-warning-muted { background-color: var(--color-warning-muted); }
  .bg-danger-subtle { background-color: var(--color-danger-subtle); }
  .bg-danger-muted { background-color: var(--color-danger-muted); }
  .bg-info-subtle { background-color: var(--color-info-subtle); }
  .bg-info-muted { background-color: var(--color-info-muted); }
  
  .border-success-subtle { border-color: var(--color-success-subtle); }
  .border-success-muted { border-color: var(--color-success-muted); }
  .border-warning-subtle { border-color: var(--color-warning-subtle); }
  .border-warning-muted { border-color: var(--color-warning-muted); }
  .border-danger-subtle { border-color: var(--color-danger-subtle); }
  .border-danger-muted { border-color: var(--color-danger-muted); }
  .border-info-subtle { border-color: var(--color-info-subtle); }
  .border-info-muted { border-color: var(--color-info-muted); }
}

html {
  font-size: var(--font-size);
}
```

---

**Continue with Document 5: UK_FINANCIAL_TRACKER_APP.md**