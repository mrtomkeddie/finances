import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TransferEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAmount: number;
  onSave: (amount: number) => void;
}

export function TransferEditModal({ isOpen, onClose, currentAmount, onSave }: TransferEditModalProps) {
  const [amount, setAmount] = useState(currentAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount >= 0) {
      onSave(amount);
      onClose();
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      setAmount(currentAmount);
    }
  }, [isOpen, currentAmount]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto bg-card border-border">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold text-foreground">
            Edit Weekly Transfer
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-1">
            Set the amount automatically transferred from HSBC to Santander each week.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-foreground">
              Weekly Transfer Amount (£)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="h-12 text-lg bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-3">
            <div className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg border border-border/50">
              <h4 className="font-semibold text-foreground mb-2">How this works:</h4>
              <ul className="space-y-2 list-disc list-inside">
                <li>This amount is automatically deducted from HSBC weekly net income.</li>
                <li>The same amount is added to Santander weekly net income.</li>
                <li>Set to £0 to disable the automatic transfer.</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 text-base py-6 border-border text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 text-base py-6 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save Transfer Amount
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
