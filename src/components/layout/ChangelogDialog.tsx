
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { changelogData } from '@/lib/changelog.data';
import { Rocket } from 'lucide-react';

const LAST_VIEWED_VERSION_KEY = 'cinespot-last-viewed-version';

export function ChangelogDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { version, date, title, changes } = changelogData;

  useEffect(() => {
    const lastViewedVersion = localStorage.getItem(LAST_VIEWED_VERSION_KEY);
    if (lastViewedVersion !== version) {
      setIsOpen(true);
    }
  }, [version]);

  const handleClose = () => {
    localStorage.setItem(LAST_VIEWED_VERSION_KEY, version);
    setIsOpen(false);
  };

  const categoryColors: Record<string, string> = {
    New: 'bg-green-500/20 text-green-300 border-green-500/30',
    Improved: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Fixed: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-primary/20 p-3 rounded-full">
              <Rocket className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-headline text-2xl">{title}</DialogTitle>
              <DialogDescription>
                Version {version} &bull; {date}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-6 pr-4 -mr-4">
          {changes.map(changeGroup => (
            <div key={changeGroup.category}>
              <Badge
                variant="outline"
                className={categoryColors[changeGroup.category] || ''}
              >
                {changeGroup.category}
              </Badge>
              <ul className="mt-3 list-disc list-inside space-y-2 text-muted-foreground">
                {changeGroup.items.map((item, index) => (
                  <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ul>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={handleClose}>Got it, thanks!</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
