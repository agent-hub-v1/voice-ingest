"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mic, FileText, Check, Save, Pencil } from "lucide-react"

interface FileInfoCardProps {
  displayName: string
  onDisplayNameChange: (name: string) => void
  defaultDisplayName: string
  isTranscriptFile: boolean
  confidence?: number
  saveStatus: "idle" | "saving" | "saved"
}

export function FileInfoCard({
  displayName,
  onDisplayNameChange,
  defaultDisplayName,
  isTranscriptFile,
  confidence,
  saveStatus,
}: FileInfoCardProps) {
  const [isEditingName, setIsEditingName] = useState(false)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {isTranscriptFile ? (
            <FileText className="h-4 w-4 text-blue-500 shrink-0" />
          ) : (
            <Mic className="h-4 w-4 shrink-0" />
          )}
          {isEditingName ? (
            <Input
              value={displayName}
              onChange={e => onDisplayNameChange(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={e => {
                if (e.key === "Enter") setIsEditingName(false)
                if (e.key === "Escape") {
                  onDisplayNameChange(defaultDisplayName)
                  setIsEditingName(false)
                }
              }}
              className="h-7 text-base font-semibold"
              autoFocus
            />
          ) : (
            <span
              className="cursor-pointer hover:text-primary truncate"
              onClick={() => setIsEditingName(true)}
              title="Click to edit"
            >
              {displayName}
            </span>
          )}
          {!isEditingName && (
            <Pencil
              className="h-3 w-3 text-muted-foreground hover:text-primary cursor-pointer shrink-0"
              onClick={() => setIsEditingName(true)}
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {!isTranscriptFile && confidence !== undefined && (
            <p className="text-sm text-muted-foreground">
              Confidence: {(confidence * 100).toFixed(1)}%
            </p>
          )}
          {isTranscriptFile && (
            <p className="text-sm text-muted-foreground text-blue-600">
              Pre-transcribed text
            </p>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {saveStatus === "saving" && (
              <>
                <Save className="h-3 w-3 animate-pulse" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check className="h-3 w-3 text-green-500" />
                <span className="text-green-500">Draft saved</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
