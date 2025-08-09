'use client';

import type { ElementType } from 'react';
import React, { useState, useTransition, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Anchor,
  BookOpen,
  Building2,
  Castle,
  ClipboardCopy,
  Factory,
  Languages,
  LoaderCircle,
  MapPin,
  Mountain,
  Music,
  Palmtree,
  Plane,
  Sailboat,
  Search,
  Book,
  Repeat,
  Sparkles,
  Sprout,
  Trees,
  Wheat,
  Info,
  Volume2,
} from 'lucide-react';
import debounce from 'lodash.debounce';

import type { DialectTranslationOutput } from '@/ai/flows/dialect-translation';
import type { SentenceAnalysisOutput } from '@/ai/flows/sentence-analysis';
import type { ReverseTranslationOutput } from '@/ai/flows/reverse-translation';
import type { CulturalInsightOutput } from '@/ai/flows/cultural-insights';

import {
  getDialectTranslations,
  analyzeSentenceApi,
  reverseTranslateApi,
  getCulturalInsightsApi,
  textToSpeechApi,
  DialectTranslationServerInput,
} from '@/app/actions';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { KeralaMap } from './kerala-map';

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
  Standard: Languages,
};

const intensityLabels: { [key: number]: string } = {
  0: 'Low',
  1: 'Medium',
  2: 'High',
};

const ActionDialog: React.FC<{
  title: string;
  triggerIcon: ElementType;
  triggerText: string;
  onOpen: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  children: React.ReactNode;
}> = ({ title, triggerIcon: Icon, triggerText, onOpen, isLoading, error, children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" onClick={async () => await onOpen()}>
          <Icon className="mr-2 h-4 w-4" /> {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <LoaderCircle className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : error ? (
          <div className="text-destructive p-4">{error}</div>
        ) : (
          children
        )}
      </DialogContent>
    </Dialog>
  );
};


export default function DialectTranslator() {
  const [translations, setTranslations] =
    useState<DialectTranslationOutput | null>(null);
  const [analysis, setAnalysis] = useState<SentenceAnalysisOutput | null>(null);
  const [isAnalyzing, startAnalyzing] = useTransition();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [reverseTranslationResult, setReverseTranslationResult] = useState<ReverseTranslationOutput | null>(null);
  const [culturalInsightsResult, setCulturalInsightsResult] = useState<CulturalInsightOutput | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [audioLoading, setAudioLoading] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sentence: 'Njan nattilekku pokunnu, veettil ellavarum enthu cheyyunnu?',
      slangIntensity: 1, // Medium
    },
  });

  const debouncedAnalysis = useCallback(
    debounce((sentence: string) => {
      if (sentence.trim().length > 5) {
        startAnalyzing(async () => {
          try {
            const result = await analyzeSentenceApi({ sentence });
            setAnalysis(result);
          } catch (error) {
            console.error('Failed to analyze sentence', error);
            setAnalysis(null);
          }
        });
      } else {
        setAnalysis(null);
      }
    }, 500),
    []
  );

  const handleSentenceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    form.setValue('sentence', e.target.value);
    debouncedAnalysis(e.target.value);
  };

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

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Translation copied to clipboard.' });
  };

  const handleListen = async (text: string, district: string) => {
    setAudioLoading(district);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    try {
      const { audio } = await textToSpeechApi({ text });
      if (audioRef.current) {
        audioRef.current.src = audio;
        await audioRef.current.play();
      }
    } catch (error) {
      toast({
        title: 'Audio Error',
        description: 'Failed to generate audio.',
        variant: 'destructive',
      });
    } finally {
      setAudioLoading(null);
    }
  };

  const handleReverseTranslate = async (slangSentence: string, district: string) => {
    setIsActionLoading(true);
    setActionError(null);
    setReverseTranslationResult(null);
    try {
      const result = await reverseTranslateApi({ slangSentence, district });
      setReverseTranslationResult(result);
    } catch (error) {
      setActionError('Failed to get reverse translation.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleGetCulturalInsights = async (district: string) => {
    setIsActionLoading(true);
    setActionError(null);
    setCulturalInsightsResult(null);
    try {
      const result = await getCulturalInsightsApi({ district });
      setCulturalInsightsResult(result);
    } catch (error) {
      setActionError('Failed to get cultural insights.');
    } finally {
      setIsActionLoading(false);
    }
  };
  
  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-[1fr_350px] lg:gap-8 max-w-7xl w-full mx-auto">
      <audio ref={audioRef} />
      <div className="md:col-span-2 lg:col-start-1">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Dialect Translations (Malayalam)</CardTitle>
            <CardDescription>
              Results from all 14 districts will appear here in Malayalam script.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {translations.map((item) => {
                  const Icon = districtIcons[item.district] || MapPin;
                  const isAudioLoading = audioLoading === item.district;
                  
                  return (
                    <Card
                      key={item.district}
                      className="flex flex-col border-primary/20 hover:border-primary/50 transition-colors duration-300"
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 font-headline text-lg">
                          <Icon className="h-6 w-6 text-primary" />
                          {item.district}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-xl font-medium text-foreground/90 font-body">
                          {item.slang}
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
                          <Progress
                            value={item.meaningMatchScore}
                            className="h-2"
                          />
                        </div>
                        <Separator className="my-2" />
                        <div className="flex items-center justify-start flex-wrap gap-1 w-full">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyToClipboard(item.slang)}
                          >
                            <ClipboardCopy className="mr-2 h-4 w-4" /> Copy
                          </Button>
                           <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleListen(item.slang, item.district)}
                            disabled={!!audioLoading}
                          >
                            {isAudioLoading ? (
                              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Volume2 className="mr-2 h-4 w-4" />
                            )}
                            Listen
                          </Button>
                          <ActionDialog
                              title={`Reverse Translation: ${item.district}`}
                              triggerIcon={Repeat}
                              triggerText="Translate Back"
                              onOpen={() => handleReverseTranslate(item.slang, item.district)}
                              isLoading={isActionLoading}
                              error={actionError}
                            >
                              {reverseTranslationResult && (
                                <p className="p-4 text-lg">{reverseTranslationResult.standardSentence}</p>
                              )}
                            </ActionDialog>
                            <ActionDialog
                              title={`Cultural Insight: ${item.district}`}
                              triggerIcon={Info}
                              triggerText="Insights"
                              onOpen={() => handleGetCulturalInsights(item.district)}
                              isLoading={isActionLoading}
                              error={actionError}
                            >
                              {culturalInsightsResult && (
                                <div className="space-y-4 p-2">
                                  <p>{culturalInsightsResult.insight}</p>
                                  <h4 className="font-semibold">Popular Phrases:</h4>
                                  <ul className="list-disc list-inside space-y-2">
                                    {culturalInsightsResult.popularPhrases.map((phrase, i) => <li key={i}>{phrase}</li>)}
                                  </ul>
                                </div>
                              )}
                            </ActionDialog>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
            {!loading && !translations && (
               <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px] bg-secondary/30">
                 <KeralaMap className="w-full max-w-md h-auto" highlightedDistricts={[]} />
                 <h3 className="text-xl font-bold mt-4">
                   Translate Manglish to Local Dialects
                 </h3>
                 <p className="text-muted-foreground">
                   Enter a sentence to see it translated into the slangs of all 14 Kerala districts.
                 </p>
               </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid auto-rows-max items-start gap-4 lg:gap-8 md:col-span-1 lg:col-start-2 lg:row-start-1">
        <Card className="sticky top-20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Converter</CardTitle>
            <CardDescription>
              Enter your sentence in Manglish to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
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
                          onChange={handleSentenceChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="h-12">
                  {(isAnalyzing || analysis) && (
                    <Card className="bg-secondary/50 border-primary/20">
                      <CardContent className="p-3">
                        {isAnalyzing ? (
                          <div className="flex items-center gap-3 text-muted-foreground animate-pulse">
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Analyzing input...</span>
                          </div>
                        ) : analysis ? (
                          <div className="flex items-center gap-3">
                            <Search className="h-5 w-5 text-primary" />
                            <div className="text-sm">
                              <span className="font-semibold text-primary">
                                Input Analysis:
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant={
                                    analysis.isStandard
                                      ? 'default'
                                      : 'destructive'
                                  }
                                >
                                  {analysis.dialect}
                                </Badge>
                                <span className="text-muted-foreground text-xs">
                                  ({analysis.confidence}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  )}
                </div>

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

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
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
