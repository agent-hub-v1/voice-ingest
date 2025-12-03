/**
 * OpenRouter Free Model Scanner
 *
 * Fetches, scores, and ranks free models from OpenRouter.
 * Combines automated capability scoring with manual overrides.
 */

export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  architecture?: {
    modality: string;
  };
}

export interface ScoredModel {
  id: string;
  name: string;
  score: number;
  context_length: number;
  params_billions: number | null;
  provider: string;
  reason: string;
}

export interface ModelsConfig {
  // Manual overrides - these always come first
  preferred: string[];
  // Models to never show
  blocked: string[];
  // Cached scan results
  lastScan: {
    timestamp: string;
    models: ScoredModel[];
  } | null;
}

// Known high-quality providers/models get bonus points
const PROVIDER_BONUSES: Record<string, number> = {
  // Frontier-class when free (rare but happens)
  'grok': 100,
  'claude': 100,
  'gpt': 100,
  'o1': 100,
  'o3': 100,

  // Top tier open models
  'llama-3.1-405b': 60,
  'llama-3.3-70b': 55,
  'llama-405b': 60,
  'llama-70b': 50,
  'qwen3': 45,
  'qwen2': 40,
  'deepseek': 45,
  'deepseek-r1': 50,

  // Strong mid-tier
  'gemma-3-27b': 35,
  'gemma-3-12b': 30,
  'mistral-large': 35,
  'hermes': 30,
  'kimi': 35,

  // Decent
  'gemma': 20,
  'mistral': 20,
  'llama': 15,
};

/**
 * Extract parameter count from model description
 * Examples: "405B parameters", "70B-parameter", "41B active parameters"
 */
function extractParamsBillions(description: string, modelId: string): number | null {
  // Try description first
  const patterns = [
    /(\d+(?:\.\d+)?)\s*[Bb]\s*(?:parameters?|params?)/i,
    /(\d+(?:\.\d+)?)\s*[Bb]\s*(?:active\s+)?(?:parameters?|params?)/i,
    /(\d+(?:\.\d+)?)\s*billion/i,
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      return parseFloat(match[1]);
    }
  }

  // Try to extract from model ID
  const idMatch = modelId.match(/(\d+)[bB](?:-|$|:)/);
  if (idMatch) {
    return parseFloat(idMatch[1]);
  }

  return null;
}

/**
 * Calculate provider bonus based on model ID
 */
function getProviderBonus(modelId: string): { bonus: number; matchedKey: string | null } {
  const lowerModelId = modelId.toLowerCase();

  let bestBonus = 0;
  let matchedKey: string | null = null;

  for (const [key, bonus] of Object.entries(PROVIDER_BONUSES)) {
    if (lowerModelId.includes(key.toLowerCase())) {
      if (bonus > bestBonus) {
        bestBonus = bonus;
        matchedKey = key;
      }
    }
  }

  return { bonus: bestBonus, matchedKey };
}

/**
 * Score a model based on capabilities
 */
function scoreModel(model: OpenRouterModel): ScoredModel {
  const params = extractParamsBillions(model.description, model.id);
  const { bonus: providerBonus, matchedKey } = getProviderBonus(model.id);

  // Base score components
  const paramScore = params ? params * 2 : 0; // 2 points per billion params
  const contextScore = model.context_length / 10000; // 1 point per 10k context

  const totalScore = paramScore + contextScore + providerBonus;

  // Build reason string
  const reasons: string[] = [];
  if (params) reasons.push(`${params}B params`);
  reasons.push(`${(model.context_length / 1000).toFixed(0)}k context`);
  if (matchedKey) reasons.push(`${matchedKey} bonus`);

  return {
    id: model.id,
    name: model.name,
    score: Math.round(totalScore * 10) / 10,
    context_length: model.context_length,
    params_billions: params,
    provider: model.id.split('/')[0],
    reason: reasons.join(', '),
  };
}

/**
 * Fetch and score all free models from OpenRouter
 */
export async function scanFreeModels(): Promise<ScoredModel[]> {
  const response = await fetch('https://openrouter.ai/api/v1/models');

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  const models: OpenRouterModel[] = data.data || [];

  // Filter to free text models only
  const freeModels = models.filter(m => {
    const isFree = m.pricing.prompt === '0' && m.pricing.completion === '0';
    const isTextModel = !m.architecture?.modality ||
                        m.architecture.modality.includes('text');
    return isFree && isTextModel;
  });

  // Score and sort
  const scored = freeModels.map(scoreModel);
  scored.sort((a, b) => b.score - a.score);

  return scored;
}

/**
 * Get ranked models, respecting config overrides
 */
export async function getRankedModels(config: ModelsConfig): Promise<ScoredModel[]> {
  // Get scan results (from cache or fresh)
  let scanned: ScoredModel[];

  if (config.lastScan && isRecent(config.lastScan.timestamp, 24 * 60 * 60 * 1000)) {
    scanned = config.lastScan.models;
  } else {
    scanned = await scanFreeModels();
  }

  // Filter out blocked
  const blocked = new Set(config.blocked.map(b => b.toLowerCase()));
  scanned = scanned.filter(m => !blocked.has(m.id.toLowerCase()));

  // Build final list: preferred first, then by score
  const preferred = new Set(config.preferred.map(p => p.toLowerCase()));
  const preferredModels: ScoredModel[] = [];
  const otherModels: ScoredModel[] = [];

  for (const model of scanned) {
    if (preferred.has(model.id.toLowerCase())) {
      // Boost preferred models to top
      preferredModels.push({ ...model, reason: `⭐ preferred, ${model.reason}` });
    } else {
      otherModels.push(model);
    }
  }

  // Sort preferred by original preference order
  preferredModels.sort((a, b) => {
    const aIdx = config.preferred.findIndex(p => p.toLowerCase() === a.id.toLowerCase());
    const bIdx = config.preferred.findIndex(p => p.toLowerCase() === b.id.toLowerCase());
    return aIdx - bIdx;
  });

  return [...preferredModels, ...otherModels];
}

function isRecent(timestamp: string, maxAgeMs: number): boolean {
  const date = new Date(timestamp);
  return Date.now() - date.getTime() < maxAgeMs;
}

/**
 * Default config for new installations
 */
export const DEFAULT_MODELS_CONFIG: ModelsConfig = {
  preferred: [
    // Add your discovered gems here
  ],
  blocked: [
    // Models that don't work well for text cleaning
  ],
  lastScan: null,
};
