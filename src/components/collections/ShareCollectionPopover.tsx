
'use client';
import { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Check, Copy } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface ShareCollectionPopoverProps {
  children: React.ReactNode;
  collectionId: string;
}

export function ShareCollectionPopover({
  children,
  collectionId,
}: ShareCollectionPopoverProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState('');
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const url = new URL(
        `/public/collection/${collectionId}`,
        window.location.origin
      );
      url.searchParams.set('user', user.uid);
      setShareUrl(url.href);
    }
  }, [collectionId, user]);

  const handleCopy = () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'You must be logged in to share.'});
        return;
    }
    navigator.clipboard.writeText(shareUrl);
    setHasCopied(true);
    toast({ title: 'Copied to clipboard!' });
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Share Collection</h4>
            <p className="text-sm text-muted-foreground">
              Anyone with this link will be able to view this collection.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                id="link"
                defaultValue={shareUrl}
                readOnly
                className="h-9"
              />
            </div>
            <Button
              type="button"
              size="sm"
              className="px-3"
              onClick={handleCopy}
              disabled={!user}
            >
              <span className="sr-only">Copy</span>
              {hasCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
