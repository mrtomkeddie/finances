# UK Financial Tracker

A comprehensive financial tracking application built with React, TypeScript, and Tailwind CSS. Features integration with Airtable for data persistence and includes mobile-responsive design.

## Features

- 📊 **Financial Dashboard** - Overview of income, expenses, and debt
- 🏦 **Bank Management** - Track multiple bank accounts with custom colors
- 💳 **Transaction Tracking** - Income, expenses, and debt payments
- 📅 **Smart Due Dates** - Always shows next due date, never past dates
- 📱 **Mobile Responsive** - Optimized for all screen sizes
- 🌙 **Dark Mode** - Beautiful dark theme
- 🔄 **Real-time Sync** - Airtable integration for data persistence

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS v4
- **UI Components**: Radix UI, shadcn/ui
- **Backend**: Airtable (or Firebase)
- **Build Tool**: Vite
- **Deployment**: Firebase Hosting (or Vercel/Netlify)

## Setup Instructions

### 1. Clone and Install
```bash
git clone <your-repo>
cd uk-financial-tracker
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
```

Fill in your API keys in `.env.local`:
- Airtable Base ID and API Token
- Firebase configuration (if using)

### 3. Airtable Setup
Create an Airtable base with these tables:

**Banks Table:**
- Name (Single line text)
- Color (Single line text)

**Transactions Table:**
- Title (Single line text)
- Amount (Currency)
- Type (Single select: income, expense, debt)
- Frequency (Single select: weekly, bi-weekly, 4-weekly, monthly, yearly)
- Date (Date)
- BankID (Link to Banks)
- RemainingBalance (Currency) - for debt transactions
- MonthlyInterest (Currency) - for debt transactions
- InterestRate (Number)
- InterestType (Single select: monetary, percentage)
- RateFrequency (Single select: monthly, annual)

### 4. Development
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

### 6. Deploy to Firebase
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Deploy
firebase deploy
```

## Migration from Figma Make

If migrating from Figma Make, you'll need to:

1. **Copy all component files** to `/src/components/`
2. **Copy utility files** to `/src/utils/`
3. **Copy type definitions** to `/src/types/`
4. **Update import paths** to use relative imports
5. **Replace figma:asset imports** with actual image files
6. **Set up environment variables** for API keys
7. **Test all functionality** after migration

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Custom components
├── lib/                # Configuration files
├── styles/             # CSS and styling
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx             # Main application component
```

## Key Dependencies

- `react` & `react-dom` - Core React
- `lucide-react` - Icons
- `@radix-ui/*` - UI primitives
- `tailwindcss` - Styling
- `firebase` - Backend services (optional)
- `react-hook-form` - Form handling

## Development Notes

- Uses Tailwind CSS v4 with custom CSS variables
- Mobile-first responsive design
- Dark mode support built-in
- TypeScript for type safety
- ESLint for code quality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details