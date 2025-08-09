'use server';
/**
 * @fileOverview An AI agent for providing cultural insights about Kerala districts' dialects.
 *
 * - getCulturalInsights - A function that provides cultural information.
 * - CulturalInsightInput - The input type for the getCulturalInsights function.
 * - CulturalInsightOutput - The return type for the getCulturalInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CulturalInsightInputSchema = z.object({
  district: z.string().describe('The name of the Kerala district.'),
});
export type CulturalInsightInput = z.infer<typeof CulturalInsightInputSchema>;

const CulturalInsightOutputSchema = z.object({
  insight: z
    .string()
    .describe(
      'A brief, interesting cultural or linguistic insight about the dialect of the specified district.'
    ),
  popularPhrases: z
    .array(z.string())
    .describe(
      'A list of 3-4 popular or unique phrases from the district, with their standard Malayalam meaning in parentheses.'
    ),
});
export type CulturalInsightOutput = z.infer<typeof CulturalInsightOutputSchema>;

export async function getCulturalInsights(
  input: CulturalInsightInput
): Promise<CulturalInsightOutput> {
  return culturalInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'culturalInsightsPrompt',
  input: { schema: CulturalInsightInputSchema },
  output: { schema: CulturalInsightOutputSchema },
  prompt: `You are a Keralan cultural and linguistic expert. Your task is to provide a brief, engaging insight into the dialect of a specific district, along with a few popular phrases.

  ## INSTRUCTIONS
  1.  **Generate Insight**: Write a short paragraph (2-3 sentences) about the linguistic characteristics, history, or cultural context of the dialect for the given district. Keep it concise and interesting.
  2.  **List Popular Phrases**: Provide a list of 3 or 4 unique or popular phrases/words from that district. For each phrase, provide its standard Malayalam meaning in parentheses.
  3.  **Format**: Ensure the output strictly adheres to the JSON schema.

  ## EXAMPLE
  - Input District: "Thrissur"
  - Output:
  \`\`\`json
  {
    "insight": "The Thrissur dialect is often considered the 'standard' or 'purest' form of Malayalam, partly because it's the cultural capital of Kerala. It's known for its clear, precise, and somewhat rhythmic pronunciation.",
    "popularPhrases": [
      "Enda gadi? (Entha, sughamano? - What's up, are you well?)",
      "Jeddy (Jetty/Bus Stand)",
      "Appo sheri (Okay, fine)"
    ]
  }
  \`\`\`

  ## TASK
  Provide cultural and linguistic insights for the following district:

  - Input District: "{{{district}}}"
  `,
});

const culturalInsightsFlow = ai.defineFlow(
  {
    name: 'culturalInsightsFlow',
    inputSchema: CulturalInsightInputSchema,
    outputSchema: CulturalInsightOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
