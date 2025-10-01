
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AddMovieDialog } from '@/components/movies/AddMovieDialog';
import { CineSpotLogo } from '@/components/icons';
import { PlusCircle, Menu, Film, FolderKanban, Sparkles, User, Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useState } from 'react';
import { GlobalSearch } from './GlobalSearch';
import { UserNav } from './UserNav';
import { useAuth } from '@/hooks/use-auth';


const navLinks = [
  { href: '/', label: 'Dashboard', icon: <Film className="h-5 w-5" /> },
  { href: '/collections', label: 'Collections', icon: <FolderKanban className="h-5 w-5" /> },
  { href: '/spotlight', label: 'Spotlight', icon: <Sparkles className="h-5 w-5" /> },
  { href: '/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
];

function NavLink({ href, label, icon, onLinkClick }: { href: string; label: string; icon: React.ReactNode, onLinkClick?: () => void }) {
    const pathname = usePathname();
    return (
      <Link
        href={href}
        onClick={onLinkClick}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
          pathname === href ? "text-primary bg-primary/10" : ""
        )}
      >
        {icon}
        {label}
      </Link>
    );
}

export function Header() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { user, loading } = useAuth();
  
  // Hide header on auth pages
  if (pathname.startsWith('/auth')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center gap-4 px-4 sm:justify-between md:px-6 lg:px-8">
        {user && (
          <div className="flex gap-6 md:gap-10 items-center">
            {/* Mobile Nav */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <SheetHeader>
                   <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                </SheetHeader>
                <nav className="grid gap-4 text-lg font-medium">
                  <Link
                    href="#"
                    className="flex items-center gap-2 text-lg font-semibold mb-4"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    <CineSpotLogo className="h-8 w-8" />
                    <span className="font-headline text-xl font-extrabold text-foreground">Cine-Spot</span>
                  </Link>
                  {navLinks.map((link) => (
                    <NavLink key={link.href} {...link} onLinkClick={() => setIsSheetOpen(false)} />
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            
            <Link href="/" className="hidden md:flex items-center space-x-2">
              <CineSpotLogo className="h-8 w-8" />
              <span className="inline-block font-headline text-xl font-extrabold text-foreground">
                Cine-Spot
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden gap-6 md:flex">
              {navLinks.filter(l => l.href !== '/profile').map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center text-sm font-medium transition-colors hover:text-foreground",
                    pathname === link.href ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
        
        <div className={cn("flex flex-1 items-center justify-end gap-4", !user && "justify-between")}>
          {!user && !loading && (
             <Link href="/" className="flex items-center space-x-2">
              <CineSpotLogo className="h-8 w-8" />
              <span className="inline-block font-headline text-xl font-extrabold text-foreground">
                Cine-Spot
              </span>
            </Link>
          )}

          {loading ? (
             <Loader2 className="h-6 w-6 animate-spin" />
          ) : user ? (
            <>
              <div className="w-full flex-1 md:w-auto md:flex-none">
                 <GlobalSearch />
              </div>
              <AddMovieDialog>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Title
                </Button>
              </AddMovieDialog>
              <UserNav />
            </>
          ) : (
            <div className="flex gap-2">
                <Button asChild variant="ghost"><Link href="/auth/login">Log In</Link></Button>
                <Button asChild><Link href="/auth/signup">Sign Up</Link></Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
