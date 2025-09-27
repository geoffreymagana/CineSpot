
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

const accentColors = [
  { name: 'Cinema Red', value: '357 92.2% 46.1%' },
  { name: 'Vibrant Blue', value: '221.2 83.2% 53.3%' },
  { name: 'Emerald Green', value: '142.1 76.2% 36.3%' },
  { name: 'Golden Yellow', value: '47.9 95.8% 53.1%' },
  { name: 'Royal Purple', value: '262.1 83.3% 57.8%' },
];

export function ThemeCustomizer() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [accent, setAccent] = useState(accentColors[0].value);

  useEffect(() => {
    // On mount, check the current theme from the DOM
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    
    // Get the current primary color from CSS variables
    const currentAccent = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    if(currentAccent) {
      const matchingColor = accentColors.find(c => c.value === currentAccent);
      if(matchingColor) {
        setAccent(matchingColor.value);
      }
    }
  }, []);

  const handleThemeToggle = (darkMode: boolean) => {
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleAccentChange = (colorValue: string) => {
    setAccent(colorValue);
    document.documentElement.style.setProperty('--primary', colorValue);
    document.documentElement.style.setProperty('--accent', colorValue);
    localStorage.setItem('accent-color', colorValue);
  };
  
  const handleReset = () => {
    handleThemeToggle(true);
    handleAccentChange(accentColors[0].value);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize the look and feel of the app.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Color Mode</Label>
          <div className="flex items-center space-x-2 rounded-lg bg-secondary p-2 max-w-min">
            <Button variant={!isDarkMode ? 'default': 'ghost'} size="sm" onClick={() => handleThemeToggle(false)} className="flex gap-2">
                <Sun className="h-4 w-4" /> Light
            </Button>
             <Button variant={isDarkMode ? 'default': 'ghost'} size="sm" onClick={() => handleThemeToggle(true)} className="flex gap-2">
                <Moon className="h-4 w-4" /> Dark
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Accent Color</Label>
          <div className="flex flex-wrap gap-2">
            {accentColors.map((color) => (
              <Button
                key={color.name}
                variant={accent === color.value ? 'default' : 'outline'}
                onClick={() => handleAccentChange(color.value)}
                style={{['--primary' as any]: color.value}}
              >
                <div className="w-4 h-4 rounded-full bg-primary mr-2 border"/>
                {color.name}
              </Button>
            ))}
          </div>
        </div>
        <Button variant="ghost" onClick={handleReset}>Reset to Defaults</Button>
      </CardContent>
    </Card>
  );
}
