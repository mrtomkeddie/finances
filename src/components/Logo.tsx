'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Landmark } from 'lucide-react';

export function Logo({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder on the server to prevent hydration mismatch and layout shift
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex h-[36px] w-[36px] items-center justify-center rounded-lg bg-primary/10 p-2 border border-primary/20">
          <Landmark className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Finances 2.0</h1>
      </div>
    );
  }

  const src = resolvedTheme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg';
  
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src={src}
        alt="Finances 2.0 Logo"
        width={36}
        height={36}
        priority
      />
      <h1 className="text-xl font-semibold text-foreground">Finances 2.0</h1>
    </div>
  );
}
