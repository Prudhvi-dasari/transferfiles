import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

async function main() {
  try {
    const result = streamText({
      model: google('gemini-3.5-flash'),
      prompt: 'Hello',
    });
    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
    }
    console.log();
  } catch (err) {
    console.error("ERROR CAUGHT:");
    console.error(err);
  }
}

main();
