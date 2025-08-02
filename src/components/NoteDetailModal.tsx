import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Note } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Edit } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface NoteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  onEdit: (note: Note) => void;
}

export function NoteDetailModal({ isOpen, onClose, note, onEdit }: NoteDetailModalProps) {
  if (!note) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return format(parseISO(dateString), "do MMMM yyyy, h:mm a");
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleEdit = () => {
    onEdit(note);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg md:max-w-3xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">{note.title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Last updated: {formatDate(note.updatedAt)}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] my-4 pr-6 custom-scrollbar">
            <div 
              className="prose prose-sm sm:prose-base dark:prose-invert max-w-none" 
              dangerouslySetInnerHTML={{ __html: note.content }} 
            />
        </ScrollArea>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" /> Edit Note
            </Button>
            <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
