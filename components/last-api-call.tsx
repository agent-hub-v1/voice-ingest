"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity } from "lucide-react"

interface LastApiCallProps {
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  cost: number | null
  modelName: string
  pricing?: { prompt: number; completion: number } | null
}

function formatCost(cost: number | null): string {
  if (cost === null || cost === 0) return "0 cents"
  const cents = cost * 100
  if (cents >= 100) {
    // Over $1, show as dollars
    return `$${(cents / 100).toFixed(2)}`
  }
  if (cents >= 0.5) {
    // Over half a cent, show decimal cents
    return `${cents.toFixed(2)} cents`
  }
  // Under half a cent, show as fraction
  const fraction = Math.round(1 / cents)
  return `1/${fraction} cent`
}

export function LastApiCall({ usage, cost, modelName, pricing }: LastApiCallProps) {
  // Calculate estimated per-token costs from pricing (for display only)
  const inputCost = pricing ? usage.prompt_tokens * pricing.prompt : null
  const outputCost = pricing ? usage.completion_tokens * pricing.completion : null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" />
          Last API Call
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Model:</span>
          <Badge variant="outline" className="font-normal text-muted-foreground">
            {modelName}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Input</span>
            <div className="flex items-center gap-2">
              <span>{usage.prompt_tokens.toLocaleString()} tokens</span>
              {inputCost !== null && (
                <Badge variant="secondary" className="font-mono text-xs">
                  {formatCost(inputCost)}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Output</span>
            <div className="flex items-center gap-2">
              <span>{usage.completion_tokens.toLocaleString()} tokens</span>
              {outputCost !== null && (
                <Badge variant="secondary" className="font-mono text-xs">
                  {formatCost(outputCost)}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <span className="font-medium">Total</span>
            <div className="flex items-center gap-2">
              <span>{usage.total_tokens.toLocaleString()} tokens</span>
              <Badge variant="default" className="font-mono text-xs">
                {formatCost(cost)}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
