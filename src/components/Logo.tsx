import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
     <div className={cn("flex items-center gap-3", className)}>
        <div className="bg-primary/10 p-2 rounded-lg border border-primary/20">
            <TrendingUp className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Finances 2.0</h1>
    </div>
  );
}
