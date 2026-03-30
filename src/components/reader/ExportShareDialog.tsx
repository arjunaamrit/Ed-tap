import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Download,
  Share2,
  FileJson,
  FileText,
  Copy,
  Mail,
  FileDown,
  Check,
} from 'lucide-react';

interface Annotation {
  highlights: Array<{
    id: string;
    text: string;
    startOffset: number;
    endOffset: number;
    color: string;
    createdAt: Date;
  }>;
  notes: Array<{
    id: string;
    highlightId?: string;
    content: string;
    position: number;
    createdAt: Date;
  }>;
  bookmarks: Array<{
    id: string;
    paragraphIndex: number;
    label: string;
    createdAt: Date;
  }>;
}

interface ExportShareDialogProps {
  fileName: string;
  documentText: string;
  annotations: Annotation;
  trigger?: React.ReactNode;
}

export const ExportShareDialog = ({
  fileName,
  documentText,
  annotations,
  trigger,
}: ExportShareDialogProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [includeDocument, setIncludeDocument] = useState(false);
  const [includeHighlights, setIncludeHighlights] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeBookmarks, setIncludeBookmarks] = useState(true);

  const baseFileName = fileName.replace(/\.[^/.]+$/, '');

  const downloadFile = (content: string, extension: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseFileName}-export.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Downloaded', description: `Exported as ${extension.toUpperCase()}` });
  };

  const getFilteredAnnotations = () => ({
    highlights: includeHighlights ? annotations.highlights : [],
    notes: includeNotes ? annotations.notes : [],
    bookmarks: includeBookmarks ? annotations.bookmarks : [],
  });

  const exportAsJSON = () => {
    const data = {
      fileName,
      exportedAt: new Date().toISOString(),
      ...(includeDocument && { documentText }),
      annotations: getFilteredAnnotations(),
    };
    downloadFile(JSON.stringify(data, null, 2), 'json', 'application/json');
  };

  const exportAsMarkdown = () => {
    const filtered = getFilteredAnnotations();
    let md = `# ${fileName}\n\n`;
    md += `*Exported on ${new Date().toLocaleDateString()}*\n\n`;

    if (includeDocument) {
      md += `## Document Content\n\n${documentText}\n\n---\n\n`;
    }

    if (filtered.highlights.length > 0) {
      md += `## Highlights (${filtered.highlights.length})\n\n`;
      filtered.highlights.forEach((h, i) => {
        md += `${i + 1}. **[${h.color}]** "${h.text}"\n`;
      });
      md += '\n';
    }

    if (filtered.notes.length > 0) {
      md += `## Notes (${filtered.notes.length})\n\n`;
      filtered.notes.forEach((n, i) => {
        md += `${i + 1}. ${n.content}\n`;
      });
      md += '\n';
    }

    if (filtered.bookmarks.length > 0) {
      md += `## Bookmarks (${filtered.bookmarks.length})\n\n`;
      filtered.bookmarks.forEach((b, i) => {
        md += `${i + 1}. ${b.label} (Paragraph ${b.paragraphIndex + 1})\n`;
      });
    }

    downloadFile(md, 'md', 'text/markdown');
  };

  const exportAsText = () => {
    const filtered = getFilteredAnnotations();
    let txt = `${fileName}\n${'='.repeat(fileName.length)}\n\n`;
    txt += `Exported on ${new Date().toLocaleDateString()}\n\n`;

    if (includeDocument) {
      txt += `DOCUMENT CONTENT\n${'-'.repeat(20)}\n${documentText}\n\n`;
    }

    if (filtered.highlights.length > 0) {
      txt += `HIGHLIGHTS (${filtered.highlights.length})\n${'-'.repeat(20)}\n`;
      filtered.highlights.forEach((h, i) => {
        txt += `${i + 1}. [${h.color}] "${h.text}"\n`;
      });
      txt += '\n';
    }

    if (filtered.notes.length > 0) {
      txt += `NOTES (${filtered.notes.length})\n${'-'.repeat(20)}\n`;
      filtered.notes.forEach((n, i) => {
        txt += `${i + 1}. ${n.content}\n`;
      });
      txt += '\n';
    }

    if (filtered.bookmarks.length > 0) {
      txt += `BOOKMARKS (${filtered.bookmarks.length})\n${'-'.repeat(20)}\n`;
      filtered.bookmarks.forEach((b, i) => {
        txt += `${i + 1}. ${b.label} (Paragraph ${b.paragraphIndex + 1})\n`;
      });
    }

    downloadFile(txt, 'txt', 'text/plain');
  };

  const copyToClipboard = async () => {
    const filtered = getFilteredAnnotations();
    let text = `📚 ${fileName}\n\n`;

    if (filtered.highlights.length > 0) {
      text += `✨ ${filtered.highlights.length} Highlights:\n`;
      filtered.highlights.slice(0, 5).forEach((h) => {
        text += `  • "${h.text.substring(0, 100)}${h.text.length > 100 ? '...' : ''}"\n`;
      });
      if (filtered.highlights.length > 5) {
        text += `  ... and ${filtered.highlights.length - 5} more\n`;
      }
      text += '\n';
    }

    if (filtered.notes.length > 0) {
      text += `📝 ${filtered.notes.length} Notes\n`;
    }

    if (filtered.bookmarks.length > 0) {
      text += `🔖 ${filtered.bookmarks.length} Bookmarks\n`;
    }

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!', description: 'Summary copied to clipboard' });
  };

  const shareViaEmail = () => {
    const filtered = getFilteredAnnotations();
    const subject = encodeURIComponent(`Notes from: ${fileName}`);
    let body = `I've been reading "${fileName}" and wanted to share my annotations:\n\n`;

    if (filtered.highlights.length > 0) {
      body += `HIGHLIGHTS:\n`;
      filtered.highlights.forEach((h) => {
        body += `• "${h.text}"\n`;
      });
      body += '\n';
    }

    if (filtered.notes.length > 0) {
      body += `NOTES:\n`;
      filtered.notes.forEach((n) => {
        body += `• ${n.content}\n`;
      });
    }

    body += `\n---\nShared from TapIt`;
    
    window.open(`mailto:?subject=${subject}&body=${encodeURIComponent(body)}`);
    toast({ title: 'Email opened', description: 'Compose your email' });
  };

  const totalAnnotations = 
    annotations.highlights.length + 
    annotations.notes.length + 
    annotations.bookmarks.length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="toolbar-button" title="Export & Share">
            <Share2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Export & Share
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="export" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="share" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 mt-4">
            {/* Export Options */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Include in export:</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="doc"
                    checked={includeDocument}
                    onCheckedChange={(checked) => setIncludeDocument(checked as boolean)}
                  />
                  <label htmlFor="doc" className="text-sm cursor-pointer">
                    Document text
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="highlights"
                    checked={includeHighlights}
                    onCheckedChange={(checked) => setIncludeHighlights(checked as boolean)}
                  />
                  <label htmlFor="highlights" className="text-sm cursor-pointer">
                    Highlights ({annotations.highlights.length})
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notes"
                    checked={includeNotes}
                    onCheckedChange={(checked) => setIncludeNotes(checked as boolean)}
                  />
                  <label htmlFor="notes" className="text-sm cursor-pointer">
                    Notes ({annotations.notes.length})
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bookmarks"
                    checked={includeBookmarks}
                    onCheckedChange={(checked) => setIncludeBookmarks(checked as boolean)}
                  />
                  <label htmlFor="bookmarks" className="text-sm cursor-pointer">
                    Bookmarks ({annotations.bookmarks.length})
                  </label>
                </div>
              </div>
            </div>

            {/* Export Format Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                onClick={exportAsJSON}
                className="flex flex-col h-auto py-4 gap-2"
              >
                <FileJson className="h-5 w-5" />
                <span className="text-xs">JSON</span>
              </Button>
              <Button
                variant="outline"
                onClick={exportAsMarkdown}
                className="flex flex-col h-auto py-4 gap-2"
              >
                <FileDown className="h-5 w-5" />
                <span className="text-xs">Markdown</span>
              </Button>
              <Button
                variant="outline"
                onClick={exportAsText}
                className="flex flex-col h-auto py-4 gap-2"
              >
                <FileText className="h-5 w-5" />
                <span className="text-xs">Text</span>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="share" className="space-y-4 mt-4">
            {totalAnnotations === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No annotations to share yet.</p>
                <p className="text-sm mt-1">Add highlights, notes, or bookmarks first.</p>
              </div>
            ) : (
              <>
                <div className="text-sm text-muted-foreground">
                  Share a summary of your {totalAnnotations} annotation{totalAnnotations !== 1 ? 's' : ''} from "{fileName}"
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? 'Copied!' : 'Copy summary to clipboard'}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={shareViaEmail}
                  >
                    <Mail className="h-4 w-4" />
                    Share via email
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
