'use server';

import { z } from 'zod';
import { dialectTranslation, DialectTranslationOutput } from '@/ai/flows/dialect-translation';

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
