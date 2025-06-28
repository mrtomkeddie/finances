'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import type { Goal } from '@/lib/types';
import { AddGoalDialog } from '@/components/AddGoalDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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

export default function GoalsPage() {
  const { goals, deleteGoal } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>(undefined);
  const { toast } = useToast();

  const handleEdit = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedGoal(undefined);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteGoal(id);
    toast({ title: 'Success', description: 'Goal deleted.' });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">Set and track your financial goals to stay motivated.</p>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Goal
        </Button>
      </div>

      {goals.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            return (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{goal.name}</CardTitle>
                        <CardDescription>{formatCurrency(goal.targetAmount)}</CardDescription>
                    </div>
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(goal)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-red-500">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this goal.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(goal.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatCurrency(goal.currentAmount)}</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12">
            <CardTitle>No goals yet!</CardTitle>
            <CardDescription className="mt-2">Start by setting a new financial goal.</CardDescription>
            <Button onClick={handleAdd} className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" />
                Set a Goal
            </Button>
        </Card>
      )}

      <AddGoalDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        goal={selectedGoal}
      />
    </div>
  );
}
