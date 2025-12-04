"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles, Wand2, FileText, TextSelect } from "lucide-react"

interface AIToolsProps {
  onCleanText: (mode: "filler" | "improve", model: string, splitParagraphs: boolean) => Promise<void>
  onCleanSelection: (mode: "filler" | "improve", model: string) => Promise<void>
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
  const [isImproveMode, setIsImproveMode] = useState(false)
  const mode = isImproveMode ? "improve" : "filler"

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4" />
            AI Tools
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="mode-toggle" className={`text-xs ${!isImproveMode ? 'text-foreground' : 'text-muted-foreground'}`}>
              Clean
            </Label>
            <Switch
              id="mode-toggle"
              checked={isImproveMode}
              onCheckedChange={setIsImproveMode}
              className="cursor-pointer"
            />
            <Label htmlFor="mode-toggle" className={`text-xs ${isImproveMode ? 'text-foreground' : 'text-muted-foreground'}`}>
              Improve
            </Label>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {isImproveMode
            ? "Improve clarity while preserving all details (up to 20% shorter)"
            : "Remove verbal fillers, fix grammar (word-for-word)"}
        </p>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button
          onClick={() => onCleanText(mode, selectedModel, true)}
          disabled={isProcessing || !selectedModel}
          className="flex-1 cursor-pointer"
          variant="outline"
          size="sm"
        >
          {isProcessing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          Entire Transcript
        </Button>

        <Button
          onClick={() => onCleanSelection(mode, selectedModel)}
          disabled={isProcessing || !selectedModel || !hasSelection}
          className="flex-1 cursor-pointer"
          variant="outline"
          size="sm"
          title={!hasSelection ? "Select text first" : undefined}
        >
          {isProcessing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <TextSelect className="mr-2 h-4 w-4" />
          )}
          Selection Only
        </Button>
      </CardContent>
    </Card>
  )
}
