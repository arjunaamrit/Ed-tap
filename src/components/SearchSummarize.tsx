import React, { useState } from "react";
import { Search, Loader2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { searchAndSummarize, SearchResult, Source } from "@/services/geminiService";

const SearchSummarize = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const data = await searchAndSummarize(query.trim());

      setResult(data);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Search className="h-5 w-5 text-indigo-600" />
            AI-Powered Search
          </CardTitle>
          <p className="text-sm text-gray-500">
            Search any topic and get an AI-generated summary from multiple sources
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <Input
              type="text"
              placeholder="Enter your search query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </form>

          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
              <p className="mt-4 text-gray-600">Searching and analyzing content...</p>
              <p className="text-sm text-gray-400 mt-1">This may take a few seconds</p>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Summary</h3>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {result.summary}
                  </p>
                </div>
              </div>

              {result.sources && result.sources.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Sources</h3>
                  <div className="space-y-2">
                    {result.sources.map((source, index) => (
                      <a
                        key={index}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                      >
                        <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700 group-hover:text-indigo-600 truncate">
                          {source.title}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchSummarize;
