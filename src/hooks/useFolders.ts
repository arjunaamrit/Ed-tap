import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  color: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useFolders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFolders = useCallback(async () => {
    if (!user) {
      setFolders([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching folders:', error);
    } else {
      setFolders(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const createFolder = async (name: string, color: string = '#6366f1', parentId?: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('folders')
      .insert({
        user_id: user.id,
        name,
        color,
        parent_id: parentId || null,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to create folder', variant: 'destructive' });
      return null;
    }

    setFolders((prev) => [...prev, data]);
    return data;
  };

  const updateFolder = async (id: string, updates: Partial<Pick<Folder, 'name' | 'color' | 'parent_id'>>) => {
    const { data, error } = await supabase
      .from('folders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to update folder', variant: 'destructive' });
      return null;
    }

    setFolders((prev) => prev.map((f) => (f.id === id ? data : f)));
    return data;
  };

  const deleteFolder = async (id: string) => {
    const { error } = await supabase.from('folders').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete folder', variant: 'destructive' });
      return false;
    }

    setFolders((prev) => prev.filter((f) => f.id !== id));
    return true;
  };

  return {
    folders,
    loading,
    createFolder,
    updateFolder,
    deleteFolder,
    refetch: fetchFolders,
  };
};
