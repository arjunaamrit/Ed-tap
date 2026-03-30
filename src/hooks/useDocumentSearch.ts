import { useState, useMemo, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Document } from './useDocuments';

export interface DocumentWithTags extends Document {
  tags?: { id: string; name: string; color: string }[];
}

export const useDocumentSearch = (documents: Document[]) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'name' | 'content' | 'tags'>('all');
  const [documentTags, setDocumentTags] = useState<Record<string, { id: string; name: string; color: string }[]>>({});
  const [tagsLoaded, setTagsLoaded] = useState(false);

  // Fetch tags for all documents
  const fetchDocumentTags = useCallback(async () => {
    if (!user || documents.length === 0 || tagsLoaded) return;

    try {
      const docIds = documents.map(d => d.id);
      
      const { data: docTagsData, error: docTagsError } = await supabase
        .from('document_tags')
        .select('document_id, tag_id')
        .in('document_id', docIds);

      if (docTagsError) throw docTagsError;

      if (docTagsData && docTagsData.length > 0) {
        const tagIds = [...new Set(docTagsData.map(dt => dt.tag_id))];
        
        const { data: tagsData, error: tagsError } = await supabase
          .from('tags')
          .select('id, name, color')
          .in('id', tagIds);

        if (tagsError) throw tagsError;

        const tagMap = new Map(tagsData?.map(t => [t.id, t]) || []);
        
        const newDocumentTags: Record<string, { id: string; name: string; color: string }[]> = {};
        
        docTagsData.forEach(dt => {
          const tag = tagMap.get(dt.tag_id);
          if (tag) {
            if (!newDocumentTags[dt.document_id]) {
              newDocumentTags[dt.document_id] = [];
            }
            newDocumentTags[dt.document_id].push({
              id: tag.id,
              name: tag.name,
              color: tag.color || '#8b5cf6',
            });
          }
        });

        setDocumentTags(newDocumentTags);
      }
      setTagsLoaded(true);
    } catch (error) {
      console.error('Error fetching document tags:', error);
    }
  }, [user, documents, tagsLoaded]);

  // Re-fetch when documents change
  useEffect(() => {
    if (documents.length > 0 && user) {
      setTagsLoaded(false);
      fetchDocumentTags();
    }
  }, [documents.length, user, fetchDocumentTags]);

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;

    const query = searchQuery.toLowerCase();

    return documents.filter(doc => {
      const nameMatch = doc.file_name.toLowerCase().includes(query);
      const contentMatch = doc.content?.toLowerCase().includes(query);
      const tags = documentTags[doc.id] || [];
      const tagMatch = tags.some(tag => tag.name.toLowerCase().includes(query));

      switch (searchFilter) {
        case 'name':
          return nameMatch;
        case 'content':
          return contentMatch;
        case 'tags':
          return tagMatch;
        case 'all':
        default:
          return nameMatch || contentMatch || tagMatch;
      }
    });
  }, [documents, searchQuery, searchFilter, documentTags]);

  const documentsWithTags: DocumentWithTags[] = useMemo(() => {
    return filteredDocuments.map(doc => ({
      ...doc,
      tags: documentTags[doc.id] || [],
    }));
  }, [filteredDocuments, documentTags]);

  return {
    searchQuery,
    setSearchQuery,
    searchFilter,
    setSearchFilter,
    filteredDocuments: documentsWithTags,
    totalDocuments: documents.length,
  };
};
