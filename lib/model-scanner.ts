import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

export interface OpenRouterModel {
  id: string
  name: string
  description: string
  pricing: {
    prompt: string
    completion: string
  }
  context_length: number
  architecture?: {
    modality: string
    tokenizer: string
    instruct_type: string
  }
  top_provider?: {
    context_length: number
    max_completion_tokens: number
    is_moderated: boolean
  }
}

export interface RankedModel {
  id: string
  name: string
  score: number
  contextLength: number
}

export interface ModelsConfig {
  preferred: string[]
  blocked: string[]
  lastScan: {
    timestamp: string
    models: RankedModel[]
  } | null
}

const MODELS_API = 'https://openrouter.ai/api/v1/models'
const CONFIG_PATH = join(process.cwd(), 'models.config.json')
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

// Provider quality bonuses for scoring
const PROVIDER_BONUSES: Record<string, number> = {
  'grok': 100,
  'claude': 100,
  'gpt': 100,
  'o1': 100,
  'o3': 100,
  'llama-405b': 60,
  'llama-70b': 50,
  'deepseek-r1': 50,
  'qwen3': 45,
  'deepseek': 45,
  'kimi': 45,
  'gemma-27b': 35,
  'mistral-large': 35,
}

function getProviderBonus(modelId: string): number {
  const lowerModelId = modelId.toLowerCase()
  for (const [key, bonus] of Object.entries(PROVIDER_BONUSES)) {
    if (lowerModelId.includes(key)) {
      return bonus
    }
  }
  return 0
}

function extractParamsBillions(modelId: string): number {
  // Extract parameter count from model name (e.g., "llama-3.1-8b" -> 8)
  const match = modelId.match(/(\d+)b/i)
  if (match) {
    return parseInt(match[1], 10)
  }
  return 7 // Default assumption for models without size in name
}

function scoreModel(model: OpenRouterModel): number {
  const params = extractParamsBillions(model.id)
  const contextBonus = model.context_length / 10000
  const providerBonus = getProviderBonus(model.id)

  return (params * 2) + contextBonus + providerBonus
}

export async function scanFreeModels(): Promise<RankedModel[]> {
  const response = await fetch(MODELS_API)
  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.status}`)
  }

  const data = await response.json()
  const models: OpenRouterModel[] = data.data

  // Filter to free models only
  const freeModels = models.filter(m =>
    m.pricing.prompt === '0' && m.pricing.completion === '0'
  )

  // Score and rank
  const ranked: RankedModel[] = freeModels
    .map(m => ({
      id: m.id,
      name: m.name,
      score: scoreModel(m),
      contextLength: m.context_length,
    }))
    .sort((a, b) => b.score - a.score)

  return ranked
}

export async function loadConfig(): Promise<ModelsConfig> {
  try {
    const data = await readFile(CONFIG_PATH, 'utf-8')
    return JSON.parse(data)
  } catch {
    return {
      preferred: [],
      blocked: [],
      lastScan: null,
    }
  }
}

export async function saveConfig(config: ModelsConfig): Promise<void> {
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2))
}

export async function getRankedModels(forceRefresh = false): Promise<RankedModel[]> {
  const config = await loadConfig()

  // Check if cache is valid
  if (!forceRefresh && config.lastScan) {
    const cacheAge = Date.now() - new Date(config.lastScan.timestamp).getTime()
    if (cacheAge < CACHE_TTL_MS) {
      return applyConfigOverrides(config.lastScan.models, config)
    }
  }

  // Fetch fresh data
  const models = await scanFreeModels()

  // Update cache
  config.lastScan = {
    timestamp: new Date().toISOString(),
    models,
  }
  await saveConfig(config)

  return applyConfigOverrides(models, config)
}

function applyConfigOverrides(models: RankedModel[], config: ModelsConfig): RankedModel[] {
  // Filter out blocked models
  const filtered = models.filter(m => !config.blocked.includes(m.id))

  // Move preferred models to front
  const preferred = config.preferred
    .map(id => filtered.find(m => m.id === id))
    .filter((m): m is RankedModel => m !== undefined)

  const rest = filtered.filter(m => !config.preferred.includes(m.id))

  return [...preferred, ...rest]
}

export async function getAvailableModels(): Promise<Array<{ id: string; name: string }>> {
  const ranked = await getRankedModels()
  return ranked.slice(0, 20).map(m => ({ id: m.id, name: m.name }))
}
