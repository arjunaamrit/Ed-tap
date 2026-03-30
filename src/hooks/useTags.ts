import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface DocumentTag {
  id: string;
  document_id: string;
  tag_id: string;
  created_at: string;
}

export const useTags = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTags = useCallback(async () => {
    if (!user) {
      setTags([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching tags:', error);
    } else {
      setTags(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = async (name: string, color: string = '#8b5cf6') => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('tags')
      .insert({
        user_id: user.id,
        name,
        color,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Tag exists', description: 'A tag with this name already exists', variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: 'Failed to create tag', variant: 'destructive' });
      }
      return null;
    }

    setTags((prev) => [...prev, data]);
    return data;
  };

  const updateTag = async (id: string, updates: Partial<Pick<Tag, 'name' | 'color'>>) => {
    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to update tag', variant: 'destructive' });
      return null;
    }

    setTags((prev) => prev.map((t) => (t.id === id ? data : t)));
    return data;
  };

  const deleteTag = async (id: string) => {
    const { error } = await supabase.from('tags').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete tag', variant: 'destructive' });
      return false;
    }

    setTags((prev) => prev.filter((t) => t.id !== id));
    return true;
  };

  return {
    tags,
    loading,
    createTag,
    updateTag,
    deleteTag,
    refetch: fetchTags,
  };
};

export const useDocumentTags = (documentId: string | null) => {
  const { toast } = useToast();
  const [documentTags, setDocumentTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocumentTags = useCallback(async () => {
    if (!documentId) {
      setDocumentTags([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('document_tags')
      .select('tag_id')
      .eq('document_id', documentId);

    if (error) {
      console.error('Error fetching document tags:', error);
    } else {
      setDocumentTags(data?.map((dt) => dt.tag_id) || []);
    }
    setLoading(false);
  }, [documentId]);

  useEffect(() => {
    fetchDocumentTags();
  }, [fetchDocumentTags]);

  const addTagToDocument = async (tagId: string) => {
    if (!documentId) return false;

    const { error } = await supabase
      .from('document_tags')
      .insert({ document_id: documentId, tag_id: tagId });

    if (error) {
      if (error.code !== '23505') {
        toast({ title: 'Error', description: 'Failed to add tag', variant: 'destructive' });
      }
      return false;
    }

    setDocumentTags((prev) => [...prev, tagId]);
    return true;
  };

  const removeTagFromDocument = async (tagId: string) => {
    if (!documentId) return false;

    const { error } = await supabase
      .from('document_tags')
      .delete()
      .eq('document_id', documentId)
      .eq('tag_id', tagId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to remove tag', variant: 'destructive' });
      return false;
    }

    setDocumentTags((prev) => prev.filter((id) => id !== tagId));
    return true;
  };

  return {
    documentTags,
    loading,
    addTagToDocument,
    removeTagFromDocument,
    refetch: fetchDocumentTags,
  };
};
