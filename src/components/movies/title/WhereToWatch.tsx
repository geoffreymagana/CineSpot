'use client';

import React from 'react';
import type { WatchProviders } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

export function WhereToWatch({ providers }: { providers: WatchProviders | null }) {
  if (!providers) return null;

  const sections = [
    { key: 'flatrate', label: 'Streaming' },
    { key: 'ads', label: 'Free (Ads)' },
    { key: 'rent', label: 'Rent' },
    { key: 'buy', label: 'Buy' },
  ];

  return (
    <div className="mt-6 bg-white/5 p-4 rounded">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">Where to watch</h3>
      {sections.map(s => {
        // @ts-ignore
        const list = providers[s.key];
        if (!list || list.length === 0) return null;
        return (
          <div key={s.key} className="mb-3">
            <div className="text-xs text-muted-foreground mb-2">{s.label}</div>
            <div className="flex gap-4 items-center overflow-x-auto pb-2">
              {list.map((p: any) => (
                <Link key={p.provider_id} href={providers.link || '#'} className="flex-shrink-0 w-20 text-center">
                  <div className="flex justify-center">
                    {p.logo_path ? (
                      <Image src={`https://image.tmdb.org/t/p/w92${p.logo_path}`} alt={p.provider_name} width={56} height={56} className="object-contain" />
                    ) : (
                      <div className="h-14 w-14 bg-muted-foreground/20 rounded" />
                    )}
                  </div>
                  <div className="text-xs mt-2 text-muted-foreground">{p.provider_name}</div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
