import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Simple in-memory rate limiter (per user, 15 requests per minute for search)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 15;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// Enhanced function to extract text content from HTML with better structure
function extractTextFromHtml(html: string): string {
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
  text = text.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
  text = text.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');
  text = text.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  
  const mainContentMatch = text.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
                            text.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                            text.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  
  if (mainContentMatch) {
    text = mainContentMatch[1];
  }
  
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<\/h[1-6]>/gi, '\n\n');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<[^>]+>/g, ' ');
  
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n\s*\n/g, '\n\n');
  text = text.trim();
  
  return text.substring(0, 8000);
}

async function fetchUrlContent(url: string): Promise<{ url: string; title: string; content: string; description: string } | null> {
  try {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(8000)
    });
    
    if (!response.ok) {
      console.log(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : url;
    
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    const description = descMatch ? descMatch[1].trim() : '';
    
    const content = extractTextFromHtml(html);
    
    return { url, title, content, description };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log(`Error fetching ${url}:`, errorMessage);
    return null;
  }
}

async function searchForUrls(query: string): Promise<string[]> {
  try {
    console.log(`Searching for: ${query}`);
    
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.log(`Search failed: ${response.status}`);
      return [];
    }
    
    const html = await response.text();
    
    const urlRegex = /href="\/\/duckduckgo\.com\/l\/\?uddg=([^&"]+)/g;
    const urls: string[] = [];
    let match;
    
    while ((match = urlRegex.exec(html)) !== null && urls.length < 8) {
      try {
        const decodedUrl = decodeURIComponent(match[1]);
        if (decodedUrl.startsWith('http') && 
            !decodedUrl.includes('youtube.com') &&
            !decodedUrl.includes('facebook.com') &&
            !decodedUrl.includes('twitter.com') &&
            !decodedUrl.includes('instagram.com')) {
          urls.push(decodedUrl);
        }
      } catch (e) {
        console.log('Error decoding URL:', e);
      }
    }
    
    console.log(`Found ${urls.length} URLs`);
    return urls;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Auth check ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = claimsData.claims.sub as string;

    // --- Rate limit check ---
    if (!checkRateLimit(userId)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing search query: ${query}`);

    const urls = await searchForUrls(query);
    
    if (urls.length === 0) {
      return new Response(
        JSON.stringify({ 
          summary: `No search results found for "${query}". Please try a different search term.`,
          sources: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const contentPromises = urls.map(url => fetchUrlContent(url));
    const results = await Promise.all(contentPromises);
    const validResults = results.filter(r => r !== null) as { url: string; title: string; content: string; description: string }[];

    if (validResults.length === 0) {
      return new Response(
        JSON.stringify({ 
          summary: `Found links but could not fetch their content. Please try again.`,
          sources: urls.map(url => ({ url, title: url }))
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully fetched ${validResults.length} pages`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const combinedContent = validResults.map((r, i) => 
      `Source ${i + 1}: ${r.title}\nDescription: ${r.description || 'N/A'}\nContent:\n${r.content}`
    ).join('\n\n---\n\n');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert research assistant that synthesizes information from multiple web sources. Your task is to provide a comprehensive, accurate, and well-organized answer to the user's question.

Guidelines:
1. **Directly answer the question** - Start with the most relevant information
2. **Synthesize from all sources** - Combine insights from multiple sources for a complete picture
3. **Use clear formatting** - Use bullet points, numbered lists, or short paragraphs
4. **Be factual** - Only include information found in the sources
5. **Highlight key points** - Make important facts stand out
6. **Keep it concise but complete** - Aim for 2-4 paragraphs or equivalent

Format your response to be easy to read and scan quickly.`
          },
          {
            role: 'user',
            content: `Question: "${query}"

Here is content from ${validResults.length} web sources. Synthesize this information to answer the question:

${combinedContent}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('Failed to generate summary');
    }

    const aiData = await aiResponse.json();
    const summary = aiData.choices?.[0]?.message?.content || 'Unable to generate summary.';

    console.log('Summary generated successfully');

    return new Response(
      JSON.stringify({
        summary,
        sources: validResults.map(r => ({ url: r.url, title: r.title }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-summarize:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
