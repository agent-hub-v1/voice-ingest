"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Loader2, Sparkles, FileText, TextSelect } from "lucide-react"

type Mode = "clean" | "improve" | "enhance"

interface AIToolsProps {
  onProcess: (mode: Mode, target: "all" | "selection") => Promise<void>
  hasSelection: boolean
  isProcessing: boolean
}

const MODE_INFO: Record<Mode, { label: string; description: string }> = {
  clean: {
    label: "Clean",
    description: "Remove fillers, fix grammar (word-for-word)",
  },
  improve: {
    label: "Improve",
    description: "Improve clarity, preserve all details",
  },
  enhance: {
    label: "Enhance",
    description: "Expand vague prompts with details & structure",
  },
}

export function AITools({
  onProcess,
  hasSelection,
  isProcessing,
}: AIToolsProps) {
  const [mode, setMode] = useState<Mode>("clean")

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4" />
          AI Tools
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          {MODE_INFO[mode].description}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(value) => value && setMode(value as Mode)}
          className="w-full"
          variant="outline"
        >
          {(Object.keys(MODE_INFO) as Mode[]).map((m) => (
            <ToggleGroupItem
              key={m}
              value={m}
              className="flex-1 cursor-pointer text-xs"
            >
              {MODE_INFO[m].label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="flex gap-2">
          <Button
            onClick={() => onProcess(mode, "all")}
            disabled={isProcessing}
            className="flex-1 cursor-pointer"
            variant="outline"
            size="sm"
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            All Text
          </Button>

          <Button
            onClick={() => onProcess(mode, "selection")}
            disabled={isProcessing || !hasSelection}
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
        </div>
      </CardContent>
    </Card>
  )
}
