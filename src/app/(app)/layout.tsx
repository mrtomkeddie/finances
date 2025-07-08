
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
import { DataProvider, useData } from '@/context/DataContext';
import { MobileNav } from '@/components/MobileNav';

// Modals
import { BankManagementModal } from '@/components/BankManagementModal';
import { TransactionModal } from '@/components/TransactionModal';
import { TransactionDetailModal } from '@/components/TransactionDetailModal';
import { TransferEditModal } from '@/components/TransferEditModal';

function DesktopHeader() {
  const { signOutUser } = useAuth();
  const { openBankManagement, openTransactionModal } = useUI();

  return (
    <header className="sticky top-0 z-10 hidden border-b bg-background/95 backdrop-blur md:block">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => openTransactionModal(null)}>
            <Plus className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="flex h-full flex-col p-6">
              <SheetHeader className="text-left">
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Manage your app settings and account.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-1 flex-col justify-between py-4">
                  <div className="flex flex-col gap-2">
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
      </div>
    </header>
  );
}

function MobileHeader() {
  return (
    <header className="sticky top-0 z-10 block border-b bg-background/95 backdrop-blur md:hidden">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-center px-4">
        <Logo />
      </div>
    </header>
  );
}


function AppModals() {
  const {
    banks,
    weeklyTransferAmount,
    handleAddBank,
    handleUpdateBank,
    handleDeleteBank,
    handleAddTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction,
    handleSaveTransferAmount,
  } = useData();

  const {
    isBankManagementOpen,
    closeBankManagement,
    isTransactionModalOpen,
    editingTransaction,
    closeTransactionModal,
    isDetailModalOpen,
    closeDetailModal,
    detailedTransaction,
    openTransactionModal,
    isTransferEditOpen,
    closeTransferEditModal,
  } = useUI();

  return (
    <>
      <BankManagementModal 
        isOpen={isBankManagementOpen} 
        onClose={closeBankManagement} 
        banks={banks} 
        onAddBank={handleAddBank} 
        onUpdateBank={handleUpdateBank} 
        onDeleteBank={handleDeleteBank} 
      />
      <TransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={closeTransactionModal} 
        onAddTransaction={editingTransaction ? handleUpdateTransaction : handleAddTransaction} 
        banks={banks} 
        editTransaction={editingTransaction} 
      />
      <TransactionDetailModal 
        isOpen={isDetailModalOpen} 
        onClose={closeDetailModal} 
        transaction={detailedTransaction} 
        banks={banks} 
        onEdit={(t) => {
          closeDetailModal();
          openTransactionModal(t);
        }} 
        onDelete={(id) => {
          closeDetailModal();
          handleDeleteTransaction(id);
        }} 
      />
      <TransferEditModal 
        isOpen={isTransferEditOpen} 
        onClose={closeTransferEditModal} 
        currentAmount={weeklyTransferAmount} 
        onSave={handleSaveTransferAmount} 
      />
    </>
  );
}


function AppLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <UIProvider>
      <DataProvider>
        <div className="flex min-h-screen w-full flex-col bg-background">
          <DesktopHeader />
          <MobileHeader />
          <main className="flex flex-1 flex-col">
            <div className="mx-auto w-full max-w-screen-lg px-4 pt-4 pb-24 sm:px-6 sm:pt-6 md:pb-16">
              {children}
            </div>
          </main>
          <MobileNav />
          <AppModals />
        </div>
      </DataProvider>
    </UIProvider>
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

  return <AppLayoutContent>{children}</AppLayoutContent>;
}
