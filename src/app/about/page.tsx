
"use client";
import { Header } from '@/components/layout/Header';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container max-w-screen-md mx-auto space-y-8 px-4 py-10 md:px-6">
          <div className="space-y-2">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground">About Cine-Spot</h1>
            <p className="text-muted-foreground">Cine-Spot helps you discover and organize movies and TV shows using TMDB as the authoritative source for title details. Our AI only suggests titles — TMDB provides the official metadata.</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Why Cine-Spot?</h2>
            <p className="text-muted-foreground">We focus on giving you a lightweight, privacy-minded movie library and discovery experience. Recommendations are surfaced as title suggestions; all metadata comes directly from The Movie Database (TMDB).</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Feedback & Support</h2>
            <p className="text-muted-foreground">If you'd like to report bugs or give feedback, please use the feedback form available from the Help or Settings pages.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
