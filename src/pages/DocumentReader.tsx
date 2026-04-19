import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FileText, 
  X, 
  Sparkles,
  BookOpen,
  Lightbulb,
  MousePointer2,
  Upload,
  Zap,
  Volume2,
  ArrowRight,
  LogOut,
  User,
  Loader2,
  Search,
  MessageSquare,
  HelpCircle,
  PanelLeft,
  FileTextIcon
} from "lucide-react";
import { SAMPLE_DOCUMENT } from "@/data/sampleDocument";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useDocuments, useDocumentAnnotations, Document } from "@/hooks/useDocuments";
import { useLocalDocuments, LocalDocument } from "@/hooks/useLocalDocuments";
import { useInDocumentSearch } from "@/hooks/useInDocumentSearch";
import EnhancedDocumentUploader from "@/components/reader/EnhancedDocumentUploader";
import { EnhancedDocumentViewer } from "@/components/reader/EnhancedDocumentViewer";
import { ReaderSidebar } from "@/components/reader/ReaderSidebar";
import { ReaderToolbar } from "@/components/reader/ReaderToolbar";
import { DocumentLibraryDialog } from "@/components/reader/DocumentLibraryDialog";
import { InDocumentSearch } from "@/components/reader/InDocumentSearch";
import { DocumentChat } from "@/components/reader/DocumentChat";
import WordDefinitionPopover from "@/components/WordDefinitionPopover";
import { OnboardingTour, useOnboardingTour } from "@/components/OnboardingTour";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DocumentReader = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { saveDocument, updateDocumentFolder, documents, deleteDocument } = useDocuments();
  const { documents: localDocuments, addDocument: addLocalDocument, removeDocument: removeLocalDocument } = useLocalDocuments();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentLocalDocId, setCurrentLocalDocId] = useState<string | null>(null);
  
  const [documentText, setDocumentText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordContext, setWordContext] = useState<string>("");
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [showPopover, setShowPopover] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [speechRate, setSpeechRate] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState(0);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // In-document search
  const {
    searchQuery: inDocSearchQuery,
    setSearchQuery: setInDocSearchQuery,
    matches: searchMatches,
    currentMatchIndex: currentSearchMatchIndex,
    goToNextMatch,
    goToPreviousMatch,
    isSearchOpen,
    openSearch,
    closeSearch,
  } = useInDocumentSearch(documentText);

  // Document chat
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Onboarding tour
  const { showOnboarding, closeOnboarding, openOnboarding } = useOnboardingTour();
  // Use database annotations when user is logged in and document is saved
  const {
    highlights: dbHighlights,
    notes: dbNotes,
    bookmarks: dbBookmarks,
    addHighlight: dbAddHighlight,
    removeHighlight: dbRemoveHighlight,
    addNote: dbAddNote,
    removeNote: dbRemoveNote,
    addBookmark: dbAddBookmark,
    removeBookmark: dbRemoveBookmark,
  } = useDocumentAnnotations(currentDocumentId);

  // Convert DB annotations to the format expected by the viewer
  const annotations = {
    highlights: dbHighlights.map(h => ({
      id: h.id,
      text: h.text,
      startOffset: h.start_offset,
      endOffset: h.end_offset,
      color: h.color as 'yellow' | 'green' | 'blue' | 'pink',
      createdAt: new Date(h.created_at),
    })),
    notes: dbNotes.map(n => ({
      id: n.id,
      highlightId: n.highlight_id || undefined,
      content: n.content,
      position: n.position,
      createdAt: new Date(n.created_at),
    })),
    bookmarks: dbBookmarks.map(b => ({
      id: b.id,
      paragraphIndex: b.paragraph_index,
      label: b.label,
      createdAt: new Date(b.created_at),
    })),
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Keyboard shortcut for search (Ctrl/Cmd + F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && documentText) {
        e.preventDefault();
        openSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [documentText, openSearch]);

  const handleSpeak = useCallback(() => {
    if (!documentText) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(documentText);
    utterance.rate = speechRate;
    utterance.pitch = 1;
    
    // Set voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0 && selectedVoice < voices.length) {
      utterance.voice = voices[selectedVoice];
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      toast({ title: "Speech error", description: "Failed to read document", variant: "destructive" });
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [documentText, isPaused, speechRate, selectedVoice, toast]);

  const handlePause = useCallback(() => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const handleDocumentParsed = useCallback(async (text: string, name: string) => {
    setDocumentText(text);
    setFileName(name);
    setShowPopover(false);
    setSelectedWord(null);
    
    // Save document to database if user is logged in, otherwise save locally
    if (user) {
      const doc = await saveDocument(name, 'text', text);
      if (doc) {
        setCurrentDocumentId(doc.id);
        setCurrentLocalDocId(null);
        setCurrentFolderId(doc.folder_id);
        toast({ title: "Document saved", description: "Your document has been saved to your account" });
      }
    } else {
      // Save to local storage for non-logged-in users
      const localDoc = addLocalDocument(name, text);
      setCurrentLocalDocId(localDoc.id);
      setCurrentDocumentId(null);
      toast({ title: "Document loaded", description: "Document is available for this session." });
    }
  }, [user, saveDocument, addLocalDocument, toast]);

  const handleWordSelect = useCallback((word: string, context: string, rect: DOMRect) => {
    setSelectedWord(word);
    setWordContext(context);
    setPopoverPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8
    });
    setShowPopover(true);
  }, []);

  const handleClosePopover = useCallback(() => {
    setShowPopover(false);
    setSelectedWord(null);
  }, []);

  const handleClearDocument = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setDocumentText("");
    setFileName("");
    setCurrentDocumentId(null);
    setCurrentLocalDocId(null);
    setShowPopover(false);
    setSelectedWord(null);
  }, []);


  const handleSelectDocumentFromLibrary = useCallback((doc: Document) => {
    if (doc.content) {
      setDocumentText(doc.content);
      setFileName(doc.file_name);
      setCurrentDocumentId(doc.id);
      setCurrentLocalDocId(null);
      setCurrentFolderId(doc.folder_id);
    }
  }, []);

  const handleSelectLocalDocument = useCallback((doc: LocalDocument) => {
    setDocumentText(doc.content);
    setFileName(doc.file_name);
    setCurrentLocalDocId(doc.id);
    setCurrentDocumentId(null);
    setCurrentFolderId(null);
  }, []);

  const handleSelectAnyDocument = useCallback((doc: LocalDocument | Document) => {
    if ('folder_id' in doc) {
      handleSelectDocumentFromLibrary(doc as Document);
    } else {
      handleSelectLocalDocument(doc as LocalDocument);
    }
  }, [handleSelectDocumentFromLibrary, handleSelectLocalDocument]);

  const handleDeleteDocumentFromLibrary = useCallback(async (id: string) => {
    const success = await deleteDocument(id);
    if (success && currentDocumentId === id) {
      handleClearDocument();
    }
  }, [deleteDocument, currentDocumentId, handleClearDocument]);

  const handleDeleteLocalDocument = useCallback((id: string) => {
    removeLocalDocument(id);
    if (currentLocalDocId === id) {
      handleClearDocument();
    }
  }, [removeLocalDocument, currentLocalDocId, handleClearDocument]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/auth');
  }, [signOut, navigate]);

  // Wrapper functions for annotations
  const handleAddHighlight = useCallback(async (text: string, startOffset: number, endOffset: number, color: 'yellow' | 'green' | 'blue' | 'pink' = 'yellow') => {
    if (currentDocumentId) {
      const result = await dbAddHighlight(text, startOffset, endOffset, color);
      return result ? {
        id: result.id,
        text: result.text,
        startOffset: result.start_offset,
        endOffset: result.end_offset,
        color: result.color as 'yellow' | 'green' | 'blue' | 'pink',
        createdAt: new Date(result.created_at),
      } : null;
    }
    return null;
  }, [currentDocumentId, dbAddHighlight]);

  const handleAddNote = useCallback(async (content: string, position: number, highlightId?: string) => {
    if (currentDocumentId) {
      const result = await dbAddNote(content, position, highlightId);
      return result ? {
        id: result.id,
        highlightId: result.highlight_id || undefined,
        content: result.content,
        position: result.position,
        createdAt: new Date(result.created_at),
      } : null;
    }
    return null;
  }, [currentDocumentId, dbAddNote]);

  const handleAddBookmark = useCallback(async (paragraphIndex: number, label: string = '') => {
    if (currentDocumentId) {
      const result = await dbAddBookmark(paragraphIndex, label || `Bookmark ${annotations.bookmarks.length + 1}`);
      return result ? {
        id: result.id,
        paragraphIndex: result.paragraph_index,
        label: result.label,
        createdAt: new Date(result.created_at),
      } : null;
    }
    return null;
  }, [currentDocumentId, dbAddBookmark, annotations.bookmarks.length]);

  const handleJumpToBookmark = useCallback((paragraphIndex: number) => {
    const element = document.getElementById(`paragraph-${paragraphIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleJumpToHighlight = useCallback((_startOffset: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const features = [
    {
      icon: MousePointer2,
      title: "Tap to Know",
      description: "Double-click any word to get AI-powered contextual definitions instantly. Even define words within definitions!",
      color: "from-primary/20 to-primary/5"
    },
    {
      icon: Lightbulb,
      title: "Tap to Note",
      description: "Highlight text in multiple colors, add notes, and bookmark important passages for easy reference later.",
      color: "from-accent/20 to-accent/5"
    },
    {
      icon: FileText,
      title: "Tap Any File",
      description: "PDF, Word, EPUB, Text, Markdown, HTML, and RTF - we handle them all seamlessly.",
      color: "from-primary/20 to-accent/5"
    },
    {
      icon: Volume2,
      title: "Tap to Listen",
      description: "Listen to your documents with natural-sounding speech. Perfect for multitasking or accessibility.",
      color: "from-accent/20 to-primary/5"
    }
  ];


  return (
    <div className="h-[100svh] bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <span className="text-2xl font-display font-black uppercase tracking-tighter">TapIt</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 flex-nowrap overflow-x-auto">
              {user && documents.length > 0 && (
                <DocumentLibraryDialog
                  documents={documents}
                  currentDocumentId={currentDocumentId}
                  onSelectDocument={handleSelectDocumentFromLibrary}
                  onDeleteDocument={handleDeleteDocumentFromLibrary}
                />
              )}
              {documentText && (
                <>
                  <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 px-2 sm:px-3"
                        title="Open document sidebar"
                      >
                        <PanelLeft className="h-4 w-4" />
                        <span className="hidden md:inline">Library</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-[18rem] sm:w-[20rem]">
                      <div className="h-[100dvh]">
                        <ReaderSidebar
                          annotations={annotations}
                          onJumpToBookmark={(i) => {
                            setIsSidebarOpen(false);
                            handleJumpToBookmark(i);
                          }}
                          onJumpToHighlight={(o) => {
                            setIsSidebarOpen(false);
                            handleJumpToHighlight(o);
                          }}
                          onRemoveBookmark={dbRemoveBookmark}
                          onRemoveHighlight={dbRemoveHighlight}
                          onRemoveNote={dbRemoveNote}
                          fileName={fileName}
                          localDocuments={localDocuments}
                          cloudDocuments={documents}
                          currentDocumentId={currentDocumentId || currentLocalDocId}
                          onSelectDocument={(doc) => {
                            setIsSidebarOpen(false);
                            handleSelectAnyDocument(doc);
                          }}
                          onDeleteLocalDocument={handleDeleteLocalDocument}
                          isLoggedIn={!!user}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Button
                    onClick={() => setIsChatOpen(true)}
                    className="gap-2 px-4 bg-primary text-primary-foreground font-black uppercase tracking-tighter brutal-border brutal-shadow-sm hover:brutal-shadow transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 relative group overflow-hidden"
                    title="Ask questions about this document"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    <span className="hidden md:inline">Ask AI</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openSearch}
                    className="gap-1 px-2 sm:px-3 brutal-border-sm hover:bg-muted transition-all duration-200"
                    title="Search in document (Ctrl+F)"
                  >
                    <Search className="h-4 w-4" />
                    <span className="hidden md:inline">Find</span>
                  </Button>
                  <ReaderToolbar
                    isSpeaking={isSpeaking}
                    isPaused={isPaused}
                    onSpeak={handleSpeak}
                    onPause={handlePause}
                    onStop={handleStop}
                    fontSize={fontSize}
                    onFontSizeChange={setFontSize}
                    lineHeight={lineHeight}
                    onLineHeightChange={setLineHeight}
                    fileName={fileName}
                    documentText={documentText}
                    annotations={annotations}
                    speechRate={speechRate}
                    onSpeechRateChange={setSpeechRate}
                    selectedVoice={selectedVoice}
                    onVoiceChange={setSelectedVoice}
                  />
                  <Button variant="outline" size="sm" onClick={handleClearDocument} className="gap-1 px-2 sm:px-3">
                    <X className="h-4 w-4" />
                    <span className="hidden md:inline">New</span>
                  </Button>
                </>
              )}
              
              {user ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
                  <Sparkles className="h-3 w-3" />
                  Hackathon Demo Mode
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => navigate('/auth')} className="gap-1 px-2 sm:px-3">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">Sign In</span>
                </Button>
              )}
              
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {!documentText ? (
        <main className="relative flex-1 overflow-y-auto bg-background">
          {/* Hero Section */}
          <section className="relative container mx-auto px-4 py-20 lg:py-32 border-b-4 border-foreground">
            <div className="max-w-5xl mx-auto">
              <div className="animate-fade-in-up mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-foreground bg-primary text-primary-foreground font-bold uppercase text-xs tracking-widest">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered Speed Reading
                </div>
              </div>
              
              <h1 className="animate-fade-in-up animation-delay-150 text-6xl md:text-9xl font-display font-black mb-8 leading-[0.85] uppercase tracking-tighter">
                Tap <span className="text-primary">It</span>
                <br />Know <span className="text-accent">It</span>
              </h1>
              
              <div className="grid md:grid-cols-2 gap-12 items-end">
                <p className="animate-fade-in-up animation-delay-300 text-xl md:text-2xl font-medium max-w-xl leading-tight">
                  The fastest way to read. Tap any word to define, translate, and explore with AI.
                </p>

                <div className="animate-fade-in-up animation-delay-450 flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="h-16 px-8 text-xl font-black uppercase brutal-border brutal-shadow brutal-shadow-hover transition-all"
                    onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Upload className="h-6 w-6 mr-2" />
                    Upload
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="h-16 px-8 text-xl font-black uppercase border-2 border-foreground brutal-shadow brutal-shadow-hover transition-all"
                    onClick={() => {
                      setDocumentText(SAMPLE_DOCUMENT.content);
                      setFileName(SAMPLE_DOCUMENT.name);
                      toast({ title: "Sample loaded", description: "Explore TapIt features now." });
                    }}
                  >
                    <FileTextIcon className="h-6 w-6 mr-2" />
                    Sample
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features-section" className="relative container mx-auto px-4 py-24 border-b-4 border-foreground">
            <div className="grid md:grid-cols-4 gap-0 border-4 border-foreground">
              {features.map((feature, index) => (
                <div 
                  key={feature.title}
                  className="p-8 border-foreground md:border-r-4 last:border-r-0 border-b-4 md:border-b-0 group hover:bg-foreground hover:text-background transition-colors duration-200"
                >
                  <div className="mb-8">
                    <feature.icon className="h-12 w-12" />
                  </div>
                  <h3 className="text-2xl font-display font-black mb-4 uppercase leading-none">{feature.title}</h3>
                  <p className="font-medium leading-tight opacity-80">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Upload Section */}
          <section id="upload-section" className="relative container mx-auto px-4 py-24">
            <div className="max-w-4xl mx-auto">
              <div className="mb-12">
                <h2 className="text-5xl md:text-7xl font-display font-black mb-4 uppercase tracking-tighter">
                  Tap <span className="text-primary">to start</span>
                </h2>
                <p className="text-xl font-medium">
                  Drop your PDF, Word, or EPUB file here.
                </p>
              </div>

              <div className="brutal-border brutal-shadow p-4 bg-background">
                <EnhancedDocumentUploader 
                  onDocumentParsed={handleDocumentParsed}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t-4 border-foreground py-12 bg-foreground text-background">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-4xl font-display font-black uppercase tracking-tighter">TapIt</div>
                <div className="flex items-center gap-8 font-bold uppercase text-sm">
                  <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
                  <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                </div>
                <p className="font-bold uppercase text-sm opacity-60">© {new Date().getFullYear()} TapIt. Built for speed.</p>
              </div>
            </div>
          </footer>
        </main>
      ) : (
        <div className="flex w-full flex-1 min-h-0 overflow-hidden">
          {/* Main Content (always full-width; sidebar opens as slide-over) */}
          <main className="flex-1 min-w-0 w-full min-h-0 overflow-auto">
            <div className="w-full min-h-0 flex flex-col">
              
              <div className="flex items-center justify-center gap-4 py-2 sm:py-4 px-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm text-muted-foreground">
                  <MousePointer2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Double-tap any word to know it</span>
                  <span className="sm:hidden">Tap any word to know it</span>
                </div>
              </div>
              
              <EnhancedDocumentViewer
                text={documentText} 
                annotations={annotations}
                onWordSelect={handleWordSelect}
                onExplain={handleWordSelect}
                onAddHighlight={handleAddHighlight}
                onAddNote={handleAddNote}
                onAddBookmark={handleAddBookmark}
                fontSize={fontSize}
                lineHeight={lineHeight}
                searchMatches={searchMatches}
                currentSearchMatchIndex={currentSearchMatchIndex}
              />
            </div>
          </main>
        </div>
      )}

      {/* In-document search panel */}
      <InDocumentSearch
        isOpen={isSearchOpen}
        searchQuery={inDocSearchQuery}
        onSearchChange={setInDocSearchQuery}
        matchCount={searchMatches.length}
        currentMatchIndex={currentSearchMatchIndex}
        onNextMatch={goToNextMatch}
        onPreviousMatch={goToPreviousMatch}
        onClose={closeSearch}
      />

      {showPopover && selectedWord && (
        <WordDefinitionPopover
          word={selectedWord}
          context={wordContext}
          position={popoverPosition}
          onClose={handleClosePopover}
        />
      )}

      {/* Document Chat */}
      <DocumentChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        documentContent={documentText}
        documentName={fileName}
      />

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={showOnboarding}
        onClose={closeOnboarding}
        onComplete={closeOnboarding}
      />
    </div>
  );
};

export default DocumentReader;
