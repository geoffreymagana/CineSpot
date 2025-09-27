'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { WatchStatusBadge, watchStatusConfig } from './WatchStatusBadge';
import type { Movie } from '@/lib/types';
import { ChevronDown } from 'lucide-react';

interface WatchStatusSelectorProps {
  status: Movie['watchStatus'];
  onStatusChange: (status: NonNullable<Movie['watchStatus']>) => void;
}

export function WatchStatusSelector({ status, onStatusChange }: WatchStatusSelectorProps) {
  const currentStatus = status || 'Plan to Watch';
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg" className="w-full justify-between bg-secondary/80 text-foreground hover:bg-secondary">
          <WatchStatusBadge status={currentStatus} />
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
        <DropdownMenuRadioGroup
          value={currentStatus}
          onValueChange={value => onStatusChange(value as NonNullable<Movie['watchStatus']>)}
        >
          {Object.keys(watchStatusConfig).map(key => {
            const statusKey = key as NonNullable<Movie['watchStatus']>;
            return (
              <DropdownMenuRadioItem key={statusKey} value={statusKey} className="gap-2">
                <WatchStatusBadge status={statusKey} />
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
