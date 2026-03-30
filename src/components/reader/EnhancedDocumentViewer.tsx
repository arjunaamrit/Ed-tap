import { useCallback, useRef, useState, useEffect } from 'react';
import { AnnotationToolbar } from './AnnotationToolbar';
import { NoteDialog } from './NoteDialog';
import { HighlightColor, Highlight, AnnotationState } from '@/hooks/useAnnotations';
import { SearchMatch } from '@/hooks/useInDocumentSearch';
import { cn } from '@/lib/utils';

interface EnhancedDocumentViewerProps {
  text: string;
  annotations: AnnotationState;
  onWordSelect: (word: string, context: string, rect: DOMRect) => void;
  onExplain: (text: string, context: string, rect: DOMRect) => void;
  onAddHighlight: (text: string, startOffset: number, endOffset: number, color: HighlightColor) => void;
  onAddNote: (content: string, position: number, highlightId?: string) => void;
  onAddBookmark: (paragraphIndex: number, label: string) => void;
  fontSize: number;
  lineHeight: number;
  searchMatches?: SearchMatch[];
  currentSearchMatchIndex?: number;
}

const highlightColorClasses: Record<HighlightColor, string> = {
  yellow: 'highlight-yellow',
  green: 'highlight-green',
  blue: 'highlight-blue',
  pink: 'highlight-pink',
};

export const EnhancedDocumentViewer = ({
  text,
  annotations,
  onWordSelect,
  onExplain,
  onAddHighlight,
  onAddNote,
  onAddBookmark,
  fontSize,
  lineHeight,
  searchMatches = [],
  currentSearchMatchIndex = 0,
}: EnhancedDocumentViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [selectedRange, setSelectedRange] = useState<{
    text: string;
    startOffset: number;
    endOffset: number;
  } | null>(null);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);

  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length < 2) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Calculate offsets within the full text
    let startOffset = 0;
    let endOffset = 0;
    
    // Simple offset calculation based on position in text
    const textLower = text.toLowerCase();
    const selectedLower = selectedText.toLowerCase();
    startOffset = textLower.indexOf(selectedLower);
    endOffset = startOffset + selectedText.length;

    setSelectedRange({
      text: selectedText,
      startOffset,
      endOffset,
    });

    setToolbarPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });

    setShowToolbar(true);
  }, [text]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const selectedText = selection.toString().trim();
    
    if (!selectedText) {
      const range = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (range) {
        const node = range.startContainer;
        if (node.nodeType === Node.TEXT_NODE) {
          const nodeText = node.textContent || '';
          let start = range.startOffset;
          let end = range.startOffset;
          
          while (start > 0 && /\w/.test(nodeText[start - 1])) start--;
          while (end < nodeText.length && /\w/.test(nodeText[end])) end++;
          
          if (start < end) {
            range.setStart(node, start);
            range.setEnd(node, end);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }
    }

    const word = selection.toString().trim();
    if (!word || word.length < 2 || !/^[a-zA-Z'-]+$/.test(word)) {
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    const fullText = text;
    const wordLower = word.toLowerCase();
    const textLower = fullText.toLowerCase();
    const wordIndex = textLower.indexOf(wordLower);
    
    let context = '';
    if (wordIndex !== -1) {
      const contextStart = Math.max(0, wordIndex - 50);
      const contextEnd = Math.min(fullText.length, wordIndex + word.length + 50);
      context = fullText.slice(contextStart, contextEnd);
    }

    onWordSelect(word, context, rect);
  }, [text, onWordSelect]);

  const handleExplain = useCallback(() => {
    if (!selectedRange) return;
    
    // Get context around the selection
    const contextStart = Math.max(0, selectedRange.startOffset - 100);
    const contextEnd = Math.min(text.length, selectedRange.endOffset + 100);
    const context = text.slice(contextStart, contextEnd);
    
    // Get position for the popover
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      onExplain(selectedRange.text, context, rect);
    }
    
    setShowToolbar(false);
  }, [selectedRange, text, onExplain]);

  const handleHighlight = useCallback((color: HighlightColor) => {
    if (!selectedRange) return;
    onAddHighlight(
      selectedRange.text,
      selectedRange.startOffset,
      selectedRange.endOffset,
      color
    );
    setShowToolbar(false);
    window.getSelection()?.removeAllRanges();
  }, [selectedRange, onAddHighlight]);

  const handleAddNote = useCallback(() => {
    setShowToolbar(false);
    setShowNoteDialog(true);
  }, []);

  const handleSaveNote = useCallback((content: string) => {
    if (!selectedRange) return;
    onAddNote(content, selectedRange.startOffset);
    setShowNoteDialog(false);
    setSelectedRange(null);
    window.getSelection()?.removeAllRanges();
  }, [selectedRange, onAddNote]);

  const handleAddBookmark = useCallback(() => {
    onAddBookmark(currentParagraphIndex, `Paragraph ${currentParagraphIndex + 1}`);
    setShowToolbar(false);
    window.getSelection()?.removeAllRanges();
  }, [currentParagraphIndex, onAddBookmark]);

  const handleCloseToolbar = useCallback(() => {
    setShowToolbar(false);
    setSelectedRange(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  // Calculate paragraph offsets for search highlighting
  const paragraphOffsets = useCallback(() => {
    const offsets: { start: number; end: number }[] = [];
    let currentOffset = 0;
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
    
    paragraphs.forEach((p, i) => {
      offsets.push({
        start: currentOffset,
        end: currentOffset + p.length,
      });
      // Add the separator length (assuming \n\n)
      currentOffset += p.length + (i < paragraphs.length - 1 ? 2 : 0);
    });
    
    return offsets;
  }, [text]);

  // Render text with search highlights
  const renderTextWithSearchHighlights = (textContent: string, paragraphStartOffset: number) => {
    if (searchMatches.length === 0) {
      return textContent.split('\n').map((line, lineIndex, arr) => (
        <span key={lineIndex}>
          {line}
          {lineIndex < arr.length - 1 && <br />}
        </span>
      ));
    }

    const paragraphEndOffset = paragraphStartOffset + textContent.length;
    const relevantMatches = searchMatches.filter(
      (m) => m.startOffset < paragraphEndOffset && m.endOffset > paragraphStartOffset
    );

    if (relevantMatches.length === 0) {
      return textContent.split('\n').map((line, lineIndex, arr) => (
        <span key={lineIndex}>
          {line}
          {lineIndex < arr.length - 1 && <br />}
        </span>
      ));
    }

    const segments: { text: string; isMatch: boolean; isCurrent: boolean }[] = [];
    let lastEnd = 0;

    relevantMatches.forEach((match) => {
      const localStart = Math.max(0, match.startOffset - paragraphStartOffset);
      const localEnd = Math.min(textContent.length, match.endOffset - paragraphStartOffset);

      if (localStart > lastEnd) {
        segments.push({ text: textContent.slice(lastEnd, localStart), isMatch: false, isCurrent: false });
      }

      segments.push({
        text: textContent.slice(localStart, localEnd),
        isMatch: true,
        isCurrent: match.index === currentSearchMatchIndex,
      });

      lastEnd = localEnd;
    });

    if (lastEnd < textContent.length) {
      segments.push({ text: textContent.slice(lastEnd), isMatch: false, isCurrent: false });
    }

    return segments.map((segment, i) => {
      if (segment.isMatch) {
        return (
          <mark
            key={i}
            id={segment.isCurrent ? 'current-search-match' : undefined}
            className={cn(
              'rounded px-0.5 transition-colors',
              segment.isCurrent
                ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                : 'bg-accent/50 text-foreground'
            )}
          >
            {segment.text}
          </mark>
        );
      }
      return segment.text.split('\n').map((line, lineIndex, arr) => (
        <span key={`${i}-${lineIndex}`}>
          {line}
          {lineIndex < arr.length - 1 && <br />}
        </span>
      ));
    });
  };

  // Scroll to current match
  useEffect(() => {
    if (searchMatches.length > 0) {
      const currentMatchEl = document.getElementById('current-search-match');
      if (currentMatchEl) {
        currentMatchEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentSearchMatchIndex, searchMatches.length]);

  // Apply highlights to text
  const renderParagraphWithHighlights = (paragraph: string, paragraphIndex: number) => {
    const offsets = paragraphOffsets();
    const paragraphStartOffset = offsets[paragraphIndex]?.start ?? 0;
    
    const isBookmarked = annotations.bookmarks.some(
      b => b.paragraphIndex === paragraphIndex
    );

    return (
      <p
        key={paragraphIndex}
        id={`paragraph-${paragraphIndex}`}
        className={cn(
          'mb-6 leading-relaxed transition-colors',
          isBookmarked && 'border-l-4 border-primary pl-4 -ml-4'
        )}
        style={{ fontSize: `${fontSize}px`, lineHeight }}
        onMouseEnter={() => setCurrentParagraphIndex(paragraphIndex)}
      >
        {renderTextWithSearchHighlights(paragraph, paragraphStartOffset)}
      </p>
    );
  };

  return (
    <>
      <div
        ref={containerRef}
        className="reader-card w-full max-w-none flex-1 rounded-none shadow-none p-4 sm:p-6 md:p-8 lg:p-10 min-h-0 reader-prose select-text cursor-text"
        style={{ touchAction: 'pan-x pan-y' }}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchEnd={(e) => {
          // Handle double-tap on mobile
          const now = Date.now();
          const lastTap = lastTapRef.current;
          if (now - lastTap < 300) {
            e.preventDefault();
            // Trigger word selection on double-tap
            const touch = e.changedTouches[0];
            if (touch) {
              const mouseEvent = new MouseEvent('dblclick', {
                bubbles: true,
                clientX: touch.clientX,
                clientY: touch.clientY,
              });
              e.target?.dispatchEvent(mouseEvent);
            }
          }
          lastTapRef.current = now;
        }}
      >
        {paragraphs.map((paragraph, index) => 
          renderParagraphWithHighlights(paragraph, index)
        )}
      </div>

      <AnnotationToolbar
        position={toolbarPosition}
        onHighlight={handleHighlight}
        onAddNote={handleAddNote}
        onAddBookmark={handleAddBookmark}
        onExplain={handleExplain}
        onClose={handleCloseToolbar}
        hasSelection={showToolbar}
        selectedText={selectedRange?.text}
      />

      <NoteDialog
        open={showNoteDialog}
        onClose={() => setShowNoteDialog(false)}
        onSave={handleSaveNote}
        selectedText={selectedRange?.text}
      />
    </>
  );
};
