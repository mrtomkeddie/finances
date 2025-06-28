import { Card } from "./ui/card";
import { TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import { formatCurrency } from "../utils/financial";

interface SummaryCardsProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalDebt: number;
  monthlyDebtPayments: number;
}

export function SummaryCards({ 
  monthlyIncome, 
  monthlyExpenses, 
  totalDebt, 
  monthlyDebtPayments 
}: SummaryCardsProps) {
  const weeklyIncome = monthlyIncome / 4.33;
  const weeklyExpenses = monthlyExpenses / 4.33;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      {/* Income Card */}
      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-green-500/10 border border-green-500/20">
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
          <div className="flex-1">
            <p className="text-muted-foreground mb-1">Monthly Income</p>
            <p className="text-2xl font-bold text-green-500">{formatCurrency(monthlyIncome)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Weekly: {formatCurrency(weeklyIncome)}
            </p>
          </div>
        </div>
      </Card>

      {/* Expenses Card */}
      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
            <TrendingDown className="h-6 w-6 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-muted-foreground mb-1">Monthly Expenses</p>
            <p className="text-2xl font-bold text-red-500">{formatCurrency(monthlyExpenses)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Weekly: {formatCurrency(weeklyExpenses)}
            </p>
          </div>
        </div>
      </Card>

      {/* Debt Card */}
      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-orange-500/10 border border-orange-500/20">
            <CreditCard className="h-6 w-6 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-muted-foreground mb-1">Total Debt</p>
            <p className="text-2xl font-bold text-orange-500">{formatCurrency(totalDebt)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Monthly payments: {formatCurrency(monthlyDebtPayments)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}