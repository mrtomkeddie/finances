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
      <DialogContent className="max-w-md mx-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Edit Weekly Transfer
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Set the amount automatically transferred from HSBC to Santander each week
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-foreground">Weekly Transfer Amount (£)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
              <p className="mb-1"><strong>How this works:</strong></p>
              <p>• This amount is automatically deducted from HSBC weekly net income</p>
              <p>• The same amount is added to Santander weekly net income</p>
              <p>• Set to £0 to disable the automatic transfer</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-border text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save Transfer Amount
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
