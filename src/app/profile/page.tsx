
'use client';
import { Header } from '@/components/layout/Header';
import { ProfileForm } from '@/app/settings/profile-form';
import { ThemeCustomizer } from './theme-customizer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthGuard } from '@/hooks/use-auth-guard';

export default function ProfilePage() {
  useAuthGuard();
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container max-w-screen-lg mx-auto py-10">
          <div className="space-y-2 mb-8">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-white">
              Profile & Personalization
            </h1>
            <p className="text-muted-foreground">
              Manage your public profile and personalization settings.
            </p>
          </div>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="profile">Personal Information</TabsTrigger>
              <TabsTrigger value="personalization">Appearance</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-6">
              <ProfileForm />
            </TabsContent>
            <TabsContent value="personalization" className="mt-6">
              <ThemeCustomizer />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
