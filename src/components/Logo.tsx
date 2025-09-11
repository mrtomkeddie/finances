
'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import React, { useState, useEffect } from 'react';

export function Logo({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getLogoSrc = () => {
    if (!mounted || !resolvedTheme) {
      // Return a transparent placeholder to prevent hydration mismatch
      return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    }
    return resolvedTheme === 'dark' ? '/white.png' : '/dark.png';
  };

  return (
    <Image
      key={getLogoSrc()} // Use key to force re-render when src changes
      src={getLogoSrc()}
      alt="Finance Port Logo"
      width={150}
      height={40}
      className={cn(className, !mounted && 'opacity-0')} // Hide until mounted to prevent flash
      priority
    />
  );
}
