import { google } from '@ai-sdk/google';
import { search } from 'duck-duck-scrape';
import { streamText, tool } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: google('gemini-3.5-flash'),
      messages,
      system: "You are Cloudwarden, an autonomous AI system that runs the company while the founder sleeps. You are embedded in a modern cloud dashboard. You have tools to create tasks, create documents, and execute real-time web searches. Be highly professional, concise, and proactive. When asked to do research, use the webSearch tool to gather data, synthesize the findings, and use the createDocument tool to output a detailed Markdown report.",
      tools: {
        createTask: tool({
          description: 'Create a new task in the dashboard operations feed.',
          parameters: z.object({
            title: z.string().describe('The title of the task'),
            description: z.string().describe('A short description or bullet points for the task'),
            tag: z.string().describe('A short tag like RESEARCH, ENGINEERING, or MARKETING'),
          }),
          // @ts-ignore
          execute: async (args) => {
            return { success: true, ...args };
          }
        }),
        createDocument: tool({
          description: 'Create a new document in the dashboard. Use markdown formatting for the content.',
          parameters: z.object({
            title: z.string().describe('The title of the document'),
            content: z.string().describe('The content of the document formatted in Markdown'),
          }),
          // @ts-ignore
          execute: async (args) => {
            return { success: true, ...args };
          }
        }),
        webSearch: tool({
          description: 'Search the web for information.',
          parameters: z.object({
            query: z.string().describe('The search query'),
          }),
          // @ts-ignore
          execute: async (args) => {
            try {
              const searchResults = await search(args.query, { safeSearch: 1 as any });
              const topResults = searchResults.results.slice(0, 5).map((r: any) => ({
                title: r.title,
                url: r.url,
                snippet: r.description,
              }));
              return { success: true, results: topResults };
            } catch (e: any) {
              return { success: false, error: e.message };
            }
          },
        })
      },
    });

    // @ts-ignore
    return result.toDataStreamResponse?.() ?? result.toAIStreamResponse?.();
  } catch (err: any) {
    console.error("API CHAT ERROR:", err);
    return new Response(JSON.stringify({ error: err.message || err.toString() }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
