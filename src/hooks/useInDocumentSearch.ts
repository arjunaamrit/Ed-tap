import { useState, useMemo, useCallback } from 'react';

export interface SearchMatch {
  index: number;
  startOffset: number;
  endOffset: number;
  text: string;
}

export const useInDocumentSearch = (documentText: string) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const matches = useMemo(() => {
    if (!searchQuery.trim() || !documentText) return [];

    const query = searchQuery.toLowerCase();
    const text = documentText.toLowerCase();
    const results: SearchMatch[] = [];
    let startIndex = 0;

    while (true) {
      const index = text.indexOf(query, startIndex);
      if (index === -1) break;

      results.push({
        index: results.length,
        startOffset: index,
        endOffset: index + searchQuery.length,
        text: documentText.slice(index, index + searchQuery.length),
      });

      startIndex = index + 1;
    }

    return results;
  }, [searchQuery, documentText]);

  const goToNextMatch = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((prev) => (prev + 1) % matches.length);
  }, [matches.length]);

  const goToPreviousMatch = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((prev) => (prev - 1 + matches.length) % matches.length);
  }, [matches.length]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setCurrentMatchIndex(0);
  }, []);

  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    clearSearch();
  }, [clearSearch]);

  return {
    searchQuery,
    setSearchQuery,
    matches,
    currentMatchIndex,
    setCurrentMatchIndex,
    goToNextMatch,
    goToPreviousMatch,
    clearSearch,
    isSearchOpen,
    openSearch,
    closeSearch,
  };
};
