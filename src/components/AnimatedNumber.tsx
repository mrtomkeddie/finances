
'use client';

import CountUp from 'react-countup';
import { formatCurrency } from '@/lib/financial';

interface AnimatedNumberProps {
  value: number;
  className?: string;
}

export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  return (
    <CountUp
      end={value}
      duration={1}
      formattingFn={(val) => formatCurrency(val)}
      className={className}
    />
  );
}
