
'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, MoreVertical, Pencil, Trash2, Loader2, Trophy } from 'lucide-react';
import type { Goal } from '@/lib/types';
import { AddGoalDialog } from '@/components/AddGoalDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { getGoals, addGoal, updateGoal, deleteGoal } from '@/lib/firebase';
import { formatCurrency } from '@/lib/financial';

export default function GoalsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedGoal, setSelectedGoal] = React.useState<Goal | undefined>(undefined);

  React.useEffect(() => {
    if (!user) return;
    const unsubscribe = getGoals(user.uid, (goals) => {
      setGoals(goals);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleAddNew = () => {
    setSelectedGoal(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteGoal(user.uid, id);
      toast({ title: 'Success', description: 'Goal deleted.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete goal.' });
    }
  };

  const handleSaveGoal = async (goalData: Omit<Goal, 'id'>, id?: string) => {
    if (!user) return;
    try {
      if (id) {
        await updateGoal(user.uid, id, goalData);
        toast({ title: 'Success', description: 'Goal updated successfully.' });
      } else {
        await addGoal(user.uid, goalData);
        toast({ title: 'Success', description: 'Goal added successfully.' });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save goal.' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold">Financial Goals</h1>
            <p className="text-muted-foreground">Set and track your financial goals to stay motivated.</p>
        </div>
        <Button onClick={handleAddNew}>
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
                                <AlertDialogDescription>This will permanently delete this goal.</AlertDialogDescription>
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
        <Card className="flex flex-col items-center justify-center p-12 text-center">
            <Trophy className="h-12 w-12 text-yellow-400 mb-4" />
            <CardTitle>No goals yet!</CardTitle>
            <CardDescription className="mt-2">Create your first financial goal to start your journey.</CardDescription>
            <Button onClick={handleAddNew} className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" />
                Set a Goal
            </Button>
        </Card>
      )}

      <AddGoalDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveGoal}
        goal={selectedGoal}
      />
    </div>
  );
}
