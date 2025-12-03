const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!
const API_URL = 'https://openrouter.ai/api/v1/chat/completions'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
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
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://voice-ingest.vercel.app',
      'X-Title': 'Voice Ingest',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 4000,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter error: ${response.status} - ${error}`)
  }

  const data: ChatResponse = await response.json()
  return data.choices[0].message.content
}

const FILLER_REMOVAL_PROMPT = `Remove ONLY filler words from this transcript. Remove: um, uh, er, ah, like, you know, basically, so basically, I mean, kind of, sort of, repeated words, false starts.

Do NOT:
- Reword or rephrase anything
- Consolidate sentences
- Change meaning
- Remove non-filler words

Preserve exact phrasing except for filler removal. Return the cleaned text only, no explanations.`

const CLARITY_PROMPT = `Rewrite this text for clarity and readability.

Guidelines:
- Preserve the original meaning
- Keep the speaker's voice and tone
- Fix grammatical issues
- Improve sentence structure
- Remove redundancy

Return the improved text only, no explanations.`

export async function removeFillers(text: string, model?: string): Promise<string> {
  return chat(
    [
      { role: 'system', content: FILLER_REMOVAL_PROMPT },
      { role: 'user', content: text },
    ],
    model
  )
}

export async function rewriteForClarity(text: string, model?: string): Promise<string> {
  return chat(
    [
      { role: 'system', content: CLARITY_PROMPT },
      { role: 'user', content: text },
    ],
    model
  )
}
