# 🏦 UK Financial Tracker - Main Components

**Document 3 of 5: Application-specific components**

## 📁 File: `src/components/SummaryCards.tsx`

```typescript
import { Card } from "./ui/card";
import { TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import { formatCurrency } from "../utils/financial";

interface SummaryCardsProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalDebt: number;
  monthlyDebtPayments: number;
}

export function SummaryCards({ 
  monthlyIncome, 
  monthlyExpenses, 
  totalDebt, 
  monthlyDebtPayments 
}: SummaryCardsProps) {
  const weeklyIncome = monthlyIncome / 4.33;
  const weeklyExpenses = monthlyExpenses / 4.33;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      {/* Income Card */}
      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-green-500/10 border border-green-500/20">
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
          <div className="flex-1">
            <p className="text-muted-foreground mb-1">Monthly Income</p>
            <p className="text-2xl font-bold text-green-500">{formatCurrency(monthlyIncome)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Weekly: {formatCurrency(weeklyIncome)}
            </p>
          </div>
        </div>
      </Card>

      {/* Expenses Card */}
      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
            <TrendingDown className="h-6 w-6 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-muted-foreground mb-1">Monthly Expenses</p>
            <p className="text-2xl font-bold text-red-500">{formatCurrency(monthlyExpenses)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Weekly: {formatCurrency(weeklyExpenses)}
            </p>
          </div>
        </div>
      </Card>

      {/* Debt Card */}
      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-orange-500/10 border border-orange-500/20">
            <CreditCard className="h-6 w-6 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-muted-foreground mb-1">Total Debt</p>
            <p className="text-2xl font-bold text-orange-500">{formatCurrency(totalDebt)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Monthly payments: {formatCurrency(monthlyDebtPayments)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

## 📁 File: `src/components/ConfirmationDialog.tsx`

```typescript
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
```

## 📁 File: `src/components/BankManagementModal.tsx`

```typescript
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Pencil, Trash2 } from 'lucide-react';
import { Bank } from '../types/financial';

interface BankManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  banks: Bank[];
  onAddBank: (bank: Omit<Bank, 'id'>) => void;
  onUpdateBank: (bankId: string, updates: Partial<Bank>) => void;
  onDeleteBank: (bankId: string) => void;
}

const colorOptions = [
  '#10b981', // emerald
  '#dc2626', // red
  '#2563eb', // blue
  '#f3f4f6', // gray-100
  '#059669', // emerald-600
  '#f59e0b', // amber
  '#7c3aed', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#84cc16', // lime
  '#f97316', // orange
];

export function BankManagementModal({
  isOpen,
  onClose,
  banks,
  onAddBank,
  onUpdateBank,
  onDeleteBank,
}: BankManagementModalProps) {
  const [newBankName, setNewBankName] = useState('');
  const [newBankType, setNewBankType] = useState<'bank' | 'card'>('bank');
  const [newBankColor, setNewBankColor] = useState(colorOptions[0]);
  const [editingBank, setEditingBank] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<'bank' | 'card'>('bank');
  const [editColor, setEditColor] = useState(colorOptions[0]);

  // Filter out the "All" category banks from the display
  const userBanks = banks.filter(bank => !bank.id.startsWith('all-'));

  const handleAddBank = () => {
    if (newBankName.trim()) {
      onAddBank({
        name: newBankName.trim(),
        type: newBankType,
        color: newBankColor,
      });
      setNewBankName('');
      setNewBankType('bank');
      setNewBankColor(colorOptions[0]);
    }
  };

  const handleStartEdit = (bank: Bank) => {
    setEditingBank(bank.id);
    setEditName(bank.name);
    setEditType(bank.type);
    setEditColor(bank.color);
  };

  const handleSaveEdit = () => {
    if (editingBank && editName.trim()) {
      onUpdateBank(editingBank, {
        name: editName.trim(),
        type: editType,
        color: editColor,
      });
      setEditingBank(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingBank(null);
    setEditName('');
    setEditType('bank');
    setEditColor(colorOptions[0]);
  };

  const getAccountTypeLabel = (type: 'bank' | 'card') => {
    switch (type) {
      case 'bank': return 'Bank Account';
      case 'card': return 'Credit Card';
      default: return 'Bank Account';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            Manage Banks & Credit Cards
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Add, edit or remove your bank accounts and credit cards
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Add New Account Section */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Add New Account</h3>
            <div className="space-y-4">
              {/* Account Name */}
              <div className="space-y-2">
                <Label htmlFor="account-name" className="text-sm font-medium text-foreground">
                  Account Name
                </Label>
                <Input
                  id="account-name"
                  placeholder="HSBC Current Account"
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>

              {/* Account Type */}
              <div className="space-y-2">
                <Label htmlFor="account-type" className="text-sm font-medium text-foreground">
                  Account Type
                </Label>
                <Select value={newBankType} onValueChange={(value: 'bank' | 'card') => setNewBankType(value)}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="bank">Bank Account</SelectItem>
                    <SelectItem value="card">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Color</Label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewBankColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        newBankColor === color 
                          ? 'border-foreground scale-110' 
                          : 'border-border hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Add Account Button */}
              <Button 
                onClick={handleAddBank}
                disabled={!newBankName.trim()}
                className="w-full"
              >
                Add Account
              </Button>
            </div>
          </div>

          {/* Your Accounts Section */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Your Accounts</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {userBanks.map((bank) => (
                <div
                  key={bank.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                >
                  {editingBank === bank.id ? (
                    <div className="flex-1 space-y-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-input border-border text-foreground text-sm"
                      />
                      <div className="flex items-center gap-2">
                        <Select value={editType} onValueChange={(value: 'bank' | 'card') => setEditType(value)}>
                          <SelectTrigger className="bg-input border-border text-foreground text-sm h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="bank">Bank Account</SelectItem>
                            <SelectItem value="card">Credit Card</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-1">
                          {colorOptions.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setEditColor(color)}
                              className={`w-4 h-4 rounded-full border ${
                                editColor === color 
                                  ? 'border-foreground' 
                                  : 'border-border'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: bank.color }}
                        />
                        <div>
                          <div className="font-medium text-foreground">{bank.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {getAccountTypeLabel(bank.type)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEdit(bank)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteBank(bank.id)}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {userBanks.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No accounts added yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-center pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## 📁 File: `src/components/TransactionModal.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Transaction, Bank, TransactionType, FrequencyType } from '../types/financial';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  banks: Bank[];
  editTransaction?: Transaction;
}

const categories = [
  // Income categories
  'Salary', 'Benefits', 'Rental Income', 'Investment Income', 'Freelance', 'Other Income',
  // Expense categories
  'Housing', 'Transportation', 'Food & Dining', 'Shopping', 'Entertainment', 'Bills & Utilities',
  'Healthcare', 'Education', 'Travel', 'Personal Care', 'Insurance', 'Subscriptions', 'Other Expenses',
  // Debt categories
  'Credit Card', 'Personal Loan', 'Mortgage', 'Student Loan', 'Other Debt'
];

export function TransactionModal({
  isOpen,
  onClose,
  onAddTransaction,
  banks,
  editTransaction,
}: TransactionModalProps) {
  const [formData, setFormData] = useState({
    type: 'income' as TransactionType,
    bankId: '',
    title: '',
    amount: '',
    frequency: 'monthly' as FrequencyType,
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    remainingBalance: '',
    monthlyInterestCharge: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when editTransaction changes
  useEffect(() => {
    if (editTransaction) {
      setFormData({
        type: editTransaction.type,
        bankId: editTransaction.bankId,
        title: editTransaction.title,
        amount: editTransaction.amount.toString(),
        frequency: editTransaction.frequency,
        category: editTransaction.description || '',
        date: editTransaction.date,
        description: editTransaction.description || '',
        remainingBalance: editTransaction.remainingBalance?.toString() || '',
        monthlyInterestCharge: editTransaction.monthlyInterestCharge?.toString() || '',
      });
    } else {
      // Reset form for new transaction
      setFormData({
        type: 'income',
        bankId: '',
        title: '',
        amount: '',
        frequency: 'monthly',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        remainingBalance: '',
        monthlyInterestCharge: '',
      });
    }
    // Clear errors when editTransaction changes
    setErrors({});
  }, [editTransaction]);

  // Filter banks to exclude category banks
  const availableBanks = banks.filter(bank => !bank.id.startsWith('all-'));

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) newErrors.type = 'Transaction type is required';
    if (!formData.bankId) newErrors.bankId = 'Bank account is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.frequency) newErrors.frequency = 'Frequency is required';
    if (!formData.date) newErrors.date = 'Date is required';

    // Validate debt-specific fields
    if (formData.type === 'debt') {
      if (!formData.remainingBalance || parseFloat(formData.remainingBalance) < 0) {
        newErrors.remainingBalance = 'Remaining balance is required for debt';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const transaction: Omit<Transaction, 'id'> = {
      type: formData.type,
      bankId: formData.bankId,
      title: formData.title.trim(),
      amount: parseFloat(formData.amount),
      frequency: formData.frequency,
      date: formData.date,
      description: formData.description.trim() || formData.category,
      ...(formData.type === 'debt' && {
        remainingBalance: parseFloat(formData.remainingBalance) || 0,
        monthlyInterestCharge: parseFloat(formData.monthlyInterestCharge) || 0,
      }),
    };

    onAddTransaction(transaction);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      type: 'income',
      bankId: '',
      title: '',
      amount: '',
      frequency: 'monthly',
      category: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      remainingBalance: '',
      monthlyInterestCharge: '',
    });
    setErrors({});
    onClose();
  };

  const getFilteredCategories = () => {
    if (formData.type === 'income') {
      return categories.filter(cat => 
        ['Salary', 'Benefits', 'Rental Income', 'Investment Income', 'Freelance', 'Other Income'].includes(cat)
      );
    } else if (formData.type === 'expense') {
      return categories.filter(cat => 
        !['Salary', 'Benefits', 'Rental Income', 'Investment Income', 'Freelance', 'Other Income', 'Credit Card', 'Personal Loan', 'Mortgage', 'Student Loan', 'Other Debt'].includes(cat)
      );
    } else {
      return ['Credit Card', 'Personal Loan', 'Mortgage', 'Student Loan', 'Other Debt'];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            {editTransaction ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Fill out the transaction details below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Type and Bank Account Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: TransactionType) => handleInputChange('type', value)}
              >
                <SelectTrigger className={`bg-input border-border text-foreground ${errors.type ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="debt">Debt</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-red-400">{errors.type}</p>}
            </div>

            {/* Bank Account */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Bank Account</Label>
              <Select 
                value={formData.bankId} 
                onValueChange={(value) => handleInputChange('bankId', value)}
              >
                <SelectTrigger className={`bg-input border-border text-foreground ${errors.bankId ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {availableBanks.map((bank) => (
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
              {errors.bankId && <p className="text-xs text-red-400">{errors.bankId}</p>}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Title</Label>
            <Input
              placeholder="Enter transaction title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`bg-input border-border text-foreground ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <p className="text-xs text-red-400">{errors.title}</p>}
          </div>

          {/* Amount and Frequency Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Amount (£)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="100"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={`bg-input border-border text-foreground ${errors.amount ? 'border-red-500' : ''}`}
              />
              {errors.amount && <p className="text-xs text-red-400">{errors.amount}</p>}
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Frequency</Label>
              <Select 
                value={formData.frequency} 
                onValueChange={(value: FrequencyType) => handleInputChange('frequency', value)}
              >
                <SelectTrigger className={`bg-input border-border text-foreground ${errors.frequency ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Monthly" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="4-weekly">4-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              {errors.frequency && <p className="text-xs text-red-400">{errors.frequency}</p>}
            </div>
          </div>

          {/* Category and Date Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {getFilteredCategories().map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`bg-input border-border text-foreground ${errors.date ? 'border-red-500' : ''}`}
              />
              {errors.date && <p className="text-xs text-red-400">{errors.date}</p>}
            </div>
          </div>

          {/* Debt-specific fields */}
          {formData.type === 'debt' && (
            <div className="grid grid-cols-2 gap-4">
              {/* Remaining Balance */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Remaining Balance (£)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.remainingBalance}
                  onChange={(e) => handleInputChange('remainingBalance', e.target.value)}
                  className={`bg-input border-border text-foreground ${errors.remainingBalance ? 'border-red-500' : ''}`}
                />
                {errors.remainingBalance && <p className="text-xs text-red-400">{errors.remainingBalance}</p>}
              </div>

              {/* Monthly Interest Charge */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Monthly Interest (£)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.monthlyInterestCharge}
                  onChange={(e) => handleInputChange('monthlyInterestCharge', e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Description (Optional)</Label>
            <Textarea
              placeholder="Enter additional details..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="bg-input border-border text-foreground resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editTransaction ? 'Update Transaction' : 'Add Transaction'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## 📁 File: `src/components/TransactionDetailModal.tsx`

```typescript
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Calendar,
  CreditCard,
  Edit,
  Trash2,
  FileText,
} from "lucide-react";
import { Transaction, Bank } from "../types/financial";
import {
  formatCurrency,
  calculateMonthlyAmount,
} from "../utils/financial";
import {
  formatDate,
  getDaysUntil,
  isOverdue,
} from "../utils/dateUtils";
import { ConfirmationDialog } from "./ConfirmationDialog";

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  banks: Bank[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
}

export function TransactionDetailModal({
  isOpen,
  onClose,
  transaction,
  banks,
  onEdit,
  onDelete,
}: TransactionDetailModalProps) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] =
    useState(false);

  if (!transaction) return null;

  const bank = banks.find((b) => b.id === transaction.bankId);
  const bankName = bank?.name || "Unknown";
  const bankColor = bank?.color || "#6366f1";

  const getTypeColor = (type: string) => {
    switch (type) {
      case "income":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "expense":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "debt":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "transfer":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDueDate = (dateString: string) => {
    const daysUntil = getDaysUntil(dateString);
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString("en-GB", {
      weekday: "long",
    });
    const dayNum = date.getDate();
    const monthName = date.toLocaleDateString("en-GB", {
      month: "long",
    });
    const year = date.getFullYear();

    return `${dayName} ${dayNum} ${monthName} ${year}`;
  };

  const handleEdit = () => {
    onEdit(transaction);
    onClose();
  };

  const handleDeleteClick = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(transaction.id);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="max-w-lg bg-card border-border p-0"
          aria-describedby={undefined}
        >
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-xl font-semibold text-foreground">
              Transaction Details
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-6">
            {/* Transaction Title and Amount */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground mb-3 break-words">
                  {transaction.title}
                </h3>
                <Badge
                  variant="outline"
                  className={`${getTypeColor(transaction.type)} border w-fit`}
                >
                  {getTypeLabel(transaction.type)}
                </Badge>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {formatCurrency(transaction.amount)}
                </div>
                <div className="text-sm text-muted-foreground capitalize">
                  {transaction.frequency}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex items-center gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 h-10"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteClick}
                className="flex items-center gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 h-10"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>

            {/* Transaction Details */}
            <div className="space-y-6">
              {/* Next Due Date */}
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-2">
                    Next Due Date
                  </div>
                  <div className="font-semibold text-foreground">
                    {formatDueDate(transaction.date)}
                  </div>
                </div>
              </div>

              {/* Bank */}
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-2">
                    Bank
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: bankColor }}
                    />
                    <span className="font-semibold text-foreground">
                      {bankName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Details for Debt */}
              {transaction.type === "debt" && (
                <div className="space-y-4 pt-4 border-t border-border">
                  {transaction.remainingBalance && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">
                        Remaining Balance
                      </span>
                      <span className="font-semibold text-orange-400">
                        {formatCurrency(
                          transaction.remainingBalance,
                        )}
                      </span>
                    </div>
                  )}
                  {transaction.monthlyInterestCharge && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">
                        Monthly Interest
                      </span>
                      <span className="font-semibold text-red-400">
                        {formatCurrency(
                          transaction.monthlyInterestCharge,
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Monthly Amount */}
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  Monthly Amount
                </span>
                <span className="font-bold text-lg text-foreground">
                  {formatCurrency(
                    calculateMonthlyAmount(
                      transaction.amount,
                      transaction.frequency,
                    ),
                  )}
                </span>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <h4 className="font-semibold text-foreground">
                  Notes
                </h4>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 min-h-[100px] border border-border/30">
                {transaction.description ? (
                  <p className="text-sm text-foreground leading-relaxed font-medium">
                    {transaction.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No notes added yet. Click Edit to add notes
                    for this transaction.
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        description={`Are you sure you want to delete "${transaction.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}
```

---

**Continue with Document 4: UK_FINANCIAL_TRACKER_STYLING.md**