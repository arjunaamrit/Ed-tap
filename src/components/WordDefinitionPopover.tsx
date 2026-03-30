import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { X, Loader2, Volume2, Search, ExternalLink, Languages, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getAuthHeaders } from "@/lib/auth-helpers";
import { defineWord, translateText, searchAndSummarize, SearchResult, Source, getMoreInfo, explainSentence } from "@/services/geminiService";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Maximize2, Minimize2 } from "lucide-react";

const LANGUAGES = [
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "bn", name: "Bengali" },
  { code: "tr", name: "Turkish" },
  { code: "vi", name: "Vietnamese" },
  { code: "th", name: "Thai" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "sv", name: "Swedish" },
  { code: "id", name: "Indonesian" },
  { code: "ms", name: "Malay" },
];

interface WordDefinitionPopoverProps {
  word: string;
  context: string;
  position: { x: number; y: number };
  onClose: () => void;
}

// Component for clickable/double-tappable text within definitions
const ClickableText = ({ 
  text, 
  onWordClick,
  className = ""
}: { 
  text: string; 
  onWordClick: (word: string) => void;
  className?: string;
}) => {
  const lastTapRef = useRef<number>(0);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    let selectedText = selection.toString().trim();
    
    // If no text selected, try to select the word under cursor
    if (!selectedText) {
      const range = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (range) {
        const node = range.startContainer;
        if (node.nodeType === Node.TEXT_NODE) {
          const nodeText = node.textContent || '';
          let start = range.startOffset;
          let end = range.startOffset;
          
          // Use Unicode-aware word boundary detection
          while (start > 0 && /[\p{L}\p{M}\p{N}]/u.test(nodeText[start - 1])) start--;
          while (end < nodeText.length && /[\p{L}\p{M}\p{N}]/u.test(nodeText[end])) end++;
          
          if (start < end) {
            range.setStart(node, start);
            range.setEnd(node, end);
            selection.removeAllRanges();
            selection.addRange(range);
            selectedText = selection.toString().trim();
          }
        }
      }
    }

    // Improved regex to support international characters
    if (selectedText && selectedText.length >= 2 && /^[\p{L}\p{M}\p{N}'-]+$/u.test(selectedText)) {
      onWordClick(selectedText);
    }
  }, [onWordClick]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
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
  }, []);

  return (
    <span 
      onDoubleClick={handleDoubleClick}
      onTouchEnd={handleTouchEnd}
      className={`cursor-text select-text ${className}`}
    >
      {text}
    </span>
  );
};

// Reusable AI Search Section component
const AISearchSection = ({ 
  initialQuery,
  targetLanguage,
  targetLanguageName
}: { 
  initialQuery: string;
  targetLanguage?: string | null;
  targetLanguageName?: string | null;
}) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [translatedSearchSummary, setTranslatedSearchSummary] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Update query when initialQuery changes (e.g. when word changes)
  useEffect(() => {
    setSearchQuery(initialQuery);
    setSearchResult(null);
    setTranslatedSearchSummary(null);
  }, [initialQuery]);

  // Translate search results if a language is selected
  useEffect(() => {
    const translateResult = async () => {
      if (!targetLanguageName || !searchResult?.summary) {
        setTranslatedSearchSummary(null);
        return;
      }
      
      setIsTranslating(true);
      try {
        const data = await translateText(searchResult.summary, targetLanguageName);
        setTranslatedSearchSummary(data.translation);
      } catch (err) {
        console.error('Search translation error:', err);
      } finally {
        setIsTranslating(false);
      }
    };

    translateResult();
  }, [targetLanguageName, searchResult]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResult(null);

    try {
      const data = await searchAndSummarize(searchQuery.trim());
      setSearchResult(data);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Ask AI about this..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 text-xs bg-muted/30 border-muted-foreground/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            disabled={isSearching}
          />
          {isSearching && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <Button 
          onClick={() => handleSearch()}
          disabled={isSearching || !searchQuery.trim()}
          size="sm"
          variant="secondary"
          className="h-9 px-3 text-xs font-medium"
        >
          <Search className="h-3.5 w-3.5 mr-1.5" />
          Search
        </Button>
      </div>

      {(isSearching || isTranslating || searchResult) && (
        <div className="bg-muted/20 rounded-lg border border-border/50 overflow-hidden animate-in fade-in slide-in-from-top-1">
          <div className="p-3">
            {isSearching ? (
              <div className="flex items-center gap-2 py-1">
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">AI is searching...</span>
              </div>
            ) : isTranslating ? (
              <div className="flex items-center gap-2 py-1">
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Translating results...</span>
              </div>
            ) : searchResult ? (
              <div className="space-y-3">
                <div className="text-xs text-foreground leading-relaxed">
                  {translatedSearchSummary || searchResult.summary}
                </div>
                
                {searchResult.sources && searchResult.sources.length > 0 && (
                  <div className="pt-2 border-t border-border/30">
                    <div className="flex flex-wrap gap-1.5">
                      {searchResult.sources.slice(0, 3).map((source, idx) => (
                        <a
                          key={idx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-background border border-border rounded text-[10px] text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                        >
                          <ExternalLink className="h-2.5 w-2.5" />
                          <span className="max-w-[80px] truncate">{source.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

// Nested definition component for recursive lookups
const NestedDefinition = ({ 
  word, 
  parentDefinition,
  onClose,
  depth = 1,
  targetLanguage,
  targetLanguageName
}: { 
  word: string;
  parentDefinition: string;
  onClose: () => void;
  depth?: number;
  targetLanguage?: string | null;
  targetLanguageName?: string | null;
}) => {
  const [definition, setDefinition] = useState<string>("");
  const [translatedDefinition, setTranslatedDefinition] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string>("");
  const [nestedWord, setNestedWord] = useState<string | null>(null);

  useEffect(() => {
    const fetchDefinition = async () => {
      setIsLoading(true);
      setError("");
      
      try {
        const contextAroundWord = parentDefinition;
        const data = await defineWord(word, contextAroundWord);

        if (data && data.success && data.definition) {
          setDefinition(data.definition);
        } else {
          throw new Error('No definition received');
        }
      } catch (err) {
        console.error('Error fetching nested definition:', err);
        setError(err instanceof Error ? err.message : 'Failed to get definition');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDefinition();
  }, [word, parentDefinition]);

  useEffect(() => {
    const translateDefinition = async () => {
      if (!targetLanguage || !targetLanguageName || !definition) {
        setTranslatedDefinition("");
        return;
      }
      
      setIsTranslating(true);
      try {
        const data = await translateText(definition, targetLanguageName);
        setTranslatedDefinition(data.translation);
      } catch (err) {
        console.error('Translation error:', err);
      } finally {
        setIsTranslating(false);
      }
    };

    translateDefinition();
  }, [targetLanguage, targetLanguageName, definition]);

  const handleNestedWordClick = useCallback((clickedWord: string) => {
    if (clickedWord.toLowerCase() !== word.toLowerCase()) {
      setNestedWord(clickedWord);
    }
  }, [word]);

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const displayDefinition = targetLanguage && translatedDefinition ? translatedDefinition : definition;

  return (
    <div className={`border-l-2 border-primary/30 pl-4 mt-4 mb-2 ${depth > 3 ? 'opacity-90' : ''}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm capitalize text-foreground">{word}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-primary/10"
            onClick={handleSpeak}
          >
            <Volume2 className="h-3.5 w-3.5" />
          </Button>
          {targetLanguageName && (
            <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-semibold uppercase tracking-wider">
              {targetLanguageName}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center gap-2 py-2">
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Looking up...</span>
        </div>
      ) : error ? (
        <p className="text-xs text-destructive bg-destructive/5 p-2 rounded">{error}</p>
      ) : isTranslating ? (
        <div className="flex items-center gap-2 py-2">
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Translating...</span>
        </div>
      ) : (
        <>
          <p className="text-xs text-foreground leading-relaxed font-medium">
            <ClickableText text={displayDefinition} onWordClick={handleNestedWordClick} />
          </p>
        </>
      )}

      {nestedWord && depth < 10 && (
        <NestedDefinition 
          word={nestedWord}
          parentDefinition={definition}
          onClose={() => setNestedWord(null)}
          depth={depth + 1}
          targetLanguage={targetLanguage}
          targetLanguageName={targetLanguageName}
        />
      )}
    </div>
  );
};

const WordDefinitionPopover = ({ word, context, position, onClose }: WordDefinitionPopoverProps) => {
  const { toast } = useToast();
  const [definition, setDefinition] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [nestedWord, setNestedWord] = useState<string | null>(null);
  
  // More info state
  const [moreInfo, setMoreInfo] = useState<string | null>(null);
  const [isFetchingMoreInfo, setIsFetchingMoreInfo] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  // Translation state
  const [translation, setTranslation] = useState<string | null>(null);
  const [translatedDefinition, setTranslatedDefinition] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startPointerX: number;
    startPointerY: number;
    startLeft: number;
    startTop: number;
  } | null>(null);

  const getInitialPosition = useCallback(() => {
    const popoverWidth = 480;
    
    // If position is provided, try to place it near the click
    if (position) {
      const x = Math.max(16, Math.min(position.x - popoverWidth / 2, window.innerWidth - popoverWidth - 16));
      const y = Math.max(16, Math.min(position.y, window.innerHeight - 400 - 16));
      return { left: x, top: y };
    }

    const x = Math.max(16, (window.innerWidth - popoverWidth) / 2);
    const y = 100; // Start near top
    return { left: x, top: y };
  }, [position]);

  const [popoverStyle, setPopoverStyle] = useState<{ left: number; top: number }>(() => getInitialPosition());

  const isSentence = useMemo(() => word.trim().includes(" "), [word]);

  useEffect(() => {
    const fetchDefinition = async () => {
      setIsLoading(true);
      setError("");
      setNestedWord(null);
      setMoreInfo(null);
      setShowMoreInfo(false);
      
      try {
        if (isSentence) {
          const data = await explainSentence(word, context);
          if (data && data.success && data.explanation) {
            setDefinition(data.explanation);
          } else {
            throw new Error('No explanation received');
          }
        } else {
          const data = await defineWord(word, context);
          if (data && data.success && data.definition) {
            setDefinition(data.definition);
          } else {
            throw new Error('No definition received');
          }
        }
      } catch (err) {
        console.error('Error fetching definition/explanation:', err);
        setError(err instanceof Error ? err.message : 'Failed to get info');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDefinition();
  }, [word, context, isSentence]);

  useEffect(() => {
    setPopoverStyle(getInitialPosition());
  }, [word, getInitialPosition]);

  const clampToViewport = useCallback((left: number, top: number) => {
    const rect = popoverRef.current?.getBoundingClientRect();
    const w = rect?.width ?? 480;
    const h = rect?.height ?? 400;

    const maxLeft = Math.max(16, window.innerWidth - w - 16);
    const maxTop = Math.max(16, window.innerHeight - h - 16);

    return {
      left: Math.min(Math.max(16, left), maxLeft),
      top: Math.min(Math.max(16, top), maxTop),
    };
  }, []);

  const startDrag = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStateRef.current = {
      pointerId: e.pointerId,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startLeft: popoverStyle.left,
      startTop: popoverStyle.top,
    };
  }, [popoverStyle.left, popoverStyle.top]);

  const onDragMove = useCallback((e: React.PointerEvent) => {
    const s = dragStateRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();

    const nextLeft = s.startLeft + (e.clientX - s.startPointerX);
    const nextTop = s.startTop + (e.clientY - s.startPointerY);
    setPopoverStyle(clampToViewport(nextLeft, nextTop));
  }, [clampToViewport]);

  const endDrag = useCallback((e: React.PointerEvent) => {
    const s = dragStateRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    dragStateRef.current = null;
  }, []);

  useEffect(() => {
    const onResize = () => {
      setPopoverStyle((p) => clampToViewport(p.left, p.top));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [clampToViewport]);

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const handleTranslate = async (langCode: string, langName: string) => {
    setIsTranslating(true);
    setSelectedLanguage(langName);
    setSelectedLanguageCode(langCode);
    setTranslation(null);
    setTranslatedDefinition(null);
    
    try {
      const [wordTrans, defTrans] = await Promise.all([
        translateText(word, langName),
        definition ? translateText(definition, langName) : Promise.resolve({ translation: null })
      ]);

      setTranslation(wordTrans.translation);
      if (defTrans.translation) {
        setTranslatedDefinition(defTrans.translation);
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleClearTranslation = () => {
    setSelectedLanguage(null);
    setSelectedLanguageCode(null);
    setTranslation(null);
    setTranslatedDefinition(null);
  };

  const handleNestedWordClick = useCallback((clickedWord: string) => {
    if (clickedWord.toLowerCase() !== word.toLowerCase()) {
      setNestedWord(clickedWord);
    }
  }, [word]);

  const handleGetMoreInfo = async () => {
    if (moreInfo) {
      setShowMoreInfo(!showMoreInfo);
      return;
    }

    setIsFetchingMoreInfo(true);
    try {
      const data = await getMoreInfo(word, context);
      if (data.success) {
        setMoreInfo(data.info);
        setShowMoreInfo(true);
      }
    } catch (err) {
      console.error('Error fetching more info:', err);
      toast({
        title: "Failed to get more info",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingMoreInfo(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 pointer-events-none" />
      <div
        ref={popoverRef}
        className="fixed z-50 w-[480px] max-w-[calc(100vw-32px)] max-h-[85vh] bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95 overflow-hidden flex flex-col"
        style={popoverStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Draggable */}
        <div
          className="flex items-center justify-between p-3 border-b border-border/50 bg-muted/20 cursor-move select-none"
          onPointerDown={startDrag}
          onPointerMove={onDragMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={{ touchAction: 'none' }}
        >
          <div className="flex items-center gap-2 max-w-[70%]">
            <h3 className="font-bold text-base capitalize text-foreground truncate">
              {isSentence ? "Sentence Explanation" : word}
            </h3>
            {!isSentence && (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleSpeak}>
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 gap-1 px-2" disabled={isTranslating}>
                  {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem key={lang.code} onClick={() => handleTranslate(lang.code, lang.name)}>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {selectedLanguage && (
              <div className="p-2.5 bg-primary/5 rounded-lg border border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Languages className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    {selectedLanguage}: {translation || '...'}
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={handleClearTranslation}>
                  Clear
                </Button>
              </div>
            )}

            <div className="min-h-[40px]">
              {isLoading ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">{isSentence ? "Explaining..." : "Defining..."}</span>
                </div>
              ) : error ? (
                <p className="text-sm text-destructive bg-destructive/5 p-3 rounded-lg">{error}</p>
              ) : (
                <div className="text-sm text-foreground leading-relaxed">
                  <ClickableText 
                    text={selectedLanguage && translatedDefinition ? translatedDefinition : definition} 
                    onWordClick={handleNestedWordClick} 
                  />
                </div>
              )}
            </div>

            {/* Expand / More Info Button */}
            {!isLoading && !error && (
              <div className="pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={handleGetMoreInfo}
                  disabled={isFetchingMoreInfo}
                >
                  {isFetchingMoreInfo ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : showMoreInfo ? (
                    <Minimize2 className="h-3 w-3" />
                  ) : (
                    <Maximize2 className="h-3 w-3" />
                  )}
                  {showMoreInfo ? 'Show Less' : 'Expand for More Info'}
                </Button>

                {showMoreInfo && moreInfo && (
                  <div className="mt-3 bg-primary/5 rounded-xl border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden">
                    <div className="p-3 pb-1 flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Deep Dive</span>
                    </div>
                    <div className="p-3 pt-1">
                      <p className="text-xs text-foreground leading-relaxed italic">
                        <ClickableText text={moreInfo} onWordClick={handleNestedWordClick} />
                      </p>
                      <div className="mt-2 text-[9px] text-muted-foreground/50 text-right">
                        ~129 words
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI Search for main word */}
            <AISearchSection 
              initialQuery={word} 
              targetLanguage={selectedLanguageCode} 
              targetLanguageName={selectedLanguage} 
            />

            {nestedWord && (
              <NestedDefinition 
                word={nestedWord}
                parentDefinition={definition}
                onClose={() => setNestedWord(null)}
                depth={1}
                targetLanguage={selectedLanguageCode}
                targetLanguageName={selectedLanguage}
              />
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default WordDefinitionPopover;
