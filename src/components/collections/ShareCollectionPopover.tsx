
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
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';

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
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const url = new URL(
        `/public/collection/${collectionId}`,
        window.location.origin
      );
      url.searchParams.set('user', user.uid);
      setShareUrl(url.href);
      QRCode.toDataURL(url.href, { width: 220 })
        .then((d: string) => setQrSrc(d))
        .catch(() => setQrSrc(null));
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
      <PopoverContent align="end" className="w-96">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Share Collection</h4>
            <p className="text-sm text-muted-foreground">
              Anyone with this link will be able to view this collection.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Card className="p-3">
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Copy Link</h5>
                <div className="flex items-center space-x-2">
                  <Input id="link" defaultValue={shareUrl} readOnly className="h-9 w-full" />
                  <Button type="button" size="sm" className="px-3" onClick={handleCopy} disabled={!user}>
                    <span className="sr-only">Copy</span>
                    {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Share the URL</p>
              </div>
            </Card>

            <Card className="p-3">
              <div className="space-y-2">
                <h5 className="text-sm font-medium">QR Code</h5>
                <div className="mt-2 flex items-center justify-center">
                  {qrSrc ? (
                    <img src={qrSrc} alt="Share collection QR" className="w-44 h-44 rounded-md" />
                  ) : (
                    <div className="text-sm text-muted-foreground">QR not available</div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-center">Scan to open on mobile</p>
              </div>
            </Card>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
