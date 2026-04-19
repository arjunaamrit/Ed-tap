import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Document {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number | null;
  content: string | null;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbHighlight {
  id: string;
  document_id: string;
  text: string;
  start_offset: number;
  end_offset: number;
  color: string;
  created_at: string;
}

export interface DbNote {
  id: string;
  document_id: string;
  highlight_id: string | null;
  content: string;
  position: number;
  created_at: string;
}

export interface DbBookmark {
  id: string;
  document_id: string;
  paragraph_index: number;
  label: string;
  created_at: string;
}

export const useDocuments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    
    // For hackathon: If it's the mock user, provide some sample documents
    if (user.id === 'hackathon-judge-id') {
      setDocuments([
        {
          id: 'sample-1',
          file_name: 'Introduction to TapIt.pdf',
          file_type: 'pdf',
          file_size: 1024,
          content: 'Welcome to TapIt! This is a sample document to show you how the speed reader works. Double tap any word to get a definition.',
          folder_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'sample-2',
          file_name: 'AI in Education.docx',
          file_type: 'docx',
          file_size: 2048,
          content: 'Artificial Intelligence is transforming education by providing personalized learning experiences...',
          folder_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const saveDocument = useCallback(async (fileName: string, fileType: string, content: string, fileSize?: number) => {
    if (!user) return null;
    
    // For hackathon: Mock saving for the judge user
    if (user.id === 'hackathon-judge-id') {
      const newDoc: Document = {
        id: `local-${Date.now()}`,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize || null,
        content,
        folder_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setDocuments(prev => [newDoc, ...prev]);
      return newDoc;
    }

    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          file_name: fileName,
          file_type: fileType,
          file_size: fileSize || null,
          content,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setDocuments(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: 'Error',
        description: 'Failed to save document',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, toast]);

  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
      
      if (error) throw error;
      
      setDocuments(prev => prev.filter(d => d.id !== documentId));
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const updateDocumentFolder = useCallback(async (documentId: string, folderId: string | null) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update({ folder_id: folderId })
        .eq('id', documentId)
        .select()
        .single();
      
      if (error) throw error;
      
      setDocuments(prev => prev.map(d => d.id === documentId ? data : d));
      return data;
    } catch (error) {
      console.error('Error updating document folder:', error);
      toast({
        title: 'Error',
        description: 'Failed to move document',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  return {
    documents,
    loading,
    saveDocument,
    deleteDocument,
    updateDocumentFolder,
    refetch: fetchDocuments,
  };
};

export const useDocumentAnnotations = (documentId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [highlights, setHighlights] = useState<DbHighlight[]>([]);
  const [notes, setNotes] = useState<DbNote[]>([]);
  const [bookmarks, setBookmarks] = useState<DbBookmark[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAnnotations = useCallback(async () => {
    if (!user || !documentId) return;
    
    setLoading(true);
    try {
      const [highlightsRes, notesRes, bookmarksRes] = await Promise.all([
        supabase.from('highlights').select('*').eq('document_id', documentId),
        supabase.from('notes').select('*').eq('document_id', documentId),
        supabase.from('bookmarks').select('*').eq('document_id', documentId),
      ]);
      
      if (highlightsRes.error) throw highlightsRes.error;
      if (notesRes.error) throw notesRes.error;
      if (bookmarksRes.error) throw bookmarksRes.error;
      
      setHighlights(highlightsRes.data || []);
      setNotes(notesRes.data || []);
      setBookmarks(bookmarksRes.data || []);
    } catch (error) {
      console.error('Error fetching annotations:', error);
    } finally {
      setLoading(false);
    }
  }, [user, documentId]);

  useEffect(() => {
    fetchAnnotations();
  }, [fetchAnnotations]);

  const addHighlight = useCallback(async (text: string, startOffset: number, endOffset: number, color: string = 'yellow') => {
    if (!user || !documentId) return null;
    
    try {
      const { data, error } = await supabase
        .from('highlights')
        .insert({
          user_id: user.id,
          document_id: documentId,
          text,
          start_offset: startOffset,
          end_offset: endOffset,
          color,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setHighlights(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding highlight:', error);
      return null;
    }
  }, [user, documentId]);

  const removeHighlight = useCallback(async (highlightId: string) => {
    try {
      const { error } = await supabase
        .from('highlights')
        .delete()
        .eq('id', highlightId);
      
      if (error) throw error;
      
      setHighlights(prev => prev.filter(h => h.id !== highlightId));
      setNotes(prev => prev.filter(n => n.highlight_id !== highlightId));
      return true;
    } catch (error) {
      console.error('Error removing highlight:', error);
      return false;
    }
  }, []);

  const addNote = useCallback(async (content: string, position: number, highlightId?: string) => {
    if (!user || !documentId) return null;
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          document_id: documentId,
          content,
          position,
          highlight_id: highlightId || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setNotes(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding note:', error);
      return null;
    }
  }, [user, documentId]);

  const removeNote = useCallback(async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);
      
      if (error) throw error;
      
      setNotes(prev => prev.filter(n => n.id !== noteId));
      return true;
    } catch (error) {
      console.error('Error removing note:', error);
      return false;
    }
  }, []);

  const addBookmark = useCallback(async (paragraphIndex: number, label: string) => {
    if (!user || !documentId) return null;
    
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          document_id: documentId,
          paragraph_index: paragraphIndex,
          label,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setBookmarks(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      return null;
    }
  }, [user, documentId]);

  const removeBookmark = useCallback(async (bookmarkId: string) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId);
      
      if (error) throw error;
      
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      return false;
    }
  }, []);

  return {
    highlights,
    notes,
    bookmarks,
    loading,
    addHighlight,
    removeHighlight,
    addNote,
    removeNote,
    addBookmark,
    removeBookmark,
    refetch: fetchAnnotations,
  };
};
