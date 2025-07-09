
'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Logo({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  // State to hold a cache-busting value, generated only on the client
  const [cacheKey, setCacheKey] = useState<number | null>(null);

  useEffect(() => {
    // This runs only on the client, after the component has mounted.
    // It generates a unique timestamp to force the browser to re-fetch the image.
    setCacheKey(Date.now());
  }, []); // The empty dependency array ensures this effect runs only once.

  // On the server, or before the client-side effect has run, render a placeholder
  // This prevents hydration mismatch and avoids layout shift.
  if (!cacheKey) {
    return (
      <div style={{ width: '150px', height: '40px' }} className={className} />
    );
  }

  // Determine the correct logo source based on the theme
  const src = resolvedTheme === 'dark' ? '/white.png' : '/dark.png';

  return (
    <Image
      // The key is crucial. It tells React to treat this as a new component
      // when the source URL changes, ensuring a re-render.
      key={`${src}-${cacheKey}`}
      // Append the cache-busting key as a query parameter
      src={`${src}?v=${cacheKey}`}
      alt="Finance Port Logo"
      width={150}
      height={40}
      className={className}
    />
  );
}
