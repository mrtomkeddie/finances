'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Trash2, Pencil } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AddTransactionDialog } from '@/components/AddTransactionDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function TransactionsPage() {
  const { transactions, deleteTransaction } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);
  const { toast } = useToast();

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedTransaction(undefined);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    toast({ title: 'Success', description: 'Transaction deleted.' });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  return (
    <div className="space-y-4">
        <div className="flex justify-end">
            <Button onClick={handleAdd}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
            </Button>
        </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.length > 0 ? sortedTransactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.description}</TableCell>
                <TableCell>
                  <Badge variant={t.type === 'income' ? 'default' : 'secondary'} className={cn(t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                    {t.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{t.category}</Badge>
                </TableCell>
                <TableCell>{format(new Date(t.date), 'dd MMM, yyyy')}</TableCell>
                <TableCell className={cn("text-right", t.type === 'income' ? 'text-green-600' : 'text-red-600')}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(t)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <AlertDialogTrigger asChild>
                           <DropdownMenuItem className="text-red-500">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                           </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this transaction.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(t.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No transactions yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <AddTransactionDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        transaction={selectedTransaction}
      />
    </div>
  );
}
