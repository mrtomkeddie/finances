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
