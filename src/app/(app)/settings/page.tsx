
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useUI } from '@/context/UIContext';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/context/DataContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function SettingsPage() {
  const { openBankManagement } = useUI();
  const { signOutUser, user } = useAuth();
  const { handleImportData, isImporting, handleClearAllData } = useData();

  const handleClearDataClick = () => {
    const confirmation = "DELETE";
    const promptResponse = prompt(`This action is irreversible and will delete all your banks, transactions, and settings. To confirm, please type "${confirmation}" below:`);
    
    if (promptResponse === confirmation) {
      handleClearAllData();
    } else {
      alert("Action cancelled. Data was not deleted.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application settings.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            {user ? `You are logged in as ${user.email}` : 'Manage your session.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={signOutUser}>
            Logout
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Manage your financial accounts and data. Use these actions to import, manage, or clear your information.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col items-start gap-3 p-4 border rounded-lg bg-background">
            <h4 className="font-semibold text-foreground">Manage Banks</h4>
            <p className="text-sm text-muted-foreground">Add, edit, or delete your bank accounts and credit cards.</p>
            <Button onClick={openBankManagement} className="mt-auto">
              Manage Banks & Cards
            </Button>
          </div>
          <div className="flex flex-col items-start gap-3 p-4 border rounded-lg bg-background">
            <h4 className="font-semibold text-foreground">Import Data</h4>
            <p className="text-sm text-muted-foreground">Import your data from an existing Airtable base.</p>
            <Button variant="secondary" onClick={handleImportData} disabled={isImporting} className="mt-auto">
              {isImporting ? 'Importing...' : 'Import from Airtable'}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="border-t mt-6 pt-6 flex-col items-start gap-4">
          <div>
            <h4 className="font-semibold text-destructive">Danger Zone</h4>
            <p className="text-sm text-muted-foreground">This action is irreversible. All your data will be permanently deleted.</p>
          </div>
          <Button variant="destructive" onClick={handleClearDataClick}>
            Clear All User Data
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
