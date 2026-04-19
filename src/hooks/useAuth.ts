import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For hackathon: Mock a user session to bypass login gates
    const mockUser = {
      id: 'hackathon-judge-id',
      email: 'judge@hackathon.com',
      user_metadata: { full_name: 'Hackathon Judge' },
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
    } as User;

    setUser(mockUser);
    setSession({ user: mockUser, access_token: 'mock-token', refresh_token: 'mock-token', expires_in: 3600, token_type: 'bearer' } as Session);
    setLoading(false);

    /* Original auth logic commented out for hackathon
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
    */
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    // @ts-expect-error - Mock error for hackathon demo
    return { error: { message: "Sign up is disabled for the hackathon demo.", name: 'AuthDisabled', status: 403 } };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    // @ts-expect-error - Mock error for hackathon demo
    return { error: { message: "Sign in is disabled for the hackathon demo.", name: 'AuthDisabled', status: 403 } };
  }, []);

  const signOut = useCallback(async () => {
    // No-op for hackathon
    return { error: null };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    // @ts-expect-error - Mock error for hackathon demo
    return { error: { message: "Google Sign-in is disabled for the hackathon demo.", name: 'AuthDisabled', status: 403 } };
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`
    });
    return { error };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    return { error };
  }, []);

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    resetPassword,
    updatePassword,
  };
};
