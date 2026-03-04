
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, List, Loader2, LogOut, Menu, Plus, Notebook, Banknote, CalendarDays, Settings, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { UIProvider, useUI } from '@/context/UIContext';
import { Separator } from '@/components/ui/separator';
import { DataProvider, useData } from '@/context/DataContext';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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
import { AIChatbot } from '@/components/AIChatbot';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: List },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/notes', label: 'Notes', icon: Notebook },
  { href: '/settings', label: 'Settings', icon: Settings },
];


function DesktopSidebar() {
  const pathname = usePathname();
  const { signOutUser } = useAuth();
  const { openTransactionModal, openBankManagement } = useUI();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-64 border-r bg-card">
      <div className="flex h-20 items-center px-6 border-b">
        <Link href="/dashboard">
          <Logo />
        </Link>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4 overflow-y-auto">
        <div className="space-y-1">
          {/* Actions */}
          <Button
            variant="default"
            className="w-full justify-start gap-2 mb-1"
            onClick={() => openTransactionModal(null)}
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 mb-3"
            onClick={openBankManagement}
          >
            <Banknote className="h-4 w-4" />
            Manage Banks
          </Button>

          <Separator className="my-3" />

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3 text-sm font-medium',
                      isActive && 'bg-secondary text-foreground font-semibold'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="space-y-2">
          <Separator />
          <ThemeToggle />
          <Button
            variant="ghost"
            onClick={signOutUser}
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}





function MobileSheetMenu() {
  const { signOutUser } = useAuth();
  const { openTransactionModal, openBankManagement } = useUI();
  const pathname = usePathname();

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
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <SheetClose key={item.href} asChild>
                <Link href={item.href} passHref>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start text-base font-normal py-4',
                      isActive && 'font-semibold'
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              </SheetClose>
            );
          })}
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
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-lg lg:hidden">
      <div className="mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
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
                <MobileSheetMenu />
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
        onAddTransaction={(transaction, id) => {
          if (editingTransaction && id) {
            return handleUpdateTransaction(transaction, id);
          } else {
            return handleAddTransaction(transaction);
          }
        }}
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
        <div className="flex min-h-screen w-full bg-background">
          {/* Desktop sidebar */}
          <DesktopSidebar />

          {/* Main content area */}
          <div className="flex flex-1 flex-col lg:pl-64 min-w-0 w-full">
            {/* Mobile header */}
            <Header />

            <main className="flex flex-1 flex-col min-w-0 w-full">
              <div className="mx-auto w-full max-w-screen-lg flex-1 px-4 pt-4 pb-8 sm:px-6 sm:pt-6">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </div>
            </main>
          </div>

          <AppModals />
          <AIChatbot />
        </div>
      </DataProvider>
    </UIProvider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutContent>{children}</AppLayoutContent>;
}
