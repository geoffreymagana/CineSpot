
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Moon, Sun, MonitorSmartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const accentColors = [
  { name: 'Cinema Red', value: '357 92.2% 46.1%' },
  { name: 'Vibrant Blue', value: '221.2 83.2% 53.3%' },
  { name: 'Emerald Green', value: '142.1 76.2% 36.3%' },
  { name: 'Golden Yellow', value: '47.9 95.8% 53.1%' },
  { name: 'Royal Purple', value: '262.1 83.3% 57.8%' },
];

export function ThemeCustomizer() {
  const [theme, setTheme] = useState('dark');
  const [accent, setAccent] = useState(accentColors[0].value);

  useEffect(() => {
    // On mount, check the current theme from localStorage or the DOM
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.remove('light', 'dark', 'lights-out');
    document.documentElement.classList.add(savedTheme);
    
    // Get the current primary color from CSS variables
    const currentAccent = localStorage.getItem('accent-color') || getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    if(currentAccent) {
      const matchingColor = accentColors.find(c => c.value === currentAccent);
      if(matchingColor) {
        setAccent(matchingColor.value);
      }
    }
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.classList.remove('light', 'dark', 'lights-out');
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleAccentChange = (colorValue: string) => {
    setAccent(colorValue);
    document.documentElement.style.setProperty('--primary', colorValue);
    document.documentElement.style.setProperty('--accent', colorValue);
    localStorage.setItem('accent-color', colorValue);
  };
  
  const handleReset = () => {
    handleThemeChange('dark');
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
            <Button variant={theme === 'light' ? 'default': 'ghost'} size="sm" onClick={() => handleThemeChange('light')} className="flex gap-2">
                <Sun className="h-4 w-4" /> Light
            </Button>
             <Button variant={theme === 'dark' ? 'default': 'ghost'} size="sm" onClick={() => handleThemeChange('dark')} className="flex gap-2">
                <Moon className="h-4 w-4" /> Dark
            </Button>
            <Button variant={theme === 'lights-out' ? 'default' : 'ghost'} size="sm" onClick={() => handleThemeChange('lights-out')} className="flex gap-2">
                <MonitorSmartphone className="h-4 w-4" /> Lights Out
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
