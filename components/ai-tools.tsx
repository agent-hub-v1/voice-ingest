"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, Wand2 } from "lucide-react"

interface AIToolsProps {
  onCleanText: (mode: "filler" | "clarity", model: string) => Promise<void>
  onCleanSelection: (mode: "filler" | "clarity", model: string) => Promise<void>
  hasSelection: boolean
  isProcessing: boolean
  selectedModel: string
}

export function AITools({
  onCleanText,
  onCleanSelection,
  hasSelection,
  isProcessing,
  selectedModel,
}: AIToolsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4" />
          AI Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={() => onCleanText("filler", selectedModel)}
          disabled={isProcessing || !selectedModel}
          className="w-full cursor-pointer"
          variant="outline"
          size="sm"
        >
          {isProcessing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Clean Transcript
        </Button>

        <Button
          onClick={() => onCleanSelection("clarity", selectedModel)}
          disabled={isProcessing || !selectedModel || !hasSelection}
          className="w-full cursor-pointer"
          variant="outline"
          size="sm"
        >
          {isProcessing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Clean Selection
        </Button>
        {!hasSelection && (
          <p className="text-xs text-muted-foreground">
            Select text to clean selection
          </p>
        )}
      </CardContent>
    </Card>
  )
}
