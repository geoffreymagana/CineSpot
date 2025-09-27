import type { SVGProps } from "react";
import { Pause } from 'lucide-react';

export function CineSpotLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary">
       <Pause {...props} className="h-6 w-6 text-primary-foreground" fill="currentColor" />
    </div>
  );
}
