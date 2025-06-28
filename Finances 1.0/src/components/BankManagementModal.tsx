import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import { Bank } from '../types/financial';

interface BankManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  banks: Bank[];
  onAddBank: (bank: Omit<Bank, 'id'>) => void;
  onUpdateBank: (bankId: string, updates: Partial<Bank>) => void;
  onDeleteBank: (bankId: string) => void;
}

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Purple  
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
];

export function BankManagementModal({ 
  isOpen, 
  onClose, 
  banks, 
  onAddBank, 
  onUpdateBank, 
  onDeleteBank 
}: BankManagementModalProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [newBankName, setNewBankName] = useState('');
  const [newBankColor, setNewBankColor] = useState(PRESET_COLORS[0]);

  const handleAddBank = () => {
    if (newBankName.trim()) {
      onAddBank({
        name: newBankName.trim(),
        color: newBankColor,
      });
      setNewBankName('');
      setNewBankColor(PRESET_COLORS[0]);
      setIsAddingNew(false);
    }
  };

  const handleUpdateBank = () => {
    if (editingBank && newBankName.trim()) {
      onUpdateBank(editingBank.id, {
        name: newBankName.trim(),
        color: newBankColor,
      });
      setEditingBank(null);
      setNewBankName('');
      setNewBankColor(PRESET_COLORS[0]);
    }
  };

  const startEditing = (bank: Bank) => {
    setEditingBank(bank);
    setNewBankName(bank.name);
    setNewBankColor(bank.color);
    setIsAddingNew(false);
  };

  const cancelEditing = () => {
    setEditingBank(null);
    setIsAddingNew(false);
    setNewBankName('');
    setNewBankColor(PRESET_COLORS[0]);
  };

  const handleClose = () => {
    cancelEditing();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Manage Banks</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing Banks */}
          {banks.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">Your Banks</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {banks.map((bank) => (
                  <div
                    key={bank.id}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: bank.color }}
                      />
                      <span className="font-medium text-foreground">{bank.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => startEditing(bank)}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete ${bank.name}?`)) {
                            onDeleteBank(bank.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add/Edit Bank Form */}
          {(isAddingNew || editingBank) && (
            <div className="space-y-4 p-4 bg-muted/10 rounded-lg border border-border/30">
              <h3 className="font-medium text-foreground">
                {editingBank ? 'Edit Bank' : 'Add New Bank'}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="bankName" className="text-sm font-medium text-foreground">
                    Bank Name
                  </Label>
                  <Input
                    id="bankName"
                    placeholder="Enter bank name"
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Color
                  </Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          newBankColor === color
                            ? 'border-foreground scale-110'
                            : 'border-border hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewBankColor(color)}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={editingBank ? handleUpdateBank : handleAddBank}
                    disabled={!newBankName.trim()}
                    size="sm"
                    className="flex-1 gap-2"
                  >
                    <Save className="h-3 w-3" />
                    {editingBank ? 'Update' : 'Add'} Bank
                  </Button>
                  <Button
                    variant="outline"
                    onClick={cancelEditing}
                    size="sm"
                    className="gap-2"
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Add New Bank Button */}
          {!isAddingNew && !editingBank && (
            <Button
              onClick={() => setIsAddingNew(true)}
              variant="outline"
              className="w-full gap-2 border-dashed"
            >
              <Plus className="h-4 w-4" />
              Add New Bank
            </Button>
          )}

          {/* Close Button */}
          <div className="pt-2 border-t border-border">
            <Button onClick={handleClose} variant="secondary" className="w-full">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}