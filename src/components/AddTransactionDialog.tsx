'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, PlusCircle } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useAppContext } from '@/context/AppContext';
import type { Transaction } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  description: z.string().min(2, { message: 'Description must be at least 2 characters.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be a positive number.' }),
  type: z.enum(['income', 'expense']),
  date: z.date(),
  category: z.string().min(1, { message: 'Please select a category.' }),
});

interface AddTransactionDialogProps {
  transaction?: Transaction;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function AddTransactionDialog({ transaction, open, onOpenChange }: AddTransactionDialogProps) {
  const { categories, addCategory, addTransaction, updateTransaction } = useAppContext();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: transaction?.description || '',
      amount: transaction?.amount || 0,
      type: transaction?.type || 'expense',
      date: transaction ? new Date(transaction.date) : new Date(),
      category: transaction?.category || '',
    },
  });

  React.useEffect(() => {
    form.reset({
      description: transaction?.description || '',
      amount: transaction?.amount || 0,
      type: transaction?.type || 'expense',
      date: transaction ? new Date(transaction.date) : new Date(),
      category: transaction?.category || '',
    });
  }, [transaction, form]);


  const handleAddNewCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      addCategory(newCategory);
      form.setValue('category', newCategory);
      setNewCategory('');
    }
    setIsAddingCategory(false);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const transactionData = {
      ...values,
      date: values.date.toISOString(),
    };
    if (transaction) {
        updateTransaction({ ...transactionData, id: transaction.id });
        toast({ title: "Success", description: "Transaction updated successfully." });
    } else {
        addTransaction(transactionData);
        toast({ title: "Success", description: "Transaction added successfully." });
    }
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
          <DialogDescription>
            {transaction ? 'Update the details of your transaction.' : 'Add a new transaction to your records.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Groceries" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="income" id="income" />
                        </FormControl>
                        <FormLabel htmlFor="income">Income</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="expense" id="expense" />
                        </FormControl>
                        <FormLabel htmlFor="expense">Expense</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    {isAddingCategory ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="New category name"
                        />
                        <Button type="button" onClick={handleAddNewCategory}>Add</Button>
                        <Button type="button" variant="ghost" onClick={() => setIsAddingCategory(false)}>Cancel</Button>
                      </div>
                    ) : (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                           <Button
                              variant="ghost"
                              className="w-full justify-start mt-1"
                              onClick={(e) => {
                                e.preventDefault();
                                setIsAddingCategory(true);
                              }}
                            >
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Add New
                            </Button>
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-[240px] pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{transaction ? 'Save Changes' : 'Add Transaction'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
