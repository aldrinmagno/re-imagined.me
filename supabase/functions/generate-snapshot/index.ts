import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

type SnapshotRequestBody = {
  sections?: Record<string, string>;
};

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini';

async function callOpenAI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.4,
      max_tokens: 250,
      messages: [
        {
          role: 'system',
          content:
            'You are a concise career strategist. Reply with friendly, forward-looking, plain-language insights that fit comfortably inside a short paragraph or compact list.'
        },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const message = errorPayload?.error?.message || 'Failed to call OpenAI.';
    throw new Error(message);
  }

  const data = await response.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('OpenAI returned an empty response.');
  }

  return content.trim();
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let body: SnapshotRequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON body.', { status: 400 });
  }

  if (!body.sections || typeof body.sections !== 'object') {
    return new Response('Missing snapshot sections.', { status: 400 });
  }

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    return new Response('OpenAI API key is not configured.', { status: 500 });
  }

  const results: Record<string, string> = {};

  try {
    for (const [key, prompt] of Object.entries(body.sections)) {
      if (typeof prompt !== 'string' || !prompt.trim()) {
        return new Response(`Invalid prompt for section "${key}".`, { status: 400 });
      }

      const completion = await callOpenAI(prompt, apiKey);
      results[key] = completion;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate snapshot.';
    return new Response(message, { status: 500 });
  }

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' }
  });
});
