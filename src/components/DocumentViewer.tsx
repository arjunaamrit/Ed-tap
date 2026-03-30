import { useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";

interface DocumentViewerProps {
  text: string;
  onWordSelect: (word: string, context: string, rect: DOMRect) => void;
}

const DocumentViewer = ({ text, onWordSelect }: DocumentViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);

  const handleMouseClick = useCallback((e: React.MouseEvent) => {
    // detail is 3 for triple click
    if (e.detail !== 3) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length < 5) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Get surrounding context
    const fullText = text;
    const textLower = fullText.toLowerCase();
    const selectedLower = selectedText.toLowerCase();
    const index = textLower.indexOf(selectedLower);
    
    let context = '';
    if (index !== -1) {
      const contextStart = Math.max(0, index - 100);
      const contextEnd = Math.min(fullText.length, index + selectedText.length + 100);
      context = fullText.slice(contextStart, contextEnd);
    }

    onWordSelect(selectedText, context, rect);
  }, [text, onWordSelect]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // Get the selected text
    const selectedText = selection.toString().trim();
    
    // If no text selected, try to select the word under cursor
    if (!selectedText) {
      const range = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (range) {
        // Expand selection to word boundaries
        const node = range.startContainer;
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || '';
          let start = range.startOffset;
          let end = range.startOffset;
          
          // Find word boundaries using Unicode-aware detection
          while (start > 0 && /[\p{L}\p{M}\p{N}]/u.test(text[start - 1])) start--;
          while (end < text.length && /[\p{L}\p{M}\p{N}]/u.test(text[end])) end++;
          
          if (start < end) {
            range.setStart(node, start);
            range.setEnd(node, end);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }
    }

    // Get the word and validate it using Unicode-aware regex
    const word = selection.toString().trim();
    if (!word || word.length < 2 || !/^[\p{L}\p{M}\p{N}'-]+$/u.test(word)) {
      return;
    }

    // Get context (surrounding text)
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Get surrounding context
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

  // Split text into paragraphs for better formatting
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());

  return (
    <Card className="p-6 md:p-8">
      <div
        ref={containerRef}
        className="prose prose-sm md:prose-base max-w-none select-text cursor-text"
        style={{ touchAction: 'pan-x pan-y' }}
        onClick={handleMouseClick}
        onDoubleClick={handleDoubleClick}
        onTouchEnd={(e) => {
          // Handle double-tap on mobile without triggering zoom
          const now = Date.now();
          const lastTap = lastTapRef.current;
          if (now - lastTap < 300) {
            e.preventDefault();
            e.stopPropagation();
            const touch = e.changedTouches[0];
            if (touch) {
              const mouseEvent = new MouseEvent('dblclick', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: touch.clientX,
                clientY: touch.clientY,
              });
              e.target?.dispatchEvent(mouseEvent);
            }
          }
          lastTapRef.current = now;
        }}
      >
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="mb-4 leading-relaxed text-foreground">
            {paragraph.split('\n').map((line, lineIndex) => (
              <span key={lineIndex}>
                {line}
                {lineIndex < paragraph.split('\n').length - 1 && <br />}
              </span>
            ))}
          </p>
        ))}
      </div>
    </Card>
  );
};

export default DocumentViewer;
