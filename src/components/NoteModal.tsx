
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
      <DialogContent className="max-w-lg md:max-w-3xl mx-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {editingNote ? 'Edit Note' : 'Add New Note'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {editingNote ? 'Update the details of your note.' : 'Create a new note.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">{editingNote ? 'Save Changes' : 'Add Note'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
