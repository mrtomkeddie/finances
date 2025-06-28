import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Save, X, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/financial';

interface TransferEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAmount: number;
  onSave: (amount: number) => void;
}

export function TransferEditModal({ 
  isOpen, 
  onClose, 
  currentAmount, 
  onSave 
}: TransferEditModalProps) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount(currentAmount.toString());
    }
  }, [isOpen, currentAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount) || 0;
    
    if (numAmount < 0) {
      alert('Transfer amount cannot be negative');
      return;
    }

    setIsSubmitting(true);

    try {
      onSave(numAmount);
      onClose();
    } catch (error) {
      console.error('Error saving transfer amount:', error);
      alert('Failed to save transfer amount. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const weeklyAmount = parseFloat(amount) || 0;
  const monthlyAmount = weeklyAmount * 4.33;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Weekly Transfer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Set the weekly transfer amount from HSBC to Santander. This will be automatically 
            included in the bank overview calculations.
          </p>

          {/* Transfer Visualization */}
          <Card className="p-4 bg-muted/10 border-border/30">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-foreground">HSBC</span>
                </div>
                <p className="text-xs text-muted-foreground">Outgoing</p>
              </div>
              
              <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium text-foreground">Santander</span>
                </div>
                <p className="text-xs text-muted-foreground">Incoming</p>
              </div>
            </div>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Weekly Amount */}
            <div>
              <Label htmlFor="amount" className="text-sm font-medium text-foreground">
                Weekly Transfer Amount (£)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1"
                disabled={isSubmitting}
              />
            </div>

            {/* Preview Calculations */}
            {weeklyAmount > 0 && (
              <Card className="p-3 bg-blue-500/5 border-blue-500/20">
                <h3 className="text-sm font-medium text-foreground mb-2">Preview</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weekly:</span>
                    <span className="font-medium text-foreground">{formatCurrency(weeklyAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly:</span>
                    <span className="font-medium text-foreground">{formatCurrency(monthlyAmount)}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                className="flex-1 gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Transfer Amount
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}