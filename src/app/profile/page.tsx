
'use client';
import { Header } from '@/components/layout/Header';
import { ProfileForm } from '@/app/settings/profile-form';
import { ThemeCustomizer } from './theme-customizer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnalyticsPlaceholder } from './analytics-placeholder';

export default function ProfilePage() {
  useAuthGuard();
  const { user } = useAuth();
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const url = new URL('/?openFrom=qr', window.location.origin);
    url.searchParams.set('uid', user.uid);
    QRCode.toDataURL(url.href, { width: 280 })
      .then((data: string) => setQrSrc(data))
      .catch(() => setQrSrc(null));
  }, [user]);
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container max-w-screen-lg mx-auto py-10">
          <div className="space-y-2 mb-8">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground">
              Profile & Personalization
            </h1>
            <p className="text-muted-foreground">
              Manage your public profile and personalization settings.
            </p>
          </div>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-lg">
              <TabsTrigger value="profile">Personal Information</TabsTrigger>
              <TabsTrigger value="personalization">Appearance</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2">
                  <ProfileForm />
                </div>
                <div>
                  <Card className="p-4">
                    <h3 className="font-medium">Open on Mobile</h3>
                    <p className="text-sm text-muted-foreground mb-4">Scan with your phone to open Cine-Spot (will attempt to open the app if installed).</p>
                    {qrSrc ? (
                      <div className="flex flex-col items-center">
                        <img src={qrSrc} alt="Open Cine-Spot" className="w-56 h-56 rounded-md" />
                        <Button asChild variant="outline" className="mt-3 w-full">
                          <a href={`/?uid=${user?.uid}`}>Open link</a>
                        </Button>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">QR not available</div>
                    )}
                  </Card>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="personalization" className="mt-6">
              <ThemeCustomizer />
            </TabsContent>
             <TabsContent value="analytics" className="mt-6">
              <AnalyticsPlaceholder />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
