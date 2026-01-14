import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pin, Trash2, Edit2, MessageSquare, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    getNotes,
    addNote,
    updateNote,
    deleteNote,
    InternalNote,
} from '@/services/internalNoteService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface InternalNotesPanelProps {
    caseId: string;
    canEdit: boolean;
    className?: string;
}

export const InternalNotesPanel: React.FC<InternalNotesPanelProps> = ({
    caseId,
    canEdit,
    className,
}) => {
    const queryClient = useQueryClient();
    const [newNoteContent, setNewNoteContent] = useState('');
    const [editingNote, setEditingNote] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [addDialogOpen, setAddDialogOpen] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['internalNotes', caseId],
        queryFn: () => getNotes(caseId),
    });

    const notes: InternalNote[] = data?.data || [];
    const pinnedNotes = notes.filter((n) => n.isPinned);
    const regularNotes = notes.filter((n) => !n.isPinned);

    const addMutation = useMutation({
        mutationFn: () => addNote(caseId, newNoteContent),
        onSuccess: () => {
            toast.success('Note added successfully');
            queryClient.invalidateQueries({ queryKey: ['internalNotes', caseId] });
            setNewNoteContent('');
            setAddDialogOpen(false);
        },
        onError: () => {
            toast.error('Failed to add note');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({
            noteId,
            content,
            isPinned,
        }: {
            noteId: string;
            content?: string;
            isPinned?: boolean;
        }) => updateNote(noteId, content, undefined, undefined, isPinned),
        onSuccess: () => {
            toast.success('Note updated successfully');
            queryClient.invalidateQueries({ queryKey: ['internalNotes', caseId] });
            setEditingNote(null);
            setEditContent('');
        },
        onError: () => {
            toast.error('Failed to update note');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (noteId: string) => deleteNote(noteId),
        onSuccess: () => {
            toast.success('Note deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['internalNotes', caseId] });
        },
        onError: () => {
            toast.error('Failed to delete note');
        },
    });

    const formatDate = (date: string) => {
        const noteDate = new Date(date);
        const now = new Date();
        const diff = now.getTime() - noteDate.getTime();
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return noteDate.toLocaleDateString();
    };

    const NoteCard = ({ note }: { note: InternalNote }) => (
        <div
            className={cn(
                'p-4 rounded-lg border bg-card',
                note.isPinned && 'border-primary bg-primary/5'
            )}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                    {note.isPinned && <Pin className="h-4 w-4 text-primary" />}
                    <span className="text-sm font-medium">{note.author.name}</span>
                    <Badge variant="secondary" className="text-xs">
                        {note.author.role}
                    </Badge>
                </div>
                <div className="flex items-center gap-1">
                    {canEdit && (
                        <>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                updateMutation.mutate({
                                                    noteId: note._id,
                                                    isPinned: !note.isPinned,
                                                })
                                            }
                                        >
                                            <Pin
                                                className={cn('h-4 w-4', note.isPinned && 'fill-current text-primary')}
                                            />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {note.isPinned ? 'Unpin note' : 'Pin note'}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setEditingNote(note._id);
                                    setEditContent(note.content);
                                }}
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteMutation.mutate(note._id)}
                            >
                                <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {editingNote === note._id ? (
                <div className="space-y-2">
                    <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[100px]"
                    />
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={() =>
                                updateMutation.mutate({
                                    noteId: note._id,
                                    content: editContent,
                                })
                            }
                        >
                            Save
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setEditingNote(null);
                                setEditContent('');
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
                        {note.isEdited && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge variant="outline" className="text-xs">
                                            Edited
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <div className="text-xs">
                                            <p>Edit history:</p>
                                            {note.editHistory.slice(0, 3).map((edit, i) => (
                                                <p key={i} className="text-muted-foreground">
                                                    {new Date(edit.editedAt).toLocaleString()}
                                                </p>
                                            ))}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </>
            )}
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Internal Notes
                        <Badge variant="secondary">{notes.length}</Badge>
                    </CardTitle>
                    {canEdit && (
                        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Note
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Internal Note</DialogTitle>
                                    <DialogDescription>
                                        This note will only be visible to employees and admins.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <Textarea
                                        value={newNoteContent}
                                        onChange={(e) => setNewNoteContent(e.target.value)}
                                        placeholder="Enter your note here..."
                                        className="min-h-[150px]"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setAddDialogOpen(false)}
                                        disabled={addMutation.isPending}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => addMutation.mutate()}
                                        disabled={!newNoteContent.trim() || addMutation.isPending}
                                    >
                                        {addMutation.isPending ? 'Adding...' : 'Add Note'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {notes.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No internal notes yet</p>
                        {canEdit && <p className="text-sm mt-2">Click "Add Note" to create one</p>}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pinnedNotes.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-muted-foreground">Pinned Notes</h3>
                                {pinnedNotes.map((note) => (
                                    <NoteCard key={note._id} note={note} />
                                ))}
                            </div>
                        )}

                        {regularNotes.length > 0 && (
                            <div className="space-y-3">
                                {pinnedNotes.length > 0 && (
                                    <h3 className="text-sm font-semibold text-muted-foreground">All Notes</h3>
                                )}
                                {regularNotes.map((note) => (
                                    <NoteCard key={note._id} note={note} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
