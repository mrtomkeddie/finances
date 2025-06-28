import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Save, X } from 'lucide-react';
import { Transaction, Bank, TransactionType } from '../types/financial';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  banks: Bank[];
  editTransaction?: Transaction | null;
}

export function TransactionModal({ 
  isOpen, 
  onClose, 
  onAddTransaction, 
  banks,
  editTransaction 
}: TransactionModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'income' as TransactionType,
    frequency: 'monthly',
    date: new Date().toISOString().split('T')[0],
    bankId: '',
    remainingBalance: '',
    monthlyInterest: '',
    interestRate: '',
    interestType: 'percentage' as 'monetary' | 'percentage',
    rateFrequency: 'annual' as 'monthly' | 'annual',
  });
  
  const [showDebtFields, setShowDebtFields] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set form data when editing
  useEffect(() => {
    if (editTransaction) {
      setFormData({
        title: editTransaction.title,
        amount: editTransaction.amount.toString(),
        type: editTransaction.type,
        frequency: editTransaction.frequency,
        date: editTransaction.date,
        bankId: editTransaction.bankId,
        remainingBalance: editTransaction.remainingBalance?.toString() || '',
        monthlyInterest: editTransaction.monthlyInterest?.toString() || '',
        interestRate: editTransaction.interestRate?.toString() || '',
        interestType: editTransaction.interestType || 'percentage',
        rateFrequency: editTransaction.rateFrequency || 'annual',
      });
      setShowDebtFields(editTransaction.type === 'debt');
    } else {
      // Reset form for new transaction
      setFormData({
        title: '',
        amount: '',
        type: 'income',
        frequency: 'monthly',
        date: new Date().toISOString().split('T')[0],
        bankId: banks.length > 0 ? banks[0].id : '',
        remainingBalance: '',
        monthlyInterest: '',
        interestRate: '',
        interestType: 'percentage',
        rateFrequency: 'annual',
      });
      setShowDebtFields(false);
    }
  }, [editTransaction, banks, isOpen]);

  // Update debt fields visibility when type changes
  useEffect(() => {
    setShowDebtFields(formData.type === 'debt');
  }, [formData.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.bankId) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const transaction: Omit<Transaction, 'id'> = {
        title: formData.title.trim(),
        amount: parseFloat(formData.amount) || 0,
        type: formData.type,
        frequency: formData.frequency,
        date: formData.date,
        bankId: formData.bankId,
        remainingBalance: formData.type === 'debt' ? (parseFloat(formData.remainingBalance) || 0) : undefined,
        monthlyInterest: formData.type === 'debt' ? (parseFloat(formData.monthlyInterest) || 0) : undefined,
        interestRate: formData.type === 'debt' ? (parseFloat(formData.interestRate) || 0) : undefined,
        interestType: formData.type === 'debt' ? formData.interestType : undefined,
        rateFrequency: formData.type === 'debt' ? formData.rateFrequency : undefined,
      };

      await onAddTransaction(transaction);
      handleClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const getBankColor = (bankId: string) => {
    const bank = banks.find(b => b.id === bankId);
    return bank?.color || '#6366f1';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {editTransaction ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-foreground">
              Title *
            </Label>
            <Input
              id="title"
              placeholder="Transaction name"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1"
              disabled={isSubmitting}
            />
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount" className="text-sm font-medium text-foreground">
              {formData.type === 'debt' ? 'Payment Amount' : 'Amount'} (£)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="mt-1"
              disabled={isSubmitting}
            />
          </div>

          {/* Type */}
          <div>
            <Label className="text-sm font-medium text-foreground">
              Type *
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value: TransactionType) => setFormData(prev => ({ ...prev, type: value }))}
              disabled={isSubmitting}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="debt">Debt Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Frequency */}
          <div>
            <Label className="text-sm font-medium text-foreground">
              Frequency *
            </Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
              disabled={isSubmitting}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                <SelectItem value="4-weekly">4-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date" className="text-sm font-medium text-foreground">
              Start Date *
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="mt-1"
              disabled={isSubmitting}
            />
          </div>

          {/* Bank */}
          <div>
            <Label className="text-sm font-medium text-foreground">
              Bank *
            </Label>
            <Select
              value={formData.bankId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, bankId: value }))}
              disabled={isSubmitting}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a bank" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: bank.color }}
                      />
                      {bank.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Debt-specific fields */}
          {showDebtFields && (
            <div className="space-y-4 p-4 bg-muted/10 rounded-lg border border-border/30">
              <h3 className="font-medium text-foreground">Debt Details</h3>
              
              {/* Remaining Balance */}
              <div>
                <Label htmlFor="remainingBalance" className="text-sm font-medium text-foreground">
                  Remaining Balance (£)
                </Label>
                <Input
                  id="remainingBalance"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.remainingBalance}
                  onChange={(e) => setFormData(prev => ({ ...prev, remainingBalance: e.target.value }))}
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>

              {/* Monthly Interest */}
              <div>
                <Label htmlFor="monthlyInterest" className="text-sm font-medium text-foreground">
                  Monthly Interest (£)
                </Label>
                <Input
                  id="monthlyInterest"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.monthlyInterest}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthlyInterest: e.target.value }))}
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>

              {/* Interest Rate */}
              <div>
                <Label htmlFor="interestRate" className="text-sm font-medium text-foreground">
                  Interest Rate
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.interestRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
                    className="flex-1"
                    disabled={isSubmitting}
                  />
                  <Select
                    value={formData.interestType}
                    onValueChange={(value: 'monetary' | 'percentage') => setFormData(prev => ({ ...prev, interestType: value }))}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">%</SelectItem>
                      <SelectItem value="monetary">£</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Rate Frequency */}
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Rate Frequency
                </Label>
                <Select
                  value={formData.rateFrequency}
                  onValueChange={(value: 'monthly' | 'annual') => setFormData(prev => ({ ...prev, rateFrequency: value }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-border">
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
                  {editTransaction ? 'Update' : 'Add'} Transaction
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
      </DialogContent>
    </Dialog>
  );
}