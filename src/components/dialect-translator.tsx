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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

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
      sentence: 'Njan nattilekku pokunnu, veettil ellavarum enthu cheyyunnu?',
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
    <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8 max-w-6xl mx-auto">
      <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Dialect Translations</CardTitle>
            <CardDescription>
              Results from all 14 districts will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 14 }).map((_, index) => (
                  <Card key={index}>
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
            {!loading && translations && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {translations.map((item) => {
                  const Icon = districtIcons[item.district] || MapPin;
                  return (
                    <Card key={item.district} className="flex flex-col border-primary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 font-headline text-lg">
                          <Icon className="h-6 w-6 text-primary" />
                          {item.district}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-base font-medium text-foreground/90">
                          "{item.slang}"
                        </p>
                      </CardContent>
                      <CardFooter className="flex flex-col items-start gap-2">
                        <div className="w-full">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-medium text-muted-foreground">
                              Meaning Match
                            </span>
                            <span className="text-xs font-bold text-accent">
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
             {!loading && !translations && (
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px]">
                    <Languages className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-bold">No translations yet</h3>
                    <p className="text-muted-foreground">
                        Enter a sentence and click "Convert Dialects" to see the magic happen.
                    </p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
        <Card className="sticky top-20">
            <CardHeader>
                <CardTitle>Converter</CardTitle>
                <CardDescription>Enter your sentence to get started.</CardDescription>
            </CardHeader>
            <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="sentence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-primary">
                      Sentence (Manglish)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Ente peru Joseph. Njan evideya pokunnu?"
                        className="resize-none min-h-[160px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="slangIntensity"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                        <FormLabel className="text-base font-semibold text-primary">
                        Slang Intensity
                        </FormLabel>
                        <span className="font-bold text-accent text-sm">
                            {intensityLabels[field.value]}
                        </span>
                    </div>
                    <FormControl>
                      <Slider
                        defaultValue={[1]}
                        min={0}
                        max={2}
                        step={1}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </div>
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin mr-2" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Convert Dialects
                  </>
                )}
              </Button>
            </form>
          </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
