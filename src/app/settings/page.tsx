
'use client';
import { Header } from '@/components/layout/Header';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMovies } from '@/lib/hooks/use-movies';
import { useCollections } from '@/hooks/use-collections';
import Link from 'next/link';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useAuth } from '@/hooks/use-auth';
import { changelogData } from '@/lib/changelog.data';


export default function SettingsPage() {
    useAuthGuard();
    const { user } = useAuth();
    const { toast } = useToast();
    const { movies, addMovie } = useMovies();
    const { collections, updateCollection } = useCollections();

    const handleExport = () => {
        const dataToExport = {
            movies,
            collections,
        };
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cinespot-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
            title: "Data Exported",
            description: "Your library and collections have been exported."
        });
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        const data = JSON.parse(event.target?.result as string);
                        if (data.movies && data.collections) {
                            // This is a simple import. For a real app, you'd want to merge, handle conflicts, etc.
                            for (const movie of data.movies) {
                                await addMovie(movie);
                            }
                            for (const collection of data.collections) {
                                await updateCollection(collection.id, collection);
                            }
                            toast({
                                title: "Import Successful",
                                description: "Your data has been imported."
                            });
                        } else {
                            throw new Error("Invalid file format.");
                        }
                    } catch (err) {
                        console.error("Import failed:", err);
                        toast({
                            variant: "destructive",
                            title: "Import Failed",
                            description: "The file was not a valid backup file."
                        });
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container max-w-screen-md mx-auto space-y-12 px-4 py-10 md:px-6">
          <div className="space-y-2">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground">
              Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account and app preferences.
            </p>
          </div>
          <Separator />
          
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Manage your email and password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email || ''} readOnly />
              </div>
              <div className="space-y-2">
                <Button variant="outline" disabled>Change Password</Button>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <Card>
              <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>Export your library or import it from a backup file.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4">
                  <Button variant="outline" onClick={handleExport}>Export My Data</Button>
                  <Button variant="secondary" onClick={handleImport}>Import from Backup</Button>
              </CardContent>
          </Card>

          <Separator />

           <Card>
            <CardHeader>
              <CardTitle>Resources & Support</CardTitle>
               <CardDescription>Need help or want to provide feedback?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild variant="outline"><Link href="/help">Help & Documentation</Link></Button>
                  <Button asChild variant="outline"><Link href="/about">About</Link></Button>
                  <Button asChild variant="outline"><a href="https://docs.google.com/forms/d/e/1FAIpQLSf7RHKFK1R7zbBityZhPS0FHJk68eh9k4ttQTaceBBN3CUpaA/viewform?usp=header" target="_blank" rel="noreferrer">Provide Feedback</a></Button>
                </div>
            </CardContent>
          </Card>

           <Separator />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                These actions are permanent and cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
               <Button variant="destructive" disabled>Delete Account & All Data</Button>
            </CardContent>
          </Card>

        </div>
         <p className="text-xs text-muted-foreground text-center pb-8">App Version: {changelogData.version}</p>
      </main>
    </div>
  );
}
