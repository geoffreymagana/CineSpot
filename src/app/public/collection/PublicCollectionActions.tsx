"use client";

import { Button } from '@/components/ui/button';
import { useMovies } from '@/lib/hooks/use-movies';
import { useToast } from '@/hooks/use-toast';
import type { Movie } from '@/lib/types';
import { AddToCollectionPopover } from '@/components/collections/AddToCollectionPopover';
import { useState } from 'react';

// Public collection actions were removed per product decision.
// This component intentionally renders nothing for public shared collections.
export default function PublicCollectionActions() {
  return null;
}
