// src/ai/flows/empathetic-message.ts
'use server';

/**
 * @fileOverview Generates an empathetic message when a user breaks a habit streak.
 *
 * - empatheticMessage - A function that generates an empathetic message.
 * - EmpatheticMessageInput - The input type for the empatheticMessage function.
 * - EmpatheticMessageOutput - The return type for the empatheticMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EmpatheticMessageInputSchema = z.object({
  habitName: z.string().describe('The name of the habit.'),
  streakLength: z.number().describe('The length of the streak that was broken.'),
});
export type EmpatheticMessageInput = z.infer<typeof EmpatheticMessageInputSchema>;

const EmpatheticMessageOutputSchema = z.object({
  message: z.string().describe('The empathetic message to display to the user.'),
});
export type EmpatheticMessageOutput = z.infer<typeof EmpatheticMessageOutputSchema>;

export async function empatheticMessage(input: EmpatheticMessageInput): Promise<EmpatheticMessageOutput> {
  return empatheticMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'empatheticMessagePrompt',
  input: {schema: EmpatheticMessageInputSchema},
  output: {schema: EmpatheticMessageOutputSchema},
  prompt: `You are a supportive and understanding AI assistant. A user has broken their streak for the habit "{{habitName}}" after maintaining it for {{streakLength}} days. Generate an empathetic message to encourage them to get back on track. The message should be no more than two sentences long and should acknowledge their effort while motivating them to start a new streak.`,
});

const empatheticMessageFlow = ai.defineFlow(
  {
    name: 'empatheticMessageFlow',
    inputSchema: EmpatheticMessageInputSchema,
    outputSchema: EmpatheticMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
