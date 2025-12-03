# OpenRouter API Reference

API documentation for OpenRouter chat completions. **FREE MODELS ONLY.**

---

## 1. Overview

OpenRouter provides a unified API for multiple LLM providers. It's OpenAI-compatible, so the request format is familiar.

**Constraint**: voice-ingest uses FREE models only. User has no API budget.

---

## 2. API Endpoint

```
POST https://openrouter.ai/api/v1/chat/completions
```

---

## 3. Authentication

### Headers

```
Authorization: Bearer {OPENROUTER_API_KEY}
Content-Type: application/json
```

### Optional Headers (for attribution)

```
HTTP-Referer: https://your-app.vercel.app
X-Title: Voice Ingest
```

---

## 4. Request Format

```json
{
  "model": "meta-llama/llama-3.1-8b-instruct:free",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | Model ID (use `:free` suffix for free models) |
| `messages` | array | Yes | Array of message objects |
| `temperature` | number | No | Randomness (0-2, default varies by model) |
| `max_tokens` | number | No | Max response length |
| `stream` | boolean | No | Enable streaming (default: false) |

### Message Object

```json
{
  "role": "system" | "user" | "assistant",
  "content": "Message text"
}
```

---

## 5. Response Format

```json
{
  "id": "gen-xxx",
  "model": "meta-llama/llama-3.1-8b-instruct:free",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Response text here..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 100,
    "total_tokens": 150
  }
}
```

---

## 6. Free Models & Model Scanner

**IMPORTANT**: Free models change frequently. Use the built-in model scanner.

### Model Scanner System

voice-ingest includes an automated model scanner that:
1. Fetches all models from OpenRouter API
2. Filters to free models only (`pricing.prompt === "0"`)
3. Scores by: parameter count, context length, provider quality
4. Respects manual overrides in `models.config.json`

### Configuration File

Edit `models.config.json` in project root:

```json
{
  "preferred": [
    "x-ai/grok-4:free",
    "nousresearch/hermes-3-llama-3.1-405b:free"
  ],
  "blocked": [
    "some-model/that-sucks:free"
  ],
  "lastScan": null
}
```

- **preferred**: Your manual picks - always shown first
- **blocked**: Models to hide from selection
- **lastScan**: Auto-populated cache (24h TTL)

### Scoring Algorithm

```
score = (params_billions * 2) + (context_length / 10000) + provider_bonus

Provider bonuses:
- grok, claude, gpt, o1, o3: +100 (frontier when free!)
- llama-405b: +60
- llama-70b, deepseek-r1: +50
- qwen3, deepseek, kimi: +45
- gemma-27b, mistral-large: +35
```

### Usage in Code

```typescript
import { scanFreeModels, getRankedModels } from '@/lib/model-scanner';
import config from '@/models.config.json';

// Fresh scan
const models = await scanFreeModels();

// With config overrides
const ranked = await getRankedModels(config);
```

### Manual Discovery Workflow

When you discover a powerful free model (like Grok going free):
1. Test it manually
2. Add to `models.config.json` → `preferred` array
3. It will appear first in the dropdown

---

## 7. TypeScript Implementation

### lib/openrouter.ts

```typescript
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function chat(
  messages: Message[],
  model: string = 'meta-llama/llama-3.1-8b-instruct:free'
): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,  // Low for consistent text processing
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter error: ${response.status} - ${error}`);
  }

  const data: ChatResponse = await response.json();
  return data.choices[0].message.content;
}
```

---

## 8. Voice-Ingest Use Cases

### Filler Word Removal

```typescript
const FILLER_REMOVAL_PROMPT = `Remove ONLY filler words from this transcript. Remove: um, uh, er, ah, like, you know, basically, so basically, I mean, kind of, sort of, repeated words, false starts.

Do NOT:
- Reword or rephrase anything
- Consolidate sentences
- Change meaning
- Remove non-filler words

Preserve exact phrasing except for filler removal. Return the cleaned text only, no explanations.`;

export async function removeFillers(text: string): Promise<string> {
  return chat([
    { role: 'system', content: FILLER_REMOVAL_PROMPT },
    { role: 'user', content: text },
  ]);
}
```

### Clarity Rewrite

```typescript
const CLARITY_PROMPT = `Rewrite this text for clarity and readability.

Guidelines:
- Preserve the original meaning
- Keep the speaker's voice and tone
- Fix grammatical issues
- Improve sentence structure
- Remove redundancy

Return the improved text only, no explanations.`;

export async function rewriteForClarity(text: string): Promise<string> {
  return chat([
    { role: 'system', content: CLARITY_PROMPT },
    { role: 'user', content: text },
  ]);
}
```

---

## 9. API Route Example

### /api/clean-text/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { chat } from '@/lib/openrouter';

const PROMPTS = {
  filler: `Remove ONLY filler words from this transcript. Remove: um, uh, er, ah, like, you know, basically, so basically, I mean, kind of, sort of, repeated words, false starts. Do NOT reword, consolidate, or change meaning. Preserve exact phrasing except for filler removal. Return the cleaned text only.`,

  clarity: `Rewrite this text for clarity and readability. Preserve the original meaning and speaker's voice. Fix grammatical issues. Return the improved text only.`,
};

export async function POST(request: NextRequest) {
  const { text, mode, model } = await request.json();

  if (!text || !mode) {
    return NextResponse.json(
      { error: 'Missing text or mode' },
      { status: 400 }
    );
  }

  const systemPrompt = PROMPTS[mode as keyof typeof PROMPTS];
  if (!systemPrompt) {
    return NextResponse.json(
      { error: 'Invalid mode. Use "filler" or "clarity"' },
      { status: 400 }
    );
  }

  try {
    const result = await chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      model || 'meta-llama/llama-3.1-8b-instruct:free'
    );

    return NextResponse.json({ result });
  } catch (error) {
    console.error('OpenRouter error:', error);
    return NextResponse.json(
      { error: 'Text cleaning failed' },
      { status: 500 }
    );
  }
}
```

---

## 10. Error Handling

### Common Errors

| Status | Meaning | Solution |
|--------|---------|----------|
| 401 | Invalid API key | Check OPENROUTER_API_KEY |
| 429 | Rate limited | Wait and retry |
| 503 | Model unavailable | Try fallback model |

### Error Handling Pattern

```typescript
try {
  const result = await chat(messages, model);
  return result;
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('429')) {
      // Rate limited - wait and retry
      await new Promise(r => setTimeout(r, 1000));
      return chat(messages, model);
    }
    if (error.message.includes('503')) {
      // Model unavailable - try fallback
      return chat(messages, 'mistralai/mistral-7b-instruct:free');
    }
  }
  throw error;
}
```

---

## 11. Environment Variables

```bash
OPENROUTER_API_KEY=sk-or-v1-xxx
```

Get your API key at: https://openrouter.ai/keys

---

## 12. Free Tier Limits

Free models have rate limits but no cost. Limits vary by model and change over time.

**Best practice**:
- Don't spam requests
- Add small delays between calls if processing multiple segments
- Cache results where possible
