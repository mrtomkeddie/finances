
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useUI } from '@/context/UIContext';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/context/DataContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Banknote, Import, Trash2, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { openBankManagement } = useUI();
  const { signOutUser, user } = useAuth();
  const { handleImportData, isImporting, handleClearAllData } = useData();

  const handleClearDataClick = () => {
    const confirmation = "DELETE";
    const promptResponse = prompt(`This action is irreversible and will delete all your banks and transactions. To confirm, type "${confirmation}" below:`);
    
    if (promptResponse === confirmation) {
      handleClearAllData();
    } else {
      alert("Action cancelled. Data was not deleted.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            {user ? `You are signed in as ${user.email}.` : 'Manage your session.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={signOutUser}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Manage your financial accounts and import data.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Button variant="outline" className="h-auto p-4 flex flex-col items-start text-left" onClick={openBankManagement}>
             <div className="flex items-center gap-2 mb-2">
                <Banknote className="w-5 h-5" />
                <h4 className="font-semibold text-base">Manage Banks</h4>
             </div>
            <p className="text-sm text-muted-foreground font-normal">Add, edit, or delete your bank accounts and credit cards.</p>
          </Button>
           <Button variant="outline" className="h-auto p-4 flex flex-col items-start text-left" onClick={handleImportData} disabled={isImporting}>
             <div className="flex items-center gap-2 mb-2">
                <Import className="w-5 h-5" />
                <h4 className="font-semibold text-base">{isImporting ? 'Importing...' : 'Import Data'}</h4>
             </div>
            <p className="text-sm text-muted-foreground font-normal">Import your data from an existing Airtable base.</p>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription className="text-destructive/80">
            This action is permanent and cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleClearDataClick}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All User Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
