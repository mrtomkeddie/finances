import { Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
     <div className={cn("flex items-center gap-3 text-2xl font-bold", className)}>
        <div className="bg-white/10 p-2 rounded-lg">
            <Landmark className="h-6 w-6 text-white" />
        </div>
        <h1 className="font-headline">Finances Dashboard</h1>
    </div>
  );
}
