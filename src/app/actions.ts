'use server';

import { z } from 'zod';
import { dialectTranslation, DialectTranslationOutput } from '@/ai/flows/dialect-translation';
import { analyzeSentence, SentenceAnalysisInput, SentenceAnalysisOutput } from '@/ai/flows/sentence-analysis';

const DialectTranslationInputSchema = z.object({
  sentence: z.string().describe('The sentence to translate into Malayalam dialects (in Manglish).'),
  slangIntensity: z.enum(['low', 'medium', 'high']).describe('The intensity of slang to use in the translation.'),
});

export type DialectTranslationServerInput = z.infer<typeof DialectTranslationInputSchema>;

export async function getDialectTranslations(input: DialectTranslationServerInput): Promise<DialectTranslationOutput> {
  const parsedInput = DialectTranslationInputSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new Error('Invalid input');
  }
  
  try {
    const result = await dialectTranslation(parsedInput.data);
    return result;
  } catch (error) {
    console.error('Error in dialect translation flow:', error);
    throw new Error('Failed to get dialect translations due to a server error.');
  }
}

const SentenceAnalysisRequestSchema = z.object({
  sentence: z.string().describe('The sentence to analyze (in Manglish).'),
});

export async function analyzeSentenceApi(input: SentenceAnalysisInput): Promise<SentenceAnalysisOutput> {
    const parsedInput = SentenceAnalysisRequestSchema.safeParse(input);
    if (!parsedInput.success) {
        throw new Error('Invalid input for sentence analysis');
    }

    try {
        const result = await analyzeSentence(parsedInput.data);
        return result;
    } catch(error) {
        console.error('Error in sentence analysis flow:', error);
        throw new Error('Failed to analyze sentence due to a server error.');
    }
}
