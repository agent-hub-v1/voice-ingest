"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Model {
  id: string
  name: string
  pricing?: { prompt: number; completion: number }
}

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (model: string) => void
  models: Model[]
  onModelsLoaded: (models: Model[]) => void
  lastCost: number | null
}

export function ModelSelector({
  selectedModel,
  onModelChange,
  models,
  onModelsLoaded,
  lastCost,
}: ModelSelectorProps) {
  const [loadingModels, setLoadingModels] = useState(true)
  const [modelTier, setModelTier] = useState<'free' | 'paid'>('free')

  // Load available models based on tier
  useEffect(() => {
    setLoadingModels(true)
    fetch(`/api/models?tier=${modelTier}`)
      .then(res => res.json())
      .then(data => {
        const modelList = data.models || []
        onModelsLoaded(modelList)
        if (modelList.length > 0) {
          onModelChange(modelList[0].id)
        }
      })
      .catch(() => onModelsLoaded([]))
      .finally(() => setLoadingModels(false))
  }, [modelTier, onModelsLoaded, onModelChange])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            AI Model
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-xs", modelTier === 'free' ? "text-foreground" : "text-muted-foreground")}>Free</span>
            <Switch
              checked={modelTier === 'paid'}
              onCheckedChange={(checked) => setModelTier(checked ? 'paid' : 'free')}
            />
            <span className={cn("text-xs", modelTier === 'paid' ? "text-foreground" : "text-muted-foreground")}>Paid</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loadingModels ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : (
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {models.map(model => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {modelTier === 'paid' && selectedModel && (() => {
          const model = models.find(m => m.id === selectedModel)
          if (!model?.pricing) return null
          const formatPrice = (price: number) => `$${(price * 1000000).toFixed(2)}`
          return (
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>Input: {formatPrice(model.pricing.prompt)}/M tokens</p>
              <p>Output: {formatPrice(model.pricing.completion)}/M tokens</p>
            </div>
          )
        })()}
        {lastCost !== null && modelTier === 'paid' && (
          <p className="text-xs text-muted-foreground">
            Last call: {(() => {
              const cents = lastCost * 100
              if (cents >= 100) return `$${(cents / 100).toFixed(2)}`
              if (cents >= 0.5) return `${cents.toFixed(2)} cents`
              return `1/${Math.round(1 / cents)} cent`
            })()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
