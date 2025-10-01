
'use client';
import Image from "next/image";
import type { Movie } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { UserSquare } from "lucide-react";

interface CastListProps {
    cast: NonNullable<Movie['credits']>['cast'];
}

function getProfileUrl(path: string | null) {
    return path ? `https://image.tmdb.org/t/p/w185${path}` : null;
}

export function CastList({ cast }: CastListProps) {

    if (!cast || cast.length === 0) return null;

    const topCast = cast.slice(0, 12);

    return (
        <div>
            <h2 className="font-headline text-2xl font-extrabold text-foreground mb-4">Top Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {topCast.map(member => (
                    <Card key={member.id} className="bg-card/50 overflow-hidden">
                        <div className="aspect-[3/4] w-full bg-secondary flex items-center justify-center">
                            {member.profile_path ? (
                                <Image 
                                    src={getProfileUrl(member.profile_path)!} 
                                    alt={member.name}
                                    width={185}
                                    height={278}
                                    className="object-cover w-full h-full"
                                />
                            ): (
                                <UserSquare className="w-12 h-12 text-muted-foreground" />
                            )}
                        </div>
                        <div className="p-3">
                            <p className="font-bold text-foreground truncate text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{member.character}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
