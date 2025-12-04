import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

interface ModelConfig {
  id: string
  name: string
  pricing?: { prompt: number; completion: number }
}

interface Settings {
  models: {
    free: ModelConfig[]
    paid: ModelConfig[]
  }
}

// Fallback models if settings.json fails to load
const FALLBACK_FREE = [
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B' },
]
const FALLBACK_PAID = [
  { id: 'google/gemini-2.5-flash-lite-preview-09-2025', name: 'Gemini 2.5 Flash Lite', pricing: { prompt: 0.0000001, completion: 0.0000004 } },
]

async function loadSettings(): Promise<Settings | null> {
  try {
    const settingsPath = path.join(process.cwd(), 'public', 'settings.json')
    const content = await readFile(settingsPath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const tier = request.nextUrl.searchParams.get('tier') || 'free'
  const settings = await loadSettings()

  if (tier === 'paid') {
    const models = settings?.models?.paid || FALLBACK_PAID
    // Add zero pricing for models without pricing specified
    const modelsWithPricing = models.map(m => ({
      ...m,
      pricing: m.pricing || { prompt: 0, completion: 0 }
    }))
    return NextResponse.json({ models: modelsWithPricing, tier: 'paid' })
  }

  const models = settings?.models?.free || FALLBACK_FREE
  // Free models always have zero pricing
  const modelsWithPricing = models.map(m => ({
    ...m,
    pricing: { prompt: 0, completion: 0 }
  }))
  return NextResponse.json({ models: modelsWithPricing, tier: 'free' })
}
