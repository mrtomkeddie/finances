import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Pencil, Trash2 } from 'lucide-react';
import { Bank, BankType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

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
  const [newBankType, setNewBankType] = useState<BankType>('bank');
  const [newBankColor, setNewBankColor] = useState(colorOptions[0]);
  const [editingBank, setEditingBank] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<BankType>('bank');
  const [editColor, setEditColor] = useState(colorOptions[0]);

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

  const getAccountTypeLabel = (type: BankType) => {
    switch (type) {
      case 'bank': return 'Bank Account';
      case 'credit-card': return 'Credit Card';
      case 'loan': return 'Loan';
      default: return 'Bank Account';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] flex flex-col p-0 sm:p-6 overflow-y-auto custom-scrollbar">
        <DialogHeader className="p-6 sm:p-0 sm:pb-4">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Manage Banks & Cards
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Add new accounts or edit existing ones.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 py-4 px-6 sm:px-0">
          {/* Add New Account Section */}
          <div className="space-y-4 border-r-0 md:border-r md:pr-6 border-border">
            <h3 className="text-base font-semibold text-foreground">Add New Account</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account-name" className="text-sm font-medium text-foreground">
                  Account Name
                </Label>
                <Input
                  id="account-name"
                  placeholder="e.g. HSBC Current"
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-type" className="text-sm font-medium text-foreground">
                  Account Type
                </Label>
                <Select value={newBankType} onValueChange={(value: BankType) => setNewBankType(value)}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="bank">Bank Account</SelectItem>
                    <SelectItem value="credit-card">Credit Card</SelectItem>
                    <SelectItem value="loan">Loan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Color Tag</Label>
                <div className="flex flex-wrap gap-3 pt-1">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewBankColor(color)}
                      className={cn(`w-6 h-6 rounded-full border-2 transition-all`,
                        newBankColor === color 
                          ? 'border-primary ring-2 ring-offset-2 ring-primary ring-offset-card' 
                          : 'border-transparent hover:scale-105'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
             <Button 
                onClick={handleAddBank}
                disabled={!newBankName.trim()}
                className="w-full mt-4"
              >
                Add Account
              </Button>
          </div>

          {/* Your Accounts Section */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Your Accounts</h3>
            <div className="space-y-2">
            {userBanks.map((bank) => (
                <div
                key={bank.id}
                className="p-3 rounded-lg bg-muted/50 border border-border"
                >
                {editingBank === bank.id ? (
                    <div className="flex-1 space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Name</Label>
                        <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-9 bg-background border-border text-foreground"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">Type</Label>
                          <Select value={editType} onValueChange={(value: BankType) => setEditType(value)}>
                            <SelectTrigger className="h-9 bg-background border-border text-foreground">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                                <SelectItem value="bank">Bank</SelectItem>
                                <SelectItem value="credit-card">Card</SelectItem>
                                <SelectItem value="loan">Loan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                           <Label className="text-xs text-muted-foreground">Color</Label>
                           <div className="flex items-center gap-1.5 h-9">
                            {colorOptions.map((color) => (
                                <button
                                key={color}
                                type="button"
                                onClick={() => setEditColor(color)}
                                className={cn(`w-5 h-5 rounded-full border-2`,
                                  editColor === color 
                                  ? 'border-primary' 
                                  : 'border-border'
                                )}
                                style={{ backgroundColor: color }}
                                />
                            ))}
                            </div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                          <Button size="sm" onClick={handleSaveEdit}>Save Changes</Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                      </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: bank.color }}
                          />
                          <div>
                            <div className="font-medium text-foreground leading-tight">{bank.name}</div>
                            <div className="text-xs text-muted-foreground">
                                {getAccountTypeLabel(bank.type)}
                            </div>
                          </div>
                      </div>
                      <div className="flex items-center">
                          <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleStartEdit(bank)}
                          className="w-8 h-8"
                          >
                          <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onDeleteBank(bank.id)}
                          className="w-8 h-8 text-destructive hover:text-destructive"
                          >
                          <Trash2 className="w-4 h-4" />
                          </Button>
                      </div>
                    </div>
                )}
                </div>
            ))}
            
            {userBanks.length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No accounts added yet.
                  </p>
                </div>
            )}
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="flex justify-end px-6 sm:px-0 pb-6 sm:pb-0">
            <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
