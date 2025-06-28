'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useAppContext } from '@/context/AppContext';
import type { Goal } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Goal name must be at least 2 characters.' }),
  targetAmount: z.coerce.number().positive({ message: 'Target amount must be positive.' }),
  currentAmount: z.coerce.number().min(0, { message: 'Current amount cannot be negative.' }),
});

interface AddGoalDialogProps {
  goal?: Goal;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function AddGoalDialog({ goal, open, onOpenChange }: AddGoalDialogProps) {
  const { addGoal, updateGoal } = useAppContext();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: goal?.name || '',
      targetAmount: goal?.targetAmount || 1000,
      currentAmount: goal?.currentAmount || 0,
    },
  });

  React.useEffect(() => {
    form.reset({
      name: goal?.name || '',
      targetAmount: goal?.targetAmount || 1000,
      currentAmount: goal?.currentAmount || 0,
    });
  }, [goal, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (goal) {
        updateGoal({ ...values, id: goal.id });
        toast({ title: 'Success', description: 'Goal updated successfully.' });
    } else {
        addGoal(values);
        toast({ title: 'Success', description: 'Goal added successfully.' });
    }
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit Goal' : 'Set a New Goal'}</DialogTitle>
          <DialogDescription>
            {goal ? 'Update your financial goal details.' : 'Define a new financial goal to track.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Save for Vacation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="100" placeholder="1000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="currentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Amount Saved</FormLabel>
                  <FormControl>
                    <Input type="number" step="50" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{goal ? 'Save Changes' : 'Set Goal'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
