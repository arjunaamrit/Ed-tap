import { supabase } from "@/integrations/supabase/client";

/**
 * Returns the current user's access token for use in edge function calls.
 * Returns null if the user is not authenticated.
 */
export async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

/**
 * Returns headers object with Authorization bearer token for edge function fetch calls.
 * Throws if the user is not authenticated.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Robust helper to call Supabase Edge Functions using fetch.
 * This is more reliable in some environments than supabase.functions.invoke.
 */
export async function callSupabaseFunction(functionName: string, body: unknown, isFormData = false): Promise<Record<string, unknown>> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
  if (!supabaseUrl) {
    throw new Error('Supabase URL is not configured');
  }
  
  const url = `${supabaseUrl}/functions/v1/${functionName}`;
  const headers = await getAuthHeaders();

  const response = await fetch(url, {
    method: 'POST',
    headers: isFormData ? headers : { ...headers, 'Content-Type': 'application/json' },
    body: isFormData ? body : JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Function returned ${response.status}`);
  }

  return response.json();
}
