import { useState } from 'react';
import { Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DocumentSearch } from './DocumentSearch';
import { DocumentList } from './DocumentList';
import { useDocumentSearch, DocumentWithTags } from '@/hooks/useDocumentSearch';
import { Document } from '@/hooks/useDocuments';

interface DocumentLibraryDialogProps {
  documents: Document[];
  currentDocumentId: string | null;
  onSelectDocument: (doc: Document) => void;
  onDeleteDocument: (id: string) => void;
}

export const DocumentLibraryDialog = ({
  documents,
  currentDocumentId,
  onSelectDocument,
  onDeleteDocument,
}: DocumentLibraryDialogProps) => {
  const [open, setOpen] = useState(false);
  
  const {
    searchQuery,
    setSearchQuery,
    searchFilter,
    setSearchFilter,
    filteredDocuments,
    totalDocuments,
  } = useDocumentSearch(documents);

  const handleSelectDocument = (doc: DocumentWithTags) => {
    onSelectDocument(doc);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Library className="h-4 w-4" />
          <span className="hidden sm:inline">Library</span>
          {documents.length > 0 && (
            <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
              {documents.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Document Library</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <DocumentSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchFilter={searchFilter}
            onFilterChange={setSearchFilter}
            resultCount={filteredDocuments.length}
            totalCount={totalDocuments}
          />
          <DocumentList
            documents={filteredDocuments}
            currentDocumentId={currentDocumentId}
            onSelectDocument={handleSelectDocument}
            onDeleteDocument={onDeleteDocument}
            searchQuery={searchQuery}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
