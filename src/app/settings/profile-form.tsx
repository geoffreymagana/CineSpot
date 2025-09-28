
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';


const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: 'Username must be at least 2 characters.',
    })
    .max(30, {
      message: 'Username must not be longer than 30 characters.',
    }),
  bio: z.string().max(160).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;


export function ProfileForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const defaultValues: Partial<ProfileFormValues> = {
    username: user?.displayName || 'CineSpot User',
    bio: '',
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  });
  
  useEffect(() => {
    if (user) {
        form.reset({
            username: user.displayName || 'CineSpot User',
            bio: '' // You can extend this to save bio in user profile
        });
    }
  }, [user, form]);


  async function onSubmit(data: ProfileFormValues) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been updated successfully.',
    });
  }

  // Use PNG variant to avoid SVG/CSP issues when dangerouslyAllowSVG is disabled
  const avatarUrl = user?.photoURL || `https://api.dicebear.com/8.x/bottts-neutral/png?seed=${user?.uid || 'cinespot'}`
  const avatarFallback = user?.displayName?.substring(0, 2).toUpperCase() || 'CS';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
            <CardContent className="space-y-4 pt-6">
                 <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={avatarUrl} alt={user?.displayName || 'User Avatar'} />
                        <AvatarFallback>{avatarFallback}</AvatarFallback>
                    </Avatar>
                    <Button type="button" variant="outline" disabled>Change Avatar</Button>
                 </div>
                <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                        <Input placeholder="Your username" {...field} />
                    </FormControl>
                    <FormDescription>
                        This is your public display name. It can be your real name or a pseudonym.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Tell us a little bit about yourself"
                        className="resize-none"
                        {...field}
                        />
                    </FormControl>
                     <FormDescription>
                        You can <span>@mention</span> other users and organizations to link to them.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <div className="border-t pt-4 flex justify-start">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Profile
                    </Button>
                </div>
            </CardContent>
        </Card>
      </form>
    </Form>
  );
}
