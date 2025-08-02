import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Note } from '@/lib/types';
import TiptapEditor from './RichTextEditor';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<Note, 'id'> | Partial<Omit<Note, 'id'>>, noteId?: string) => void;
  editingNote: Note | null;
}

export function NoteModal({ isOpen, onClose, onSave, editingNote }: NoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingNote) {
        setTitle(editingNote.title);
        setContent(editingNote.content);
      } else {
        setTitle('');
        setContent('');
      }
    }
  }, [isOpen, editingNote]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a title for your note.');
      return;
    }

    const now = new Date().toISOString();

    if (editingNote) {
      onSave({
        title,
        content,
        updatedAt: now,
      }, editingNote.id);
    } else {
      onSave({
        title,
        content,
        createdAt: now,
        updatedAt: now,
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg md:max-w-3xl mx-auto bg-card border-border max-h-[90vh] flex flex-col p-0 sm:p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-foreground">
            {editingNote ? 'Edit Note' : 'Add New Note'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {editingNote ? 'Update the details of your note.' : 'Create a new note.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 px-6 py-2 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <Label htmlFor="note-title" className="text-foreground">Title</Label>
                <Input
                  id="note-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your note"
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note-content" className="text-foreground">Content</Label>
                <TiptapEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write your note here..."
                />
              </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 p-6 pt-4 border-t border-border mt-auto">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" className="w-full sm:w-auto">{editingNote ? 'Save Changes' : 'Add Note'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
