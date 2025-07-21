'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { capitalRanges } from '@/lib/waitlist/config';
import { dealerCapitalRanges } from '@/lib/waitlist/dealer-config';
import { useToast } from '../ui/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function WaitlistForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('collector');
  const [capitalRange, setCapitalRange] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const ranges = userType === 'collector' ? capitalRanges : dealerCapitalRanges;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, userType, capitalRange }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit. Please try again.');
      }

      toast({
        title: "You're on the list!",
        description: "We've received your submission. We'll be in touch soon.",
      });
      setName('');
      setEmail('');
      setCapitalRange('');
    } catch (error) {
      toast({
        title: 'Uh oh! Something went wrong.',
        description: (error as Error).message || 'There was a problem with your request.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Join the Waitlist</CardTitle>
        <CardDescription>Get early access and exclusive updates.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>I am a...</Label>
            <RadioGroup
              defaultValue="collector"
              className="flex space-x-4"
              onValueChange={setUserType}
              value={userType}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="collector" id="collector" />
                <Label htmlFor="collector">Collector</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dealer" id="dealer" />
                <Label htmlFor="dealer">Dealer</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="capital-range">
              Estimated Annual Volume
            </Label>
            <Select onValueChange={setCapitalRange} value={capitalRange} required>
              <SelectTrigger id="capital-range">
                <SelectValue placeholder="Select a range" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} align="center">
                {ranges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Join Waitlist'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 