
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const basicAnalytics = [
    { name: "Title Count", description: "The total number of movies and shows in your library." },
    { name: "Completed Titles", description: "How many titles you've finished watching." },
    { name: "Total Time Watched", description: "The cumulative runtime of all completed titles." },
    { name: "Total Episodes Watched", description: "The total count of all TV show episodes you've marked as watched." },
    { name: "Watchlist Count", description: "How many titles are currently in your 'Plan to Watch' list." },
    { name: "Watch Goal Progress", description: "Track your progress towards a yearly watch goal." },
    { name: "Top Genres", description: "A breakdown of your most-watched genres." },
    { name: "Top Collections", description: "Your biggest collections by title count." },
    { name: "Last Watched", description: "The most recent title you finished or made progress on." },
    { name: "Rewatch Count", description: "How many times you've rewatched titles in your library." }
];

const nerdStats = [
    { name: "Decade Distribution", description: "A chart showing which decades your favorite titles were released in." },
    { name: "Most Watched Directors", description: "The directors behind the movies you've watched the most." },
    { name: "Series Completion Progress", description: "Track your progress for individual multi-season TV shows." },
    { name: "Most Watched Actors", description: "The actors who appear most frequently in your library." },
    { name: "Top Franchises", description: "Identify which movie franchises you've engaged with the most." },
    { name: "Rewatch Ratio", description: "Are you a novelty-seeker or a repeater? See your ratio of rewatches to new titles." },
    { name: "Storage Usage", description: "The amount of data your library is using in Firestore." },
    { name: "Poster Palette Mosaic", description: "A beautiful mosaic generated from the dominant colors of your movie posters." }
];


function FeatureListItem({ name, description }: { name: string, description: string }) {
    return (
        <li className="flex flex-col">
           <span className="font-semibold text-foreground">{name}</span>
           <span className="text-sm text-muted-foreground">{description}</span>
        </li>
    )
}

export function AnalyticsPlaceholder() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Analytics Coming Soon!</CardTitle>
          <CardDescription>
            Get ready to dive deep into your viewing habits. Here's a sneak peek of what's to come.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-6">
                {basicAnalytics.map(item => <FeatureListItem key={item.name} {...item} />)}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Stats for Nerds</CardTitle>
          </CardHeader>
          <CardContent>
             <ul className="space-y-6">
                {nerdStats.map(item => <FeatureListItem key={item.name} {...item} />)}
            </ul>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Have an Idea?</CardTitle>
          <CardDescription>
            Your feedback will help shape the future of Cine-Spot analytics. Let us know what you'd like to see!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSf7RHKFK1R7zbBityZhPS0FHJk68eh9k4ttQTaceBBN3CUpaA/viewform?usp=header" target="_blank" rel="noreferrer">
              Share Your Feedback
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

