# Finances 2.0 - Financial Tracker

This is a Next.js application built with Firebase Studio for tracking your personal finances. It uses Firebase Authentication for secure login and Firestore to store your financial data in real-time.

## Getting Started

Your project is already set up. Here are the final steps to get it running with your own Firebase backend.

### 1. Prerequisites

- You have a [Firebase account](https://console.firebase.google.com/).
- You have Node.js and npm installed.

### 2. Install Dependencies

If you haven't already, open a terminal in the project directory and run:

```bash
npm install
```

### 3. Set Up Your Firebase Project

If you haven't done so already, create a Firebase project and enable the necessary services:

1.  **Create a Firebase Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Register Your Web App:** In your new project, click the Web icon (`</>`) to register your app.
3.  **Enable Authentication:** In the console, go to **Authentication > Sign-in method** and enable **Email/Password** and **Google**.
4.  **Enable Firestore:** Go to **Firestore Database** and create a new database. Start in **production mode**.

### 4. Configure Environment Variables

1.  In the root of your project, create a new file named `.env.local`.
2.  Copy the contents from `.env.example` into your new `.env.local` file.
3.  Fill in the values with your actual Firebase project credentials. You can find these in your Firebase project settings under **Project settings > General > Your apps > SDK setup and configuration**.

### 5. Deploy Security Rules

This is a crucial step to protect your data. These commands will deploy the `firestore.rules` file included in this project to your Firebase project.

1.  **Log in to Firebase:**
    ```bash
    npx firebase login
    ```
2.  **Select your Firebase Project:**
    ```bash
    npx firebase use YOUR_PROJECT_ID
    ```
    (Replace `YOUR_PROJECT_ID` with the ID of the project you created).

3.  **Deploy the Rules:**
    ```bash
    npx firebase deploy --only firestore:rules
    ```

### 6. Run the Application

You're all set! Start the development server:

```bash
npm run dev
```

Open your browser to the provided URL, create an account, and start tracking your finances!

## Managing Costs on the Blaze Plan

Since publishing the app requires upgrading to the Firebase "Blaze" (Pay-as-you-go) plan, it's important to understand how to avoid unexpected costs. For a personal application like this, **it is highly unlikely you will ever pay anything**, as your usage will almost certainly fall within Firebase's generous free tier.

Here’s how to ensure your app remains free:

### 1. Understand the Free Tier

The Blaze plan includes the same free tier as the Spark plan, which is very generous for personal use. The key services you are using are:
*   **Firestore Database:** ~50,000 reads and ~20,000 writes per day.
*   **Firebase Authentication:** 10,000 new users per month.
*   **App Hosting:** 10 GB of hosting storage and 360 MB/day of data transfer.
*   **Cloud Functions (for Genkit):** ~2 million function calls per month.

For a single user, it is nearly impossible to exceed these limits through normal use of this application.

### 2. Set Up a Billing Alert (Highly Recommended)

This is the best way to get peace of mind. You can set up an alert to be notified by email if your bill ever exceeds a certain amount (e.g., $1).

1.  Go to the **Google Cloud Console** for your project.
2.  Navigate to the **Billing** section.
3.  Find **Budgets & alerts** in the side menu.
4.  **Create a new budget**. You can set the "Target amount" to a very low number, like `$1`.
5.  Under "Actions", you can configure it to send you an email alert when your spending reaches, for example, 50% or 100% of your tiny budget.

This way, you'll be the first to know if any costs are about to be incurred, and you can investigate before it becomes an issue.

### 3. Monitor Your Usage

You can see your real-time usage for all Firebase services directly in the **Firebase Console**. Go to the "Usage and billing" tab for your project to see charts for Firestore, Hosting, and other services. This will show you just how far you are from the free tier limits.
