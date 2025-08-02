
'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

export function Logo({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();

  const getLogoSrc = () => {
    // On the server, resolvedTheme is undefined, so we can't know the theme.
    // We'll return a transparent placeholder to avoid hydration errors.
    if (typeof window === 'undefined') {
      return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    }
    return resolvedTheme === 'dark' ? '/white.png' : '/dark.png';
  };

  return (
    <Image
      key={getLogoSrc()} // Re-renders the image when the source changes
      src={getLogoSrc()}
      alt="Finance Port Logo"
      width={150}
      height={40}
      className={className}
      priority // Ensures the logo loads quickly, especially on the login page
    />
  );
}
