"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Whole Transcript</Label>
          <Button
            onClick={() => onCleanText("filler", selectedModel)}
            disabled={isProcessing || !selectedModel}
            className="w-full cursor-pointer"
            variant="outline"
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Remove Filler Words
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Selected Text</Label>
          <Button
            onClick={() => onCleanSelection("clarity", selectedModel)}
            disabled={isProcessing || !selectedModel || !hasSelection}
            className="w-full cursor-pointer"
            variant="outline"
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Clean Selected Text
          </Button>
          {!hasSelection && (
            <p className="text-xs text-muted-foreground">
              Select text in the editor to enable
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
