
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { useUI } from '@/context/UIContext';
import { Plus, Edit, Trash2, Notebook } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function NotesPage() {
  const { notes, handleDeleteNote } = useData();
  const { openNoteModal } = useUI();

  const sortedNotes = [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleDelete = (noteId: string, noteTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the note "${noteTitle}"?`)) {
      handleDeleteNote(noteId);
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return format(parseISO(dateString), "do MMMM yyyy, h:mm a");
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">Your personal space for thoughts and reminders.</p>
        </div>
        <Button onClick={() => openNoteModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      </div>
      
      {notes.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Notebook className="mx-auto mb-6 h-16 w-16 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Notes Yet</h2>
            <p className="mx-auto max-w-md text-muted-foreground mb-6">
              Click "Add Note" to create your first note.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedNotes.map(note => (
            <Card key={note.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{note.title}</CardTitle>
                <CardDescription>
                  Last updated: {formatDate(note.updatedAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => openNoteModal(note)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(note.id, note.title)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
