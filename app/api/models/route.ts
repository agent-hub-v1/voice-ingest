import { NextResponse } from 'next/server'

interface OpenRouterModel {
  id: string
  name: string
  pricing: {
    prompt: string
    completion: string
  }
  context_length: number
}

// Hardcoded list of good free models (fallback)
const FALLBACK_MODELS = [
  { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B' },
  { id: 'google/gemma-2-9b-it:free', name: 'Gemma 2 9B' },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B' },
  { id: 'qwen/qwen-2-7b-instruct:free', name: 'Qwen 2 7B' },
]

export async function GET() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models')
    if (!response.ok) {
      throw new Error('Failed to fetch from OpenRouter')
    }

    const data = await response.json()
    const models: OpenRouterModel[] = data.data

    // Filter to free models only
    const freeModels = models
      .filter(m => m.pricing.prompt === '0' && m.pricing.completion === '0')
      .slice(0, 20)
      .map(m => ({ id: m.id, name: m.name }))

    if (freeModels.length === 0) {
      return NextResponse.json({ models: FALLBACK_MODELS })
    }

    return NextResponse.json({ models: freeModels })
  } catch (error) {
    console.error('Model fetch error:', error)
    // Return fallback models on error
    return NextResponse.json({ models: FALLBACK_MODELS })
  }
}
