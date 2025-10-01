
'use client';
import Image from 'next/image';
import type { Movie } from '@/lib/types';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

interface MediaGalleryProps {
  images: NonNullable<Movie['images']>;
}

const getImageUrl = (path: string, size: 'w500' | 'w1280' | 'original' = 'w500') => {
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function MediaGallery({ images }: MediaGalleryProps) {
  if (!images || (images.posters.length === 0 && images.backdrops.length === 0)) {
    return null;
  }

  return (
    <div>
      <h2 className="font-headline text-2xl font-extrabold text-foreground mb-4">Media</h2>
      <Tabs defaultValue="backdrops">
        <TabsList>
          <TabsTrigger value="backdrops">Backdrops ({images.backdrops.length})</TabsTrigger>
          <TabsTrigger value="posters">Posters ({images.posters.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="backdrops" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.backdrops.slice(0, 6).map((image, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-video w-full bg-secondary">
                  <Image
                    src={getImageUrl(image.file_path, 'w500')}
                    alt={`Backdrop ${index + 1}`}
                    width={500}
                    height={281}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="posters" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {images.posters.slice(0, 12).map((image, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-[2/3] w-full bg-secondary">
                  <Image
                    src={getImageUrl(image.file_path, 'w500')}
                    alt={`Poster ${index + 1}`}
                    width={500}
                    height={750}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
