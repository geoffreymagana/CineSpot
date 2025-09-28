
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMovies } from '@/lib/hooks/use-movies';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPosterUrl } from '@/lib/utils';

export function PersonalizationCanvas() {
  const { movies } = useMovies();
  const { toast } = useToast();
  const [basePrompt, setBasePrompt] = useState(
    'A stunning movie poster, dramatic lighting'
  );
  const [personalizedPrompt, setPersonalizedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    // Replace AI generation with a Dicebear-based preview seed derived from top movies.
    setIsGenerating(true);
    setPersonalizedPrompt('');
    try {
      const likedMovies = movies.slice(0, 5);
      if (likedMovies.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Not Enough Data',
          description: 'Add some movies to your library to generate a personalized preview.',
        });
        setIsGenerating(false);
        return;
      }

      const seed = likedMovies.map(m => m.title).join('-').slice(0, 60);
  // Use PNG variant to avoid SVG/CSP/dangerouslyAllowSVG issues
  const dicebearUrl = `https://api.dicebear.com/8.x/thumbs/png?seed=${encodeURIComponent(seed)}&scale=90`;
      setPersonalizedPrompt(dicebearUrl);
      toast({ title: 'Preview Ready', description: 'A fallback avatar/cover has been generated.' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
      <Card>
        <CardHeader>
          <CardTitle>AI Prompt Personalizer</CardTitle>
          <CardDescription>
            Enter a base idea, and we'll infuse it with the visual style of
            your top-rated movies.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="base-prompt">Base Prompt</Label>
            <Input
              id="base-prompt"
              value={basePrompt}
              onChange={e => setBasePrompt(e.target.value)}
              placeholder="e.g., A lone astronaut on a red planet"
            />
          </div>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate Personalized Prompt
          </Button>
          {(isGenerating || personalizedPrompt) && (
            <div className="space-y-2 pt-4">
              <Label>Personalized Preview</Label>
              {isGenerating ? (
                <div>Generating preview...</div>
              ) : (
                <img src={personalizedPrompt} alt="Personalized preview" className="w-full rounded-md" />
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            This tool analyzes the style of your top movies to create a unique
            prompt. Image generation coming soon.
          </p>
        </CardFooter>
      </Card>
  );
}
