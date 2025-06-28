import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className={`p-3 rounded-full w-fit mx-auto ${
              variant === 'destructive' 
                ? 'bg-red-500/10 border border-red-500/20' 
                : 'bg-orange-500/10 border border-orange-500/20'
            }`}>
              <AlertTriangle className={`h-6 w-6 ${
                variant === 'destructive' ? 'text-red-500' : 'text-orange-500'
              }`} />
            </div>
          </div>
          
          <DialogTitle className="text-lg font-semibold text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            className={`flex-1 ${
              variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                : 'bg-orange-600 hover:bg-orange-700 text-white border-orange-600'
            }`}
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}