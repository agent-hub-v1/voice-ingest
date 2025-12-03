---
name: openrouter-docs
description: OpenRouter API documentation for AI text cleaning. Use when implementing the /api/clean-text endpoint, model scanner, or any OpenRouter API calls. FREE MODELS ONLY.
---

# OpenRouter Documentation

API reference for OpenRouter chat completions + model scanner system.

## PRIMARY DOCUMENT

**START HERE -> [docs/index.md](docs/index.md)**

Covers:
- API endpoint and authentication
- Request/response format
- **Model Scanner System** (automated free model ranking)
- Configuration via `models.config.json`
- TypeScript implementation
- System prompts for filler removal and clarity

**Read `index.md` before implementing OpenRouter calls.**

## Model Scanner System

voice-ingest includes automated free model discovery:

### Files
- `src/lib/model-scanner.ts` - Scanner logic
- `models.config.json` - Editable config (preferred, blocked, cache)

### How It Works
1. Fetches all models from OpenRouter API
2. Filters to free models (`pricing.prompt === "0"`)
3. Scores by: params, context length, provider quality
4. Respects manual overrides from config

### Configuration
```json
{
  "preferred": ["x-ai/grok-4:free"],
  "blocked": [],
  "lastScan": null
}
```

### When You Discover a Powerful Free Model
1. Add to `models.config.json` → `preferred` array
2. It appears first in the model dropdown

## Quick Reference

### Endpoint
```
POST https://openrouter.ai/api/v1/chat/completions
```

### Headers
```
Authorization: Bearer {OPENROUTER_API_KEY}
Content-Type: application/json
```

### Request Body
```json
{
  "model": "meta-llama/llama-3.1-8b-instruct:free",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ]
}
```

### Scanner Usage
```typescript
import { scanFreeModels, getRankedModels } from '@/lib/model-scanner';

// Get ranked free models
const models = await scanFreeModels();
```

## Critical Rules

1. **FREE MODELS ONLY** - User has no API budget
2. **Use model scanner** - Don't hardcode model IDs
3. **Check `models.config.json`** - For preferred/blocked lists
4. **OpenAI-compatible** - Same format as OpenAI chat completions
