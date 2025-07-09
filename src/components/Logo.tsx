'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Logo({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render a placeholder on the server to prevent hydration mismatch and layout shift
  if (!mounted) {
    return (
      <div style={{ width: '150px', height: '40px' }} className={className} />
    );
  }

  const src = resolvedTheme === 'dark' ? '/white.png' : '/dark.png';
  
  return (
    <Image
      key={src}
      src={src}
      alt="Finance Port Logo"
      width={150}
      height={40}
      priority
      className={className}
    />
  );
}
