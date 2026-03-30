import { Highlighter, StickyNote, Bookmark, Trash2, Sparkles, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { HighlightColor } from '@/hooks/useAnnotations';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AnnotationToolbarProps {
  position: { x: number; y: number };
  onHighlight: (color: HighlightColor) => void;
  onAddNote: () => void;
  onAddBookmark: () => void;
  onExplain: () => void;
  onClose: () => void;
  hasSelection: boolean;
  selectedText?: string;
}

const highlightColors: { color: HighlightColor; className: string; label: string }[] = [
  { color: 'yellow', className: 'bg-[hsl(48,100%,70%)]', label: 'Yellow' },
  { color: 'green', className: 'bg-[hsl(142,70%,70%)]', label: 'Green' },
  { color: 'blue', className: 'bg-[hsl(217,90%,75%)]', label: 'Blue' },
  { color: 'pink', className: 'bg-[hsl(330,80%,80%)]', label: 'Pink' },
];

export const AnnotationToolbar = ({
  position,
  onHighlight,
  onAddNote,
  onAddBookmark,
  onExplain,
  onClose,
  hasSelection,
  selectedText,
}: AnnotationToolbarProps) => {
  const { toast } = useToast();

  if (!hasSelection) return null;

  const handleCopy = () => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText);
      toast({
        title: "Copied to clipboard",
        duration: 2000,
      });
      onClose();
    }
  };

  return (
    <div
      className="fixed z-50 flex items-center gap-1 p-1.5 glass-panel rounded-xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 border-2 border-primary/20"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translateX(-50%)',
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 gap-1.5 hover:bg-primary/10 text-primary font-bold text-xs uppercase tracking-tighter"
        onClick={() => {
          onExplain();
          onClose();
        }}
      >
        <Sparkles className="h-3.5 w-3.5 animate-pulse" />
        <span>Open with TapIt</span>
      </Button>

      <div className="w-px h-4 bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-accent/20"
        onClick={handleCopy}
        title="Copy"
      >
        <Copy className="h-4 w-4" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-accent/20"
            title="Highlight"
          >
            <Highlighter className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="center">
          <div className="flex gap-2">
            {highlightColors.map(({ color, className, label }) => (
              <button
                key={color}
                onClick={() => {
                  onHighlight(color);
                  onClose();
                }}
                className={cn(
                  'w-6 h-6 rounded-full transition-transform hover:scale-110 active:scale-95',
                  className
                )}
                title={label}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-accent/20"
        onClick={() => {
          onAddNote();
          onClose();
        }}
        title="Add Note"
      >
        <StickyNote className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-accent/20"
        onClick={() => {
          onAddBookmark();
          onClose();
        }}
        title="Add Bookmark"
      >
        <Bookmark className="h-4 w-4" />
      </Button>

      <div className="w-px h-4 bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-destructive/20 text-destructive"
        onClick={onClose}
        title="Dismiss"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
