import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Pencil, Trash2 } from 'lucide-react';
import { Bank, BankType } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';

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
      <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            Manage Banks & Credit Cards
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Add new accounts on the left, and manage existing ones on the right.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 py-4 min-h-0">
          {/* Add New Account Section */}
          <div className="flex flex-col space-y-6 border-r-0 md:border-r md:pr-8 border-border">
            <h3 className="font-medium text-foreground">Add New Account</h3>
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
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewBankColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        newBankColor === color 
                          ? 'border-foreground ring-2 ring-offset-2 ring-foreground ring-offset-card' 
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
             <div className="flex-grow" />
             <Button 
                onClick={handleAddBank}
                disabled={!newBankName.trim()}
                className="w-full"
              >
                Add Account
              </Button>
          </div>

          {/* Your Accounts Section */}
          <div className="flex flex-col space-y-4 min-h-0">
            <h3 className="font-medium text-foreground">Your Accounts</h3>
             <ScrollArea className="flex-grow">
                <div className="pr-4 space-y-3">
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
                            className="text-sm bg-input border-border text-foreground"
                        />
                        <div className="flex items-center gap-2">
                            <Select value={editType} onValueChange={(value: BankType) => setEditType(value)}>
                            <SelectTrigger className="h-8 text-sm bg-input border-border text-foreground">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                                <SelectItem value="bank">Bank Account</SelectItem>
                                <SelectItem value="credit-card">Credit Card</SelectItem>
                                <SelectItem value="loan">Loan</SelectItem>
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
                            className="w-8 h-8 p-0"
                            >
                            <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeleteBank(bank.id)}
                            className="w-8 h-8 p-0 text-red-400 hover:text-red-300"
                            >
                            <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                        </>
                    )}
                    </div>
                ))}
                
                {userBanks.length === 0 && (
                    <div className="py-6 text-center text-muted-foreground">
                    No accounts added yet
                    </div>
                )}
                </div>
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-center pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
