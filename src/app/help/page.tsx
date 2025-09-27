
'use client';
import { Header } from '@/components/layout/Header';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, FolderKanban, Sparkles, Palette, Import } from 'lucide-react';

const supportTopics = [
    {
        icon: <Users className="h-6 w-6 text-primary" />,
        title: "Managing Your Library",
        content: (
            <div className="space-y-4 text-muted-foreground">
                <p>Your library is your personal collection of movies and TV shows.</p>
                <h4 className="font-semibold text-foreground">How to Add a Title:</h4>
                <ol className="list-decimal list-inside space-y-2">
                    <li>Click the <strong>"Add Title"</strong> button in the header.</li>
                    <li>Use the search bar to find a movie or show from The Movie Database (TMDB).</li>
                    <li>Click on a search result to see its details.</li>
                    <li>Click <strong>"Add to Library"</strong> to add it to your collection.</li>
                </ol>
                 <h4 className="font-semibold text-foreground">How to Update a Title's Status:</h4>
                <ol className="list-decimal list-inside space-y-2">
                   <li>From the main dashboard or a collection, click on a title's poster to go to its detail page.</li>
                   <li>Use the dropdown menu below the poster (it will say "Plan to Watch" by default) to change its status (e.g., "Watching", "Completed").</li>
                   <li>For TV shows, you can also track your watch progress episode by episode.</li>
                </ol>
            </div>
        )
    },
    {
        icon: <FolderKanban className="h-6 w-6 text-primary" />,
        title: "Using Collections",
        content: (
            <div className="space-y-4 text-muted-foreground">
                <p>Collections help you organize your library into personalized lists (e.g., "All-Time Favorites", "Horror Movies").</p>
                <h4 className="font-semibold text-foreground">How to Create a Collection:</h4>
                <ol className="list-decimal list-inside space-y-2">
                    <li>Navigate to the <strong>"Collections"</strong> page from the main header.</li>
                    <li>Click the <strong>"Create Collection"</strong> button.</li>
                    <li>Give your collection a name and an optional description.</li>
                </ol>
                 <h4 className="font-semibold text-foreground">How to Add Titles to a Collection:</h4>
                 <ul className="list-disc list-inside space-y-2">
                    <li><strong>From a Title's Page:</strong> Click the "Add to collection" button below the poster and select the desired collection(s).</li>
                    <li><strong>From the Collection's Page:</strong> Click "Edit Collection" and use the "Manage Titles" tab to add or remove titles from your library.</li>
                </ul>
            </div>
        )
    },
    {
        icon: <Sparkles className="h-6 w-6 text-primary" />,
        title: "Discovering with Spotlight",
        content: (
            <div className="space-y-4 text-muted-foreground">
                <p>The Spotlight page is your personal recommendation engine, powered by AI.</p>
                <h4 className="font-semibold text-foreground">How it Works:</h4>
                 <ul className="list-disc list-inside space-y-2">
                    <li>Based on what you watch, add, and like, Spotlight generates "Top Picks" and personalized carousels just for you.</li>
                    <li>The more you use the app, the better your recommendations become.</li>
                    <li>You can also browse trending, top-rated, and upcoming titles.</li>
                </ul>
                <h4 className="font-semibold text-foreground">Giving Feedback:</h4>
                 <ul className="list-disc list-inside space-y-2">
                    <li>On the main Spotlight carousel, use the <strong>Thumbs Up</strong> or <strong>Thumbs Down</strong> buttons to improve future recommendations.</li>
                     <li>When you give feedback, the title is removed from your current recommendations.</li>
                </ul>
            </div>
        )
    },
     {
        icon: <Palette className="h-6 w-6 text-primary" />,
        title: "Personalizing Your Profile",
        content: (
            <div className="space-y-4 text-muted-foreground">
                <p>Make Cine-Spot your own by customizing your profile and the app's appearance.</p>
                <h4 className="font-semibold text-foreground">How to Customize Appearance:</h4>
                <ol className="list-decimal list-inside space-y-2">
                    <li>Navigate to the <strong>"Profile"</strong> page from the user menu in the header.</li>
                    <li>Select the <strong>"Appearance"</strong> tab.</li>
                    <li>Here you can switch between <strong>Light and Dark modes</strong> and choose a new <strong>Accent Color</strong> to change the app's primary theme color.</li>
                </ol>
            </div>
        )
    },
    {
        icon: <Import className="h-6 w-6 text-primary" />,
        title: "Data Management",
        content: (
             <div className="space-y-4 text-muted-foreground">
                <p>You have full control over your data. You can back up your entire library and collections to a JSON file.</p>
                <h4 className="font-semibold text-foreground">How to Export Your Data:</h4>
                <ol className="list-decimal list-inside space-y-2">
                    <li>Navigate to the <strong>"Settings"</strong> page from the user menu in the header.</li>
                    <li>Under the "Data Management" section, click <strong>"Export My Data"</strong>.</li>
                    <li>A JSON file containing all your titles and collections will be downloaded to your device. Keep this file in a safe place.</li>
                </ol>
                <h4 className="font-semibold text-foreground">How to Import Your Data:</h4>
                 <ol className="list-decimal list-inside space-y-2">
                    <li>On the <strong>"Settings"</strong> page, click <strong>"Import from Backup"</strong>.</li>
                    <li>Select the `cinespot-backup.json` file you previously exported.</li>
                    <li>The app will load the data from the file into your library. Note: This is a simple import and may not handle complex merge conflicts.</li>
                </ol>
            </div>
        )
    }
];

export default function HelpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container max-w-screen-lg mx-auto py-10">
          <div className="space-y-2 mb-8 text-center">
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-white">
              Help & Documentation
            </h1>
            <p className="text-muted-foreground">
              Find answers to common questions and learn how to use Cine-Spot.
            </p>
          </div>
          
          <Card>
            <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Click a topic to learn more.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {supportTopics.map((topic, index) => (
                         <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>
                                <div className="flex items-center gap-4">
                                    {topic.icon}
                                    <span className="font-semibold text-lg">{topic.title}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pl-14">
                                {topic.content}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>Still have questions? We're here to help.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    If you can't find what you're looking for in the documentation, please feel free to reach out to our support team.
                </p>
                <p className="mt-4">
                    <a href="mailto:support@cinespot.com" className="text-primary hover:underline">support@cinespot.com</a>
                </p>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
