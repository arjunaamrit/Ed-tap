import { Search, Filter, FileText, Tag, AlignLeft, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DocumentSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchFilter: 'all' | 'name' | 'content' | 'tags';
  onFilterChange: (filter: 'all' | 'name' | 'content' | 'tags') => void;
  resultCount: number;
  totalCount: number;
}

const filterLabels = {
  all: 'All',
  name: 'Name',
  content: 'Content',
  tags: 'Tags',
};

const filterIcons = {
  all: Search,
  name: FileText,
  content: AlignLeft,
  tags: Tag,
};

export const DocumentSearch = ({
  searchQuery,
  onSearchChange,
  searchFilter,
  onFilterChange,
  resultCount,
  totalCount,
}: DocumentSearchProps) => {
  const FilterIcon = filterIcons[searchFilter];
  const isFiltering = searchQuery.trim().length > 0;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => onSearchChange('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(filterLabels) as Array<keyof typeof filterLabels>).map((filter) => {
              const Icon = filterIcons[filter];
              return (
                <DropdownMenuItem
                  key={filter}
                  onClick={() => onFilterChange(filter)}
                  className={cn(
                    'gap-2 cursor-pointer',
                    searchFilter === filter && 'bg-accent'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {filterLabels[filter]}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {isFiltering ? (
          <>
            <span>
              {resultCount} of {totalCount} document{totalCount !== 1 ? 's' : ''}
            </span>
            <Badge variant="secondary" className="gap-1 text-xs">
              <FilterIcon className="h-3 w-3" />
              {filterLabels[searchFilter]}
            </Badge>
          </>
        ) : (
          <span>{totalCount} document{totalCount !== 1 ? 's' : ''}</span>
        )}
      </div>
    </div>
  );
};
