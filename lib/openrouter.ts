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
    cost?: number // OpenRouter includes actual cost in response
  }
}

export interface ChatResult {
  content: string
  cost: number | null
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  } | null
}

export async function chat(
  messages: Message[],
  model: string = 'meta-llama/llama-3.1-8b-instruct:free',
  pricing?: { prompt: number; completion: number },
  temperature: number = 0.3
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
      temperature,
      max_tokens: 4000,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter error: ${response.status} - ${error}`)
  }

  const data: ChatResponse = await response.json()
  const content = data.choices[0].message.content

  // Use OpenRouter's native cost if available, otherwise calculate from pricing
  let cost: number | null = null
  if (data.usage?.cost !== undefined) {
    cost = data.usage.cost
  } else if (pricing && data.usage) {
    cost = (data.usage.prompt_tokens * pricing.prompt) + (data.usage.completion_tokens * pricing.completion)
  }

  return { content, cost, usage: data.usage || null }
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

const IMPROVE_PROMPT = `You are a skilled copywriter. Rewrite this transcript to be polished, vibrant, and impactful while preserving the full meaning and all details.

YOUR GOAL:
For each phrase and sentence, ask: "How can I keep the exact same meaning but reorganize and rephrase the wording to make it more compelling and better convey the original intent?"

RULES:
- Keep 80-90% of the original length minimum - do NOT shorten or summarize
- Preserve EVERY detail, example, story, and point made
- Make the writing feel alive, clear, and professionally polished
- Improve flow, rhythm, and sentence structure
- Use stronger verbs and more precise language where it enhances meaning
- Do NOT remove or consolidate content
- Do NOT change the core message or add new information

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
    pricing,
    0.1 // Very low temperature for precise, deterministic filler removal
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
    pricing,
    0.3 // Moderate temperature for light rephrasing while preserving content
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

const DEDASH_PROMPT = `Replace em-dashes and double-dashes with contextually appropriate punctuation.

FIND AND REPLACE:
- Em-dashes (—)
- Double hyphens (--) with or without spaces around them
- En-dashes used as em-dashes (–)

REPLACE WITH (based on context):
- A comma and space (, ) when it's a natural pause or aside
- A period and new sentence when it's a complete thought break
- A colon (:) when introducing a list or explanation
- Parentheses when it's a true parenthetical aside
- Nothing (just join the words) when it was an unnecessary interruption

CRITICAL:
- Do NOT change ANY other words or punctuation
- Only replace dashes - leave everything else exactly as-is
- Output the full text with only dash replacements made

Return the text with dashes replaced, nothing else.`

const ENHANCE_PROMPT_PROMPT = `You are a prompt improver. Take the user's input and make it clearer and more actionable. If the input is vague, add helpful details and structure. If the input is already specific, just clean it up and clarify—don't over-expand. Match the scale of your output to the input: a short note becomes a clear paragraph, not a massive document. Add bullet points or sections only when they genuinely help. Preserve the user's intent and voice. Output only the improved text, no preamble or meta-commentary.`

export async function enhancePrompt(
  text: string,
  model?: string,
  pricing?: { prompt: number; completion: number }
): Promise<ChatResult> {
  return chat(
    [
      { role: 'system', content: ENHANCE_PROMPT_PROMPT },
      { role: 'user', content: text },
    ],
    model,
    pricing,
    0.6 // Higher temperature for more creative prompt expansion
  )
}

export async function dedash(
  text: string,
  model?: string,
  pricing?: { prompt: number; completion: number }
): Promise<ChatResult> {
  return chat(
    [
      { role: 'system', content: DEDASH_PROMPT },
      { role: 'user', content: text },
    ],
    model,
    pricing,
    0.1 // Very low temperature for precise replacements
  )
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
