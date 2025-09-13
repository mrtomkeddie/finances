
'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import React, { useState, useEffect } from 'react';

export function Logo({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Render a placeholder or an empty div to avoid hydration mismatch
    return <div className={cn('h-10 w-[150px]', className)} />;
  }

  const src = resolvedTheme === 'dark' ? '/white.png' : '/dark.png';

  return (
    <Image
      src={src}
      alt="Finance Port Logo"
      width={150}
      height={40}
      className={cn(className)}
      priority
    />
  );
}
