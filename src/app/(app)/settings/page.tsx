
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const documentationText = `
## Finance Port: System Documentation

### 1. Core Purpose & Technology Stack

**Purpose:** Finance Port is a personal finance tracker designed to provide a clear, real-time overview of income, expenses, and financial health. It uses a manual-entry system for transactions and persists all data in a Firebase Firestore database, scoped to the authenticated user.

**Technology Stack:**
- **Framework:** Next.js 14+ with React (App Router)
- **UI Components:** ShadCN UI
- **Styling:** Tailwind CSS
- **Database & Auth:** Firebase (Firestore & Firebase Authentication)
- **State Management:** React Context API
- **Deployment:** Assumes a standard Node.js environment.

---

### 2. Data Models (src/lib/types.ts)

The application revolves around a few key data structures:

**A. Transaction:** The core of the app.
- **id (string):** Unique identifier (Firestore Document ID).
- **title (string):** Name of the transaction (e.g., "Salary," "Groceries").
- **amount (number):** The monetary value of the transaction.
- **type ('income' | 'expense' | 'debt'):** Defines how the transaction is categorized.
- **frequency ('weekly' | 'bi-weekly' | '4-weekly' | 'monthly' | 'yearly'):** How often the transaction occurs.
- **date (string - ISO format):** The start date or next due date of the transaction.
- **bankId (string):** The ID of the Bank it's associated with.
- **description (string | null):** Optional notes.
- **Debt-Specific Fields:**
  - **remainingBalance (number | null):** Total amount left to pay for a 'debt' type.
  - **interestType ('monetary' | 'percentage' | null):** How interest is calculated.
  - **monthlyInterest (number | null):** A fixed monetary interest amount per month.
  - **interestRate (number | null):** A percentage rate.
  - **rateFrequency ('monthly' | 'annual' | null):** Specifies if the percentage rate is monthly or yearly (APR).

**B. Bank:** Represents a user's bank account, credit card, or loan.
- **id (string):** Unique identifier.
- **name (string):** Name of the account (e.g., "HSBC Current," "Amex Gold").
- **type ('bank' | 'credit-card' | 'loan'):** The account type.
- **color (string):** A hex color code for UI tagging.

**C. Note:** For user-created notes and reminders.
- **id (string):** Unique identifier.
- **title (string):** Note title.
- **content (string):** Note content (supports HTML from a rich-text editor).
- **createdAt / updatedAt (string - ISO format):** Timestamps.

**D. UserProfile:** Stores user-specific settings.
- **weeklyTransferAmount (number):** A special-purpose value used in dashboard calculations to simulate a recurring transfer between two specific accounts (HSBC and Santander).

---

### 3. Core Functionality & Logic

**A. Authentication (Firebase Auth)**
- Uses Firebase Authentication with the Email/Password provider.
- All user data (transactions, banks, etc.) is stored in Firestore under a path scoped to the user's UID: \`/users/{userId}/\`.
- Firestore security rules (\`firestore.rules\`) restrict read/write access to the authenticated user, ensuring data privacy.

**B. State Management (React Context)**
- **DataContext:** A global context that fetches, caches, and manages all user data from Firestore (banks, transactions, notes, profile). It provides functions for all CRUD (Create, Read, Update, Delete) operations.
- **UIContext:** Manages the open/closed state of all modals and popups throughout the app, preventing state clutter in individual components.

**C. Transaction & Financial Logic (src/lib/financial.ts)**
- **Monthly Amount Calculation:** The app standardizes all recurring transactions to a monthly equivalent for summary calculations. It correctly converts weekly, bi-weekly, 4-weekly, and yearly amounts into a comparable monthly figure.
- **Debt Calculation:** This is the most complex part of the financial logic.
  - **Interest Calculation:** It can calculate the monthly interest charge from either a fixed monetary value (e.g., £10/month) or a percentage rate (monthly or annual APR).
  - **Net Payment:** It calculates the "net" payment on a debt by subtracting the monthly interest from the monthly payment amount. This shows how much principal is actually being paid off.
  - **Pay-Off Time:** It estimates how many weeks it will take to clear a debt based on the net monthly payment and the remaining balance. It returns "Growing" if the payment doesn't cover the interest.

**D. Date Logic (src/lib/dateUtils.ts)**
- **Next Due Date:** For any recurring transaction, the system can calculate its *next* upcoming due date. It never shows a past date as "due."
- **Calendar Logic:** The calendar view determines which transactions are due on any given day by checking the transaction's start date and its recurrence frequency against the target date.

**E. Dashboard**
- **Net Monthly Cashflow:** The primary metric, calculated as (Total Monthly Income) - (Total Monthly Expenses + Total Monthly Debt Payments).
- **Bank Overviews:** These cards show the net weekly and monthly cashflow for specific bank accounts. It includes a special business rule:
  - **HSBC/Santander Transfer:** The \`weeklyTransferAmount\` from the user's profile is used to simulate a transfer. The amount is subtracted from the HSBC overview and added to the Santander overview to model a user moving money between accounts.
- **Weekly Forecast:** Shows a 7-day outlook, calculating the total income and expenses due on each of the next seven days.

**F. Data Persistence (src/lib/firebase.ts)**
- All interactions with Firestore are handled through this service file.
- It contains functions to fetch, add, update, and delete documents from the \`banks\`, \`transactions\`, and \`notes\` sub-collections within the user's document.
- All data is stored under the path: \`/users/{USER_ID}/{collectionName}/{documentId}\`.
`;

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Documentation</CardTitle>
          <CardDescription>
            A detailed technical overview of the application, its functions, and data structures. Use this for reference or for rebuilding the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="documentation">App Overview</Label>
            <Textarea
              id="documentation"
              readOnly
              value={documentationText}
              className="h-[500px] font-mono text-xs custom-scrollbar"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
