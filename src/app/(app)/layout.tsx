'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut, Menu, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { UIProvider, useUI } from '@/context/UIContext';
import { Separator } from '@/components/ui/separator';

function AppHeader() {
  const { signOutUser } = useAuth();
  const { openBankManagement, openTransactionModal } = useUI();

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-2 sm:px-4">
        <Logo />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="flex h-full flex-col p-6">
            <SheetHeader className="text-left">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Main menu for navigating the app, adding transactions, and managing banks.
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-1 flex-col justify-between py-4">
                <div className="flex flex-col gap-2">
                  <SheetClose asChild>
                      <Button variant="ghost" onClick={() => openTransactionModal(null)} className="w-full justify-start text-base font-normal py-4">
                        <Plus className="mr-2 h-4 w-4" /> Add Transaction
                      </Button>
                  </SheetClose>
                  <SheetClose asChild>
                      <Button variant="ghost" onClick={openBankManagement} className="w-full justify-start text-base font-normal py-4">
                        <Settings className="mr-2 h-4 w-4" /> Manage Banks
                      </Button>
                  </SheetClose>
                </div>
                <div>
                  <Separator className="my-2" />
                  <SheetClose asChild>
                    <Button variant="ghost" onClick={signOutUser} className="w-full justify-start text-base text-muted-foreground hover:text-foreground py-4">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </SheetClose>
                </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <UIProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <AppHeader />
        <main className="flex flex-1 flex-col">
          <div className="mx-auto w-full max-w-7xl px-2 pt-4 pb-16 sm:px-4 sm:pt-6">
            {children}
          </div>
        </main>
      </div>
    </UIProvider>
  );
}
