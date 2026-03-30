import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote } from 'lucide-react';

interface NoteDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  selectedText?: string;
}

export const NoteDialog = ({
  open,
  onClose,
  onSave,
  selectedText,
}: NoteDialogProps) => {
  const [content, setContent] = useState('');

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim());
      setContent('');
      onClose();
    }
  };

  const handleClose = () => {
    setContent('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-primary" />
            Add Note
          </DialogTitle>
        </DialogHeader>
        
        {selectedText && (
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground italic">
              "{selectedText.slice(0, 100)}{selectedText.length > 100 ? '...' : ''}"
            </p>
          </div>
        )}

        <Textarea
          placeholder="Write your note here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[120px] resize-none"
          autoFocus
        />

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!content.trim()}>
            Save Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
