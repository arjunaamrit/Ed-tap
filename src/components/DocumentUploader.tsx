import { useCallback, useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { callSupabaseFunction } from "@/lib/auth-helpers";

interface DocumentUploaderProps {
  onDocumentParsed: (text: string, fileName: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const DocumentUploader = ({ onDocumentParsed, isLoading, setIsLoading }: DocumentUploaderProps) => {
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = useCallback(async (file: File) => {
  const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'message/rfc822',
      'multipart/related',
    ];
    
    const validExtensions = ['.pdf', '.docx', '.txt', '.mht', '.mhtml'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOCX, TXT, or MHT file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 100MB.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const data = await callSupabaseFunction('parse-document', formData, true);

      if (data && data.success && data.text) {
        onDocumentParsed(data.text, file.name);
        toast({
          title: "Document loaded",
          description: `Successfully extracted ${data.wordCount} words from ${file.name}`,
        });
      } else {
        throw new Error('No text extracted from document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to process document",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [onDocumentParsed, setIsLoading, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-colors
        ${isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
        ${isLoading ? 'opacity-50 pointer-events-none' : ''}
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {isLoading ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Processing document...</p>
        </div>
      ) : (
        <>
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Upload className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <p className="text-lg font-medium mb-2">
            Drag and drop your document here
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse
          </p>
          
          <input
            type="file"
            accept=".pdf,.docx,.txt,.mht,.mhtml,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,message/rfc822"
            onChange={handleFileSelect}
            className="hidden"
            id="document-upload"
          />
          
          <label htmlFor="document-upload">
            <Button variant="outline" className="cursor-pointer" asChild>
              <span>
                <FileText className="h-4 w-4 mr-2" />
                Select File
              </span>
            </Button>
          </label>
          
          <p className="text-xs text-muted-foreground mt-4">
            Supports PDF, DOCX, TXT, and MHT files up to 100MB
          </p>
        </>
      )}
    </div>
  );
};

export default DocumentUploader;
