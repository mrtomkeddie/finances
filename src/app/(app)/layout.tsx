
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, List, Loader2, LogOut, Menu, Plus, Notebook, Banknote, CalendarDays, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { UIProvider, useUI } from '@/context/UIContext';
import { Separator } from '@/components/ui/separator';
import { DataProvider, useData } from '@/context/DataContext';
import Link from 'next/link';
import { useTheme } from 'next-themes';

// Modals
import { BankManagementModal } from '@/components/BankManagementModal';
import { TransactionModal } from '@/components/TransactionModal';
import { TransactionDetailModal } from '@/components/TransactionDetailModal';
import { TransferEditModal } from '@/components/TransferEditModal';
import { NoteModal } from '@/components/NoteModal';
import { NoteDetailModal } from '@/components/NoteDetailModal';
import { Note } from '@/lib/types';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { ThemeToggle } from '@/components/ThemeToggle';


function SideMenuContent() {
    const { signOutUser } = useAuth();
    const { openTransactionModal, openBankManagement } = useUI();
    
    return (
        <SheetContent className="flex h-full flex-col p-6">
            <SheetHeader className="text-left">
                <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-1 flex-col justify-between py-4">
                <div className="flex flex-col gap-2">
                     <SheetClose asChild>
                        <Button variant="outline" className="w-full justify-start text-base font-normal py-4" onClick={() => openTransactionModal(null)}>
                           <Plus className="mr-2 h-4 w-4" /> Add Transaction
                        </Button>
                    </SheetClose>
                    <SheetClose asChild>
                        <Button variant="outline" className="w-full justify-start text-base font-normal py-4" onClick={openBankManagement}>
                           <Banknote className="mr-2 h-4 w-4" /> Manage Banks
                        </Button>
                    </SheetClose>
                    <Separator className="my-2" />
                    <SheetClose asChild>
                        <Link href="/dashboard" passHref>
                            <Button variant="ghost" className="w-full justify-start text-base font-normal py-4">
                                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                            </Button>
                        </Link>
                    </SheetClose>
                    <SheetClose asChild>
                        <Link href="/transactions" passHref>
                            <Button variant="ghost" className="w-full justify-start text-base font-normal py-4">
                                <List className="mr-2 h-4 w-4" /> Transactions
                            </Button>
                        </Link>
                    </SheetClose>
                    <SheetClose asChild>
                        <Link href="/calendar" passHref>
                            <Button variant="ghost" className="w-full justify-start text-base font-normal py-4">
                                <CalendarDays className="mr-2 h-4 w-4" /> Calendar
                            </Button>
                        </Link>
                    </SheetClose>
                    <SheetClose asChild>
                        <Link href="/notes" passHref>
                            <Button variant="ghost" className="w-full justify-start text-base font-normal py-4">
                                <Notebook className="mr-2 h-4 w-4" /> Notes
                            </Button>
                        </Link>
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
    );
}


function Header() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-20 max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          {isMounted ? (
            <>
              <ThemeToggle />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SideMenuContent />
              </Sheet>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" disabled className="h-10 w-10" />
              <Button variant="outline" size="icon" disabled className="h-10 w-10" />
            </>
          )}
        </div>
      </div>
    </header>
  );
}


function AppModals() {
  const {
    banks,
    notes,
    weeklyTransferAmount,
    handleAddBank,
    handleUpdateBank,
    handleDeleteBank,
    handleAddTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction,
    handleSaveTransferAmount,
    handleAddNote,
    handleUpdateNote,
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
    isTransferEditOpen,
    closeTransferEditModal,
    isNoteModalOpen,
    editingNote,
    closeNoteModal,
    isNoteDetailModalOpen,
    detailedNote,
    closeNoteDetailModal,
    openNoteModal,
    openTransactionModal,
    confirmationConfig,
    isConfirmationOpen,
    closeConfirmationDialog,
  } = useUI();

  const handleSaveNote = (noteData: Omit<Note, 'id'> | Partial<Omit<Note, 'id'>>, noteId?: string) => {
    if (noteId) {
      handleUpdateNote(noteData, noteId);
    } else {
      handleAddNote(noteData as Omit<Note, 'id'>);
    }
  };

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
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={closeNoteModal}
        onSave={handleSaveNote}
        editingNote={editingNote}
      />
      <NoteDetailModal
        isOpen={isNoteDetailModalOpen}
        onClose={closeNoteDetailModal}
        note={detailedNote}
        onEdit={(note) => {
          closeNoteDetailModal();
          openNoteModal(note);
        }}
      />
       <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onClose={closeConfirmationDialog}
        onConfirm={confirmationConfig.onConfirm}
        title={confirmationConfig.title}
        description={confirmationConfig.description}
      />
    </>
  );
}


function AppLayoutContent({ children }: { children: React.ReactNode }) {
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
      <DataProvider>
        <div className="flex min-h-screen w-full flex-col bg-background">
          <Header />
          <main className="flex flex-1 flex-col pb-16 md:pb-0">
            <div className="mx-auto w-full max-w-screen-lg flex-1 px-4 pt-4 pb-8 sm:px-6 sm:pt-6">
              {children}
            </div>
          </main>
          <AppModals />
        </div>
      </DataProvider>
    </UIProvider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutContent>{children}</AppLayoutContent>;
}
