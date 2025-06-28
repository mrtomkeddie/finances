import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Pencil, Trash2 } from 'lucide-react';
import { Bank, BankType } from '../types/financial';

interface BankManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  banks: Bank[];
  onAddBank: (bank: Omit<Bank, 'id' | 'userId'>) => void;
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
    setNewBankName('');
    setNewBankType('bank');
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
              {banks.map((bank) => (
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
                        <Select value={editType} onValueChange={(value: BankType) => setEditType(value)}>
                          <SelectTrigger className="bg-input border-border text-foreground text-sm h-8">
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
              
              {banks.length === 0 && (
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
