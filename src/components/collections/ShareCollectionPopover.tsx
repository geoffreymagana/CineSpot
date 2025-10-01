
'use client';
import { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Check, Copy, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollections } from '@/hooks/use-collections';

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
  const [isPreparing, setIsPreparing] = useState(false);
  const { collections } = useCollections();

  const handleOpenChange = async (open: boolean) => {
    if (open && user) {
      setIsPreparing(true);
      try {
        const collection = collections.find(c => c.id === collectionId);
        if (!collection) {
            toast({ variant: 'destructive', title: 'Collection not found.' });
            return;
        }

        // Create a public, shareable document
        const publicDocRef = doc(db, 'shared_collections', collectionId);
        await setDoc(publicDocRef, {
          ownerId: user.uid,
          ownerName: user.displayName,
          collection: {
            id: collection.id,
            name: collection.name,
            description: collection.description,
            movieIds: collection.movieIds,
          },
        });

        const url = new URL(
          `/public/collection/${collectionId}`,
          window.location.origin
        );
        setShareUrl(url.href);
        
        QRCode.toDataURL(url.href, { width: 220 })
            .then((d: string) => setQrSrc(d))
            .catch(() => setQrSrc(null));

      } catch (error) {
        console.error("Failed to prepare share link", error);
        toast({ variant: 'destructive', title: 'Could not create share link.' });
      } finally {
        setIsPreparing(false);
      }
    }
  }

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
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="end" className="w-96">
        {isPreparing ? (
             <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
             </div>
        ) : (
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
        )}
      </PopoverContent>
    </Popover>
  );
}
