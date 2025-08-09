'use client';

import type { ElementType } from 'react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Anchor,
  BookOpen,
  Building2,
  Castle,
  Factory,
  Languages,
  LoaderCircle,
  MapPin,
  Mountain,
  Music,
  Palmtree,
  Plane,
  Sailboat,
  Sparkles,
  Sprout,
  Trees,
  Wheat,
} from 'lucide-react';

import type { DialectTranslationOutput } from '@/ai/flows/dialect-translation';
import { getDialectTranslations, DialectTranslationServerInput } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  sentence: z
    .string()
    .min(1, { message: 'Please enter a sentence to translate.' }),
  slangIntensity: z.number().min(0).max(2),
});

const districtIcons: { [key: string]: ElementType } = {
  Thiruvananthapuram: Building2,
  Kollam: Anchor,
  Pathanamthitta: Sprout,
  Alappuzha: Sailboat,
  Kottayam: BookOpen,
  Idukki: Mountain,
  Ernakulam: Factory,
  Thrissur: Music,
  Palakkad: Wheat,
  Malappuram: Plane,
  Kozhikode: Palmtree,
  Wayanad: Trees,
  Kannur: Castle,
  Kasaragod: Languages,
};

const intensityLabels: { [key: number]: string } = {
  0: 'Low',
  1: 'Medium',
  2: 'High',
};

export default function DialectTranslator() {
  const [translations, setTranslations] =
    useState<DialectTranslationOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sentence: '',
      slangIntensity: 1, // Medium
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setTranslations(null);

    const intensityMap: Array<'low' | 'medium' | 'high'> = [
      'low',
      'medium',
      'high',
    ];
    const input: DialectTranslationServerInput = {
      sentence: values.sentence,
      slangIntensity: intensityMap[values.slangIntensity],
    };

    try {
      const result = await getDialectTranslations(input);
      setTranslations(result);
    } catch (error) {
      toast({
        title: 'Translation Error',
        description:
          error instanceof Error
            ? error.message
            : 'An unknown error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="sentence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-primary">
                      Your Sentence (in Manglish)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Ente peru Joseph. Njan evideya pokunnu?"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slangIntensity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-primary">
                      Slang Intensity:
                      <span className="font-bold text-accent ml-2">
                        {intensityLabels[field.value]}
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Slider
                        defaultValue={[1]}
                        min={0}
                        max={2}
                        step={1}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <LoaderCircle className="animate-spin mr-2" />
                ) : (
                  <Sparkles className="mr-2 h-5 w-5" />
                )}
                Convert Dialects
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="mt-12">
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 14 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-5 w-4/5" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-5 w-24" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {translations && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {translations.map((item) => {
              const Icon = districtIcons[item.district] || MapPin;
              return (
                <Card key={item.district} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 font-headline">
                      <Icon className="h-6 w-6 text-primary" />
                      {item.district}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                      "{item.slang}"
                    </p>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start gap-2">
                    <div className="w-full">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-muted-foreground">
                          Meaning Match
                        </span>
                        <span className="text-sm font-bold text-accent">
                          {item.meaningMatchScore}%
                        </span>
                      </div>
                      <Progress value={item.meaningMatchScore} className="h-2" />
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
