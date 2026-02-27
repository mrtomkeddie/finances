
'use client';

import React, { useMemo } from 'react';
import { Transaction, TransactionCategory } from '@/lib/types';
import { calculateMonthlyAmount, formatCurrency } from '@/lib/financial';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface SpendingChartProps {
    transactions: Transaction[];
}

const CATEGORY_COLORS: Record<TransactionCategory, string> = {
    'Work': '#6366f1',
    'Education': '#06b6d4',
    'Bills/Debt': '#ef4444',
    'Nice To Have': '#f59e0b',
    'Uncategorized': '#8b5cf6',
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="rounded-lg border bg-card px-3 py-2 shadow-md">
                <p className="text-sm font-semibold">{data.name}</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(data.value)}/mo</p>
                <p className="text-xs text-muted-foreground">{data.percentage}%</p>
            </div>
        );
    }
    return null;
};

export function SpendingChart({ transactions }: SpendingChartProps) {
    const chartData = useMemo(() => {
        const expenseTransactions = transactions.filter(
            (t) => t.type === 'expense' || (t.type === 'debt' && t.amount > 0)
        );

        const categoryTotals: Record<string, number> = {};

        expenseTransactions.forEach((t) => {
            const category = t.category || 'Uncategorized';
            const monthly = calculateMonthlyAmount(t.amount, t.frequency);
            categoryTotals[category] = (categoryTotals[category] || 0) + monthly;
        });

        const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

        return Object.entries(categoryTotals)
            .map(([name, value]) => ({
                name,
                value: Math.round(value * 100) / 100,
                percentage: total > 0 ? Math.round((value / total) * 100) : 0,
                color: CATEGORY_COLORS[name as TransactionCategory] || '#94a3b8',
            }))
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    if (chartData.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full sm:w-1/2 h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={90}
                                    paddingAngle={3}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="w-full sm:w-1/2 space-y-3">
                        {chartData.map((item) => (
                            <div key={item.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="h-3 w-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-foreground">{item.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-medium">{formatCurrency(item.value)}</span>
                                    <span className="text-muted-foreground ml-1 text-xs">({item.percentage}%)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
