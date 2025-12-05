# Dedash LLM Version - Archived Code

To restore LLM-based dedash, replace the simple regex version with this code.

## 1. In `lib/openrouter.ts` - Add the dedash function and prompt:

```typescript
const DEDASH_PROMPT = `You are a precise text editor. Your ONLY job is to replace em-dashes with better punctuation.

INPUT: Text containing em-dashes (—), en-dashes (–), or double-hyphens (--)

YOUR TASK: Replace each dash with contextually appropriate punctuation:
- Usually a comma (, )
- Sometimes a period (. ) to start a new sentence
- Sometimes a colon (: )
- Sometimes parentheses for asides
- Sometimes nothing (just remove the dash and join words)

ABSOLUTE RULES:
1. PRESERVE ALL LINE BREAKS AND PARAGRAPH STRUCTURE EXACTLY
2. Do NOT change any words - only replace dashes with punctuation
3. Do NOT add or remove any text
4. Do NOT reformat or restructure the text
5. Output MUST have the same number of paragraphs as input

Return ONLY the modified text with dashes replaced. No explanations.`

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
```

## 2. In `app/api/clean-text/route.ts` - Add dedash to imports and handler:

```typescript
// Add to imports:
import { removeFillers, improveTranscript, enhancePrompt, dedash } from '@/lib/openrouter'

// Add to mode validation:
if (mode !== 'filler' && mode !== 'improve' && mode !== 'enhance' && mode !== 'dedash') {

// Add to handler:
} else if (mode === 'dedash') {
  chatResult = await dedash(text, model, pricing)
}
```

## 3. In `components/transcription-editor.tsx` - Replace handleDedash function:

```typescript
async function handleDedash() {
  // Find all dashes in the original text first
  const dashPattern = /—|–|--\s*|\s*--/g
  const originalRanges: Array<{ start: number; end: number }> = []
  let match
  while ((match = dashPattern.exec(editedText)) !== null) {
    originalRanges.push({ start: match.index, end: match.index + match[0].length })
  }

  if (originalRanges.length === 0) {
    toast.info("No dashes found", { description: "No em-dashes, en-dashes, or double-dashes to replace." })
    return
  }

  const model = selectedModel
  const selectedModelData = models.find(m => m.id === selectedModel)
  const modelName = selectedModelData?.name || model
  const pricing = selectedModelData?.pricing

  const inputChars = editedText.length
  toast.info(`API Request: dedash`, {
    description: `Model: ${modelName} | Found ${originalRanges.length} dash${originalRanges.length === 1 ? '' : 'es'}`,
  })

  const startTime = Date.now()

  try {
    setIsProcessing(true)

    const res = await fetch("/api/clean-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: editedText,
        mode: "dedash",
        model,
        pricing,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || "Processing failed")
    }

    const data = await res.json()
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

    if (data.cost !== null && data.cost !== undefined) {
      setLastCost(data.cost)
    }

    if (data.usage) {
      setLastApiCall({
        usage: data.usage,
        cost: data.cost,
        modelName,
        pricing,
      })
    }

    const usage = data.usage
    let description = `Time: ${elapsed}s`
    if (usage) {
      description += ` | Tokens: ${usage.prompt_tokens.toLocaleString()} in / ${usage.completion_tokens.toLocaleString()} out`
    }
    if (data.cost !== null) {
      const costDisplay = data.cost < 0.01
        ? `1/${Math.round(0.01 / data.cost)} cent`
        : `${(data.cost * 100).toFixed(2)}¢`
      description += ` | Cost: ${costDisplay}`
    }
    toast.success(`Response: dedash`, { description })

    setReviewMode({
      before: editedText,
      after: data.result,
      isEntireTranscript: true,
      originalRanges,
    })
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    toast.error(`Failed: dedash`, {
      description: `${err instanceof Error ? err.message : "Processing failed"} (${elapsed}s)`,
    })
  } finally {
    setIsProcessing(false)
  }
}
```
