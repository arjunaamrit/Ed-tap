import { useCallback, useState, useRef } from "react";
import { Upload, FileText, Loader2, FileType, File as LucideFile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { callSupabaseFunction } from "@/lib/auth-helpers";

interface EnhancedDocumentUploaderProps {
  onDocumentParsed: (text: string, fileName: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const supportedFormats = [
  { ext: '.pdf', type: 'application/pdf', label: 'PDF' },
  { ext: '.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'Word' },
  { ext: '.epub', type: 'application/epub+zip', label: 'EPUB' },
  { ext: '.txt', type: 'text/plain', label: 'Text' },
  { ext: '.md', type: 'text/markdown', label: 'Markdown' },
  { ext: '.html', type: 'text/html', label: 'HTML' },
  { ext: '.rtf', type: 'application/rtf', label: 'RTF' },
  { ext: '.mht', type: 'message/rfc822', label: 'MHT' },
];
const EnhancedDocumentUploader = ({ onDocumentParsed, isLoading, setIsLoading }: EnhancedDocumentUploaderProps) => {
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedFile, setDraggedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processFile = useCallback(async (file: File) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/epub+zip',
      'text/plain',
      'text/markdown',
      'text/html',
      'application/rtf',
      'text/rtf',
      'message/rfc822',
      'multipart/related',
    ];
    
    const validExtensions = ['.pdf', '.docx', '.epub', '.txt', '.md', '.markdown', '.html', '.htm', '.rtf', '.mht', '.mhtml'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOCX, EPUB, TXT, Markdown, HTML, RTF, or MHT file.",
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
      // Handle text-based files locally
      if (
        fileExtension === '.txt' || 
        fileExtension === '.md' || 
        fileExtension === '.markdown' ||
        file.type === 'text/plain' ||
        file.type === 'text/markdown'
      ) {
        const text = await file.text();
        onDocumentParsed(text, file.name);
        toast({
          title: "Document loaded",
          description: `Successfully loaded ${file.name}`,
        });
        setIsLoading(false);
        return;
      }

      // Handle HTML files locally
      if (
        fileExtension === '.html' || 
        fileExtension === '.htm' ||
        file.type === 'text/html'
      ) {
        const htmlContent = await file.text();
        // Strip HTML tags and extract text
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const text = doc.body.textContent || '';
        onDocumentParsed(text.trim(), file.name);
        toast({
          title: "Document loaded",
          description: `Successfully loaded ${file.name}`,
        });
        setIsLoading(false);
        return;
      }

      // For PDF, DOCX, RTF - use the edge function
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
    setDraggedFile(null);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    
    const file = e.dataTransfer.items[0];
    if (file) {
      setDraggedFile(file.type || 'file');
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setDraggedFile(null);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input so same file can be re-selected
    e.target.value = '';
  }, [processFile]);

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300',
        isDragOver 
          ? 'border-primary bg-primary/5 scale-[1.02]' 
          : 'border-muted-foreground/25 hover:border-primary/50',
        isLoading && 'opacity-50 pointer-events-none'
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {isLoading ? (
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative p-6 rounded-full bg-primary/10">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          </div>
          <div>
            <p className="text-lg font-medium">Processing document...</p>
            <p className="text-sm text-muted-foreground mt-1">
              Extracting text and preparing for reading
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-center mb-6">
            <div className={cn(
              'p-6 rounded-2xl transition-all duration-300',
              isDragOver ? 'bg-primary/20 scale-110' : 'bg-primary/10'
            )}>
              <Upload className={cn(
                'h-12 w-12 transition-colors',
                isDragOver ? 'text-primary' : 'text-primary/70'
              )} />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold mb-2">
            {isDragOver ? 'Drop your document here' : 'Upload Your Document'}
          </h3>
          <p className="text-muted-foreground mb-6">
            Drag and drop or click to browse
          </p>
          
          <input
            type="file"
            accept=".pdf,.docx,.epub,.txt,.md,.markdown,.html,.htm,.rtf,.mht,.mhtml"
            onChange={handleFileSelect}
            className="hidden"
            ref={fileInputRef}
          />
          
          <Button variant="default" size="lg" className="cursor-pointer gap-2" onClick={handleSelectClick}>
            <FileText className="h-5 w-5" />
            Select File
          </Button>
          
          {/* Supported formats */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">Supported formats</p>
            <div className="flex flex-wrap justify-center gap-2">
              {supportedFormats.map((format) => (
                <div
                  key={format.ext}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium"
                >
                  <LucideFile className="h-3 w-3" />
                  {format.label}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Maximum file size: 100MB
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default EnhancedDocumentUploader;
