import { useState } from 'react';
import { Folder, Tag, Plus, X, Check, ChevronDown, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useFolders, Folder as FolderType } from '@/hooks/useFolders';
import { useTags, useDocumentTags, Tag as TagType } from '@/hooks/useTags';
import { cn } from '@/lib/utils';

interface DocumentOrganizerProps {
  documentId: string | null;
  currentFolderId?: string | null;
  onFolderChange?: (folderId: string | null) => void;
}

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', 
  '#f97316', '#eab308', '#22c55e', '#14b8a6'
];

export const DocumentOrganizer = ({
  documentId,
  currentFolderId,
  onFolderChange,
}: DocumentOrganizerProps) => {
  const { folders, createFolder } = useFolders();
  const { tags, createTag } = useTags();
  const { documentTags, addTagToDocument, removeTagFromDocument } = useDocumentTags(documentId);
  
  const [folderOpen, setFolderOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const currentFolder = folders.find((f) => f.id === currentFolderId);
  const activeTags = tags.filter((t) => documentTags.includes(t.id));

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName.trim(), selectedColor);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    const tag = await createTag(newTagName.trim(), selectedColor);
    if (tag && documentId) {
      await addTagToDocument(tag.id);
    }
    setNewTagName('');
    setIsCreatingTag(false);
  };

  const handleToggleTag = async (tagId: string) => {
    if (documentTags.includes(tagId)) {
      await removeTagFromDocument(tagId);
    } else {
      await addTagToDocument(tagId);
    }
  };

  if (!documentId) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Folder Selector */}
      <Popover open={folderOpen} onOpenChange={setFolderOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-8"
          >
            {currentFolder ? (
              <>
                <FolderOpen className="h-3.5 w-3.5" style={{ color: currentFolder.color }} />
                <span className="max-w-24 truncate">{currentFolder.name}</span>
              </>
            ) : (
              <>
                <Folder className="h-3.5 w-3.5" />
                <span>Add to folder</span>
              </>
            )}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search folders..." />
            <CommandList>
              <CommandEmpty>
                {isCreatingFolder ? (
                  <div className="p-2 space-y-2">
                    <Input
                      placeholder="Folder name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                      autoFocus
                    />
                    <div className="flex gap-1">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          className={cn(
                            'w-5 h-5 rounded-full transition-transform',
                            selectedColor === color && 'ring-2 ring-offset-2 ring-primary scale-110'
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedColor(color)}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleCreateFolder} className="flex-1">
                        Create
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setIsCreatingFolder(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 text-center">
                    <p className="text-sm text-muted-foreground mb-2">No folders found</p>
                    <Button size="sm" variant="outline" onClick={() => setIsCreatingFolder(true)}>
                      <Plus className="h-3 w-3 mr-1" />
                      Create folder
                    </Button>
                  </div>
                )}
              </CommandEmpty>
              <CommandGroup>
                {currentFolderId && (
                  <CommandItem
                    onSelect={() => {
                      onFolderChange?.(null);
                      setFolderOpen(false);
                    }}
                  >
                    <X className="h-4 w-4 mr-2 text-muted-foreground" />
                    Remove from folder
                  </CommandItem>
                )}
                {folders.map((folder) => (
                  <CommandItem
                    key={folder.id}
                    onSelect={() => {
                      onFolderChange?.(folder.id);
                      setFolderOpen(false);
                    }}
                  >
                    <Folder className="h-4 w-4 mr-2" style={{ color: folder.color }} />
                    {folder.name}
                    {folder.id === currentFolderId && (
                      <Check className="h-4 w-4 ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
              {folders.length > 0 && !isCreatingFolder && (
                <div className="p-2 border-t">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setIsCreatingFolder(true)}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    New folder
                  </Button>
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Tag Selector */}
      <Popover open={tagOpen} onOpenChange={setTagOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 h-8">
            <Tag className="h-3.5 w-3.5" />
            <span>Tags</span>
            {activeTags.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {activeTags.length}
              </Badge>
            )}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              <CommandEmpty>
                {isCreatingTag ? (
                  <div className="p-2 space-y-2">
                    <Input
                      placeholder="Tag name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                      autoFocus
                    />
                    <div className="flex gap-1">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          className={cn(
                            'w-5 h-5 rounded-full transition-transform',
                            selectedColor === color && 'ring-2 ring-offset-2 ring-primary scale-110'
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedColor(color)}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleCreateTag} className="flex-1">
                        Create
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setIsCreatingTag(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 text-center">
                    <p className="text-sm text-muted-foreground mb-2">No tags found</p>
                    <Button size="sm" variant="outline" onClick={() => setIsCreatingTag(true)}>
                      <Plus className="h-3 w-3 mr-1" />
                      Create tag
                    </Button>
                  </div>
                )}
              </CommandEmpty>
              <CommandGroup>
                {tags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    onSelect={() => handleToggleTag(tag.id)}
                  >
                    <div
                      className="h-3 w-3 rounded-full mr-2"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                    {documentTags.includes(tag.id) && (
                      <Check className="h-4 w-4 ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
              {tags.length > 0 && !isCreatingTag && (
                <div className="p-2 border-t">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setIsCreatingTag(true)}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    New tag
                  </Button>
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Active Tags Display */}
      {activeTags.map((tag) => (
        <Badge
          key={tag.id}
          variant="secondary"
          className="gap-1 h-7 cursor-pointer hover:opacity-80"
          style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: tag.color }}
          onClick={() => removeTagFromDocument(tag.id)}
        >
          {tag.name}
          <X className="h-3 w-3" />
        </Badge>
      ))}
    </div>
  );
};
