import { NextRequest, NextResponse } from 'next/server'

interface OpenRouterModel {
  id: string
  name: string
  pricing: {
    prompt: string
    completion: string
  }
  context_length: number
}

// Curated list of good free models (must have :free suffix)
const FREE_MODELS = [
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', pricing: { prompt: 0, completion: 0 } },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (1M ctx)', pricing: { prompt: 0, completion: 0 } },
  { id: 'nousresearch/hermes-3-llama-3.1-405b:free', name: 'Hermes 3 405B (slow)', pricing: { prompt: 0, completion: 0 } },
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B', pricing: { prompt: 0, completion: 0 } },
]

// Curated list of cheap paid models (good for long transcripts)
const PAID_MODELS = [
  { id: 'google/gemini-2.5-flash-lite-preview-09-2025', name: 'Gemini 2.5 Flash Lite', pricing: { prompt: 0.0000001, completion: 0.0000004 } },
  { id: 'x-ai/grok-4.1-fast', name: 'Grok 4.1 Fast', pricing: { prompt: 0.0000002, completion: 0.0000005 } },
]

export async function GET(request: NextRequest) {
  const tier = request.nextUrl.searchParams.get('tier') || 'free'

  if (tier === 'paid') {
    return NextResponse.json({ models: PAID_MODELS, tier: 'paid' })
  }

  return NextResponse.json({ models: FREE_MODELS, tier: 'free' })
}
