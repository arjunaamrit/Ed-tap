import { useState, useCallback } from 'react';

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink';

export interface Highlight {
  id: string;
  text: string;
  startOffset: number;
  endOffset: number;
  color: HighlightColor;
  createdAt: Date;
}

export interface Note {
  id: string;
  highlightId?: string;
  content: string;
  position: number;
  createdAt: Date;
}

export interface Bookmark {
  id: string;
  paragraphIndex: number;
  label: string;
  createdAt: Date;
}

export interface AnnotationState {
  highlights: Highlight[];
  notes: Note[];
  bookmarks: Bookmark[];
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useAnnotations = () => {
  const [annotations, setAnnotations] = useState<AnnotationState>({
    highlights: [],
    notes: [],
    bookmarks: [],
  });

  const addHighlight = useCallback((
    text: string,
    startOffset: number,
    endOffset: number,
    color: HighlightColor = 'yellow'
  ): Highlight => {
    const highlight: Highlight = {
      id: generateId(),
      text,
      startOffset,
      endOffset,
      color,
      createdAt: new Date(),
    };

    setAnnotations(prev => ({
      ...prev,
      highlights: [...prev.highlights, highlight],
    }));

    return highlight;
  }, []);

  const removeHighlight = useCallback((id: string) => {
    setAnnotations(prev => ({
      ...prev,
      highlights: prev.highlights.filter(h => h.id !== id),
      notes: prev.notes.filter(n => n.highlightId !== id),
    }));
  }, []);

  const updateHighlightColor = useCallback((id: string, color: HighlightColor) => {
    setAnnotations(prev => ({
      ...prev,
      highlights: prev.highlights.map(h =>
        h.id === id ? { ...h, color } : h
      ),
    }));
  }, []);

  const addNote = useCallback((content: string, position: number, highlightId?: string): Note => {
    const note: Note = {
      id: generateId(),
      highlightId,
      content,
      position,
      createdAt: new Date(),
    };

    setAnnotations(prev => ({
      ...prev,
      notes: [...prev.notes, note],
    }));

    return note;
  }, []);

  const updateNote = useCallback((id: string, content: string) => {
    setAnnotations(prev => ({
      ...prev,
      notes: prev.notes.map(n =>
        n.id === id ? { ...n, content } : n
      ),
    }));
  }, []);

  const removeNote = useCallback((id: string) => {
    setAnnotations(prev => ({
      ...prev,
      notes: prev.notes.filter(n => n.id !== id),
    }));
  }, []);

  const addBookmark = useCallback((paragraphIndex: number, label: string = ''): Bookmark => {
    const bookmark: Bookmark = {
      id: generateId(),
      paragraphIndex,
      label: label || `Bookmark ${annotations.bookmarks.length + 1}`,
      createdAt: new Date(),
    };

    setAnnotations(prev => ({
      ...prev,
      bookmarks: [...prev.bookmarks, bookmark],
    }));

    return bookmark;
  }, [annotations.bookmarks.length]);

  const removeBookmark = useCallback((id: string) => {
    setAnnotations(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.filter(b => b.id !== id),
    }));
  }, []);

  const updateBookmarkLabel = useCallback((id: string, label: string) => {
    setAnnotations(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.map(b =>
        b.id === id ? { ...b, label } : b
      ),
    }));
  }, []);

  const clearAllAnnotations = useCallback(() => {
    setAnnotations({
      highlights: [],
      notes: [],
      bookmarks: [],
    });
  }, []);

  const exportAnnotations = useCallback(() => {
    return JSON.stringify(annotations, null, 2);
  }, [annotations]);

  const importAnnotations = useCallback((json: string) => {
    try {
      const imported = JSON.parse(json);
      setAnnotations(imported);
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    annotations,
    addHighlight,
    removeHighlight,
    updateHighlightColor,
    addNote,
    updateNote,
    removeNote,
    addBookmark,
    removeBookmark,
    updateBookmarkLabel,
    clearAllAnnotations,
    exportAnnotations,
    importAnnotations,
  };
};
