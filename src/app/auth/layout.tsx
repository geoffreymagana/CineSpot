
import { CineSpotLogo } from "@/components/icons";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
             <div className="container flex h-16 max-w-screen-2xl items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
                 <Link href="/" className="flex items-center space-x-2">
                    <CineSpotLogo className="h-8 w-8" />
                    <span className="inline-block font-headline text-xl font-extrabold text-white">
                        Cine-Spot
                    </span>
                 </Link>
             </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
            {children}
        </main>
    </div>
  );
}
