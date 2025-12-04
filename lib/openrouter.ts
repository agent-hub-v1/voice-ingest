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
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface ChatResult {
  content: string
  cost: number | null
}

export async function chat(
  messages: Message[],
  model: string = 'meta-llama/llama-3.1-8b-instruct:free',
  pricing?: { prompt: number; completion: number }
): Promise<ChatResult> {
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
  const content = data.choices[0].message.content

  // Calculate cost if pricing provided and usage available
  let cost: number | null = null
  if (pricing && data.usage) {
    cost = (data.usage.prompt_tokens * pricing.prompt) + (data.usage.completion_tokens * pricing.completion)
  }

  return { content, cost }
}

const FILLER_REMOVAL_PROMPT = `Clean this transcript WORD-FOR-WORD. Only make these specific changes:

REMOVE:
- Filler words: um, uh, er, ah, hmm, mm
- Verbal crutches: like, you know, basically, I mean, kind of, sort of, right, actually, literally
- False starts: "I was going to— I went to the store" → "I went to the store"
- Repeated words: "the the" → "the"

FIX:
- Basic punctuation and capitalization
- Run-on sentences (add periods where natural pauses occur)

ABSOLUTELY DO NOT:
- Change ANY words except removing fillers
- Rephrase or reword anything
- Combine or consolidate sentences
- Shorten the content
- Add words that weren't spoken
- Change the speaker's vocabulary or style

This must read as the EXACT words spoken, just without the verbal garbage. Return cleaned text only.`

const PARAGRAPH_INSTRUCTION = `

PARAGRAPHS:
If the text is one large block, split it into logical paragraphs. Start a new paragraph when:
- The topic or subject changes
- A new idea or concept is introduced
- There's a natural shift in the conversation
Use standard paragraph rules. Add a blank line between paragraphs.`

const CLARITY_PROMPT = `Lightly edit this text for clarity while preserving nearly all original content.

STRICT RULES:
- Keep 90-95% of the original length - do NOT significantly shorten
- Fix only obvious grammatical errors
- Keep the speaker's exact voice, tone, and speaking style
- Do NOT consolidate or merge sentences
- Do NOT remove details, examples, or elaborations
- Do NOT summarize or paraphrase - keep original wording where possible

Only make minimal edits to improve readability. Return the edited text only, no explanations.`

const IMPROVE_PROMPT = `Improve this transcript for clarity and communication while preserving ALL details.

RULES:
- Keep 80-90% of the original length minimum
- Preserve EVERY detail, example, story, and point made
- Improve sentence structure and flow
- Fix grammatical issues
- You may lightly rephrase for clarity, but keep the speaker's voice
- Do NOT remove or consolidate content
- Do NOT summarize - this should read as a cleaned-up transcript, not a summary

Return the improved text only, no explanations.`

export async function removeFillers(
  text: string,
  model?: string,
  pricing?: { prompt: number; completion: number },
  splitParagraphs?: boolean
): Promise<ChatResult> {
  const prompt = splitParagraphs
    ? FILLER_REMOVAL_PROMPT + PARAGRAPH_INSTRUCTION
    : FILLER_REMOVAL_PROMPT
  return chat(
    [
      { role: 'system', content: prompt },
      { role: 'user', content: text },
    ],
    model,
    pricing
  )
}

export async function rewriteForClarity(
  text: string,
  model?: string,
  pricing?: { prompt: number; completion: number }
): Promise<ChatResult> {
  return chat(
    [
      { role: 'system', content: CLARITY_PROMPT },
      { role: 'user', content: text },
    ],
    model,
    pricing
  )
}

export async function improveTranscript(
  text: string,
  model?: string,
  pricing?: { prompt: number; completion: number },
  splitParagraphs?: boolean
): Promise<ChatResult> {
  const prompt = splitParagraphs
    ? IMPROVE_PROMPT + PARAGRAPH_INSTRUCTION
    : IMPROVE_PROMPT
  return chat(
    [
      { role: 'system', content: prompt },
      { role: 'user', content: text },
    ],
    model,
    pricing
  )
}

const SUGGEST_METADATA_PROMPT_BASE = `Analyze this transcript and suggest metadata. Return ONLY valid JSON with this exact structure:
{
  "subject": "A brief title (5-10 words max)",
  "summary": "One paragraph summary of the main points discussed",
  "tags": ["tag1", "tag2", "tag3"]
}

Rules for tags:
- Use 2-5 lowercase single-word tags
- Choose from common categories: business, family, health, spiritual, creative, social, financial, planning, reflection, decision, brainstorm, meeting, personal, travel, work, ideas, goals, memories

Return ONLY the JSON object, no markdown, no explanation.`

const SUGGEST_METADATA_MONOLOGUE_ADDITION = `

IMPORTANT: This is a monologue by Richard. In the summary, always refer to the speaker as "Richard" (not "the speaker" or "the narrator"). For example: "Richard discusses..." or "Richard recounts..."`

export interface SuggestedMetadata {
  subject: string
  summary: string
  tags: string[]
}

export async function suggestMetadata(transcript: string, model?: string, isMonologue?: boolean): Promise<SuggestedMetadata> {
  const prompt = isMonologue
    ? SUGGEST_METADATA_PROMPT_BASE + SUGGEST_METADATA_MONOLOGUE_ADDITION
    : SUGGEST_METADATA_PROMPT_BASE
  const result = await chat(
    [
      { role: 'system', content: prompt },
      { role: 'user', content: transcript },
    ],
    model
  )

  // Parse JSON response, handling potential markdown code blocks
  let jsonStr = result.content.trim()
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim()
  }

  try {
    const parsed = JSON.parse(jsonStr)
    return {
      subject: parsed.subject || '',
      summary: parsed.summary || '',
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    }
  } catch {
    throw new Error('Failed to parse AI response as JSON')
  }
}
