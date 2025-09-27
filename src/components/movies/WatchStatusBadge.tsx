'use client';
import type { Movie } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Clock, Eye, PauseCircle, PlayCircle, Trash2, XCircle, Bookmark } from 'lucide-react';

export const watchStatusConfig: Record<
  NonNullable<Movie['watchStatus']>,
  {
    label: string;
    icon: React.ElementType;
    className: string;
  }
> = {
  'Plan to Watch': { label: 'Plan to Watch', icon: Bookmark, className: 'text-muted-foreground' },
  Watching: { label: 'Watching', icon: PlayCircle, className: 'text-green-400' },
  Completed: { label: 'Completed', icon: CheckCircle2, className: 'text-purple-400' },
  'On Hold': { label: 'On Hold', icon: PauseCircle, className: 'text-yellow-400' },
  Dropped: { label: 'Dropped', icon: XCircle, className: 'text-red-400' },
};

export function WatchStatusBadge({
  status,
  className,
  iconOnly = false,
}: {
  status: Movie['watchStatus'];
  className?: string;
  iconOnly?: boolean;
}) {
  if (!status) return null;
  const config = watchStatusConfig[status];

  return (
    <span className={cn('flex items-center gap-2', className)}>
        <config.icon className={cn('h-4 w-4 flex-shrink-0', config.className)} title={config.label} />
        {!iconOnly && <span className="whitespace-nowrap">{config.label}</span>}
    </span>
  );
}
