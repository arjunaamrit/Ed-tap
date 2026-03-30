import { useEffect, useRef, useState } from 'react';
import { Search, X, ChevronUp, ChevronDown, Sparkles, Loader2, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { searchAndSummarize, SearchResult } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InDocumentSearchProps {
  isOpen: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  matchCount: number;
  currentMatchIndex: number;
  onNextMatch: () => void;
  onPreviousMatch: () => void;
  onClose: () => void;
}

export const InDocumentSearch = ({
  isOpen,
  searchQuery,
  onSearchChange,
  matchCount,
  currentMatchIndex,
  onNextMatch,
  onPreviousMatch,
  onClose,
}: InDocumentSearchProps) => {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiResult, setAiResult] = useState<SearchResult | null>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setAiResult(null);
      setIsAiSearching(false);
    }
  }, [isOpen]);

  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsAiSearching(true);
    setAiResult(null);

    try {
      const data = await searchAndSummarize(searchQuery.trim());
      setAiResult(data);
    } catch (error) {
      console.error('AI Search error:', error);
      toast({
        title: "AI Search failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsAiSearching(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        if (e.shiftKey) {
          onPreviousMatch();
        } else {
          onNextMatch();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNextMatch, onPreviousMatch]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-fade-in">
      <div className="glass-card rounded-xl p-3 shadow-xl border border-border/50 flex flex-col gap-3 w-[400px] max-w-[calc(100vw-32px)]">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search in document..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 h-8 text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          
          {searchQuery && (
            <span className={cn(
              "text-xs shrink-0 px-2 py-0.5 rounded-full",
              matchCount > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {matchCount > 0 ? `${currentMatchIndex + 1}/${matchCount}` : 'No matches'}
            </span>
          )}

          <div className="flex items-center gap-1 border-l border-border pl-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onPreviousMatch}
              disabled={matchCount === 0}
              title="Previous match (Shift+Enter)"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onNextMatch}
              disabled={matchCount === 0}
              title="Next match (Enter)"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onClose}
              title="Close (Escape)"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 h-8 text-xs font-bold uppercase tracking-wider gap-2"
            onClick={handleAiSearch}
            disabled={isAiSearching || !searchQuery.trim()}
          >
            {isAiSearching ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            Search with AI
          </Button>
        </div>

        {aiResult && (
          <ScrollArea className="max-h-[300px] pt-2 border-t border-border/50">
            <div className="space-y-3 p-1">
              <div className="text-xs leading-relaxed text-foreground">
                {aiResult.summary}
              </div>
              {aiResult.sources && aiResult.sources.length > 0 && (
                <div className="pt-2 border-t border-border/20">
                  <div className="flex flex-wrap gap-1.5">
                    {aiResult.sources.slice(0, 3).map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-muted/30 border border-border/50 rounded text-[10px] text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                        <span className="max-w-[100px] truncate">{source.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};
