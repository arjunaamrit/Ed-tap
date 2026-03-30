import { FileText, Trash2, FolderOpen, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { DocumentWithTags } from '@/hooks/useDocumentSearch';
import { cn } from '@/lib/utils';

interface DocumentListProps {
  documents: DocumentWithTags[];
  currentDocumentId: string | null;
  onSelectDocument: (doc: DocumentWithTags) => void;
  onDeleteDocument: (id: string) => void;
  searchQuery: string;
}

export const DocumentList = ({
  documents,
  currentDocumentId,
  onSelectDocument,
  onDeleteDocument,
  searchQuery,
}: DocumentListProps) => {
  const highlightMatch = (text: string) => {
    if (!searchQuery.trim()) return text;
    
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() 
        ? <mark key={i} className="bg-primary/30 text-foreground px-0.5 rounded">{part}</mark>
        : part
    );
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-muted-foreground">
          {searchQuery ? 'No documents match your search' : 'No documents yet'}
        </p>
        {searchQuery && (
          <p className="text-sm text-muted-foreground/60 mt-1">
            Try adjusting your search or filter
          </p>
        )}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2 pr-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={cn(
              'group p-3 rounded-lg border cursor-pointer transition-all',
              'hover:bg-accent/50 hover:border-accent',
              currentDocumentId === doc.id && 'bg-accent border-primary'
            )}
            onClick={() => onSelectDocument(doc)}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {highlightMatch(doc.file_name)}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(doc.updated_at).toLocaleDateString()}</span>
                </div>
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {doc.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="text-[10px] px-1.5 py-0"
                        style={{ 
                          borderColor: tag.color,
                          backgroundColor: `${tag.color}20`,
                        }}
                      >
                        {highlightMatch(tag.name)}
                      </Badge>
                    ))}
                    {doc.tags.length > 3 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        +{doc.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteDocument(doc.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
