
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useUI } from '@/context/UIContext';
import { useAuth } from '@/hooks/useAuth';
import { Bank, LogOut, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function SettingsPage() {
  const { openBankManagement } = useUI();
  const { signOutUser, user } = useAuth();

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
          <div className="flex items-center gap-4">
            <User className="h-8 w-8 text-muted-foreground" />
            <div>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                {user ? `You are logged in as ${user.email}` : 'Manage your session.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={signOutUser}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Bank className="h-8 w-8 text-muted-foreground" />
            <div>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage your financial accounts and data.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={openBankManagement}>
            Manage Banks & Credit Cards
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
