
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
      <div className={cn("flex items-center justify-center h-[64px] w-[64px] rounded-lg bg-primary/10 p-2 border border-primary/20", className)}>
        <Landmark className="h-8 w-8 text-primary" />
      </div>
    );
  }

  const src = resolvedTheme === 'dark' ? '/white.png' : '/dark.png';
  
  return (
    <Image
      src={src}
      alt="Finances Logo"
      width={64}
      height={64}
      priority
      className={className}
    />
  );
}
