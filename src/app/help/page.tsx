 'use client';
import { Header } from '@/components/layout/Header';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, FolderKanban, Sparkles, Palette, Import, MessageSquareQuote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const supportTopics = [
    {
        icon: <Users className="h-6 w-6 text-primary" />,
        title: 'Managing Your Library',
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
                    <li>Use the dropdown menu below the poster to change its status (e.g., "Watching", "Completed").</li>
                    <li>For TV shows, you can also track your watch progress episode by episode.</li>
                </ol>
            </div>
        ),
    },
    {
        icon: <FolderKanban className="h-6 w-6 text-primary" />,
        title: 'Using Collections',
        content: (
            <div className="space-y-4 text-muted-foreground">
                <p>Collections help you organize your library into personalized lists (e.g., "All-Time Favorites", "Horror Movies").</p>
                <h4 className="font-semibold text-foreground">How to Create a Collection:</h4>
                <ol className="list-decimal list-inside space-y-2">
                    <li>Navigate to the <strong>"Collections"</strong> page from the main header.</li>
                    <li>Click the <strong>"Create Collection"</strong> button.</li>
                    <li>Give your collection a name and an optional description.</li>
                </ol>
            </div>
        ),
    },
    {
        icon: <Sparkles className="h-6 w-6 text-primary" />,
        title: 'Discovering with Spotlight',
        content: (
            <div className="space-y-4 text-muted-foreground">
                <p>The Spotlight page is your personal recommendation engine, powered by AI.</p>
                <h4 className="font-semibold text-foreground">How it Works:</h4>
                <ul className="list-disc list-inside space-y-2">
                    <li>Spotlight suggests titles based on your library and feedback.</li>
                    <li>Use Thumbs Up / Thumbs Down to train recommendations.</li>
                </ul>
            </div>
        ),
    },
    {
        icon: <Palette className="h-6 w-6 text-primary" />,
        title: 'Personalizing Your Profile',
        content: (
            <div className="space-y-4 text-muted-foreground">
                <p>Customize your profile and app appearance from the Profile page.</p>
            </div>
        ),
    },
    {
        icon: <Import className="h-6 w-6 text-primary" />,
        title: 'Data Management',
        content: (
            <div className="space-y-4 text-muted-foreground">
                <p>Export and import your library from the Settings page.</p>
            </div>
        ),
    },
];

export default function HelpPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <div className="container max-w-screen-2xl mx-auto px-4 py-6 md:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold mb-4">Help & Documentation</h1>
                    <Card>
                        <CardHeader>
                            <CardTitle>Getting Started</CardTitle>
                            <CardDescription>Common tasks and guides to get you up and running.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible>
                                {supportTopics.map((topic, idx) => (
                                    <AccordionItem value={`topic-${idx}`} key={idx}>
                                        <AccordionTrigger>
                                            <div className="flex items-center gap-4">
                                                {topic.icon}
                                                <span className="font-semibold text-lg">{topic.title}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pl-14">{topic.content}</AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>

                    <Card className="mt-8">
                        <CardHeader>
                             <div className="flex items-center gap-4">
                                <MessageSquareQuote className="h-8 w-8 text-primary" />
                                <div>
                                    <CardTitle>Feedback & Support</CardTitle>
                                    <CardDescription>Still have questions or an idea for a feature? We're here to help.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                                <Button asChild>
                                    <a href="https://docs.google.com/forms/d/e/1FAIpQLSf7RHKFK1R7zbBityZhPS0FHJk68eh9k4ttQTaceBBN3CUpaA/viewform?usp=header" target="_blank" rel="noreferrer">
                                        Provide Feedback
                                    </a>
                                </Button>
                                 <Button asChild variant="outline">
                                    <a href="mailto:support@cinespot.com" className="text-primary hover:underline">Contact Support</a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
