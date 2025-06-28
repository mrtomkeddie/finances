'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Landmark, Settings, Plus, LogOut, Heart } from 'lucide-react';
import { Logo } from '@/components/Logo';

function Header() {
  return (
    <header className="py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Logo />
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-transparent border-white/20 hover:bg-white/10">
            <Settings className="mr-2 h-4 w-4" /> Manage
          </Button>
          <Button variant="default" className="bg-white text-black hover:bg-gray-200">
            <Plus className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
          <Button variant="ghost" className="hover:bg-white/10">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="py-4 mt-8">
      <div className="container mx-auto flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4" />
          <span>Financial Tracker</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Made with</span>
          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
          <span>for better financial planning</span>
        </div>
      </div>
    </footer>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto">
            {children}
        </main>
        <Footer />
    </div>
  );
}
