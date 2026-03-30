import { useState, useEffect, useCallback } from 'react';

export interface LocalDocument {
  id: string;
  file_name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const LOCAL_STORAGE_KEY = 'readmate_local_documents';

export const useLocalDocuments = () => {
  const [documents, setDocuments] = useState<LocalDocument[]>([]);

  // Load documents from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setDocuments(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading local documents:', error);
    }
  }, []);

  // Save documents to localStorage whenever they change
  const saveToStorage = useCallback((docs: LocalDocument[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(docs));
    } catch (error) {
      console.error('Error saving local documents:', error);
    }
  }, []);

  const addDocument = useCallback((fileName: string, content: string): LocalDocument => {
    const now = new Date().toISOString();
    const newDoc: LocalDocument = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file_name: fileName,
      content,
      created_at: now,
      updated_at: now,
    };
    
    setDocuments(prev => {
      const updated = [newDoc, ...prev];
      saveToStorage(updated);
      return updated;
    });
    
    return newDoc;
  }, [saveToStorage]);

  const removeDocument = useCallback((id: string) => {
    setDocuments(prev => {
      const updated = prev.filter(doc => doc.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const getDocument = useCallback((id: string): LocalDocument | undefined => {
    return documents.find(doc => doc.id === id);
  }, [documents]);

  const clearAllDocuments = useCallback(() => {
    setDocuments([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  return {
    documents,
    addDocument,
    removeDocument,
    getDocument,
    clearAllDocuments,
  };
};
