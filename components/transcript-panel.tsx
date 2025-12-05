"use client"

import React, { useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Undo2, Redo2, Copy, Replace, Minus } from "lucide-react"
import { toast } from "sonner"
import { ReviewModePanel, type ReviewMode } from "./review-mode-panel"

interface TranscriptPanelProps {
  editedText: string
  onTextChange: (text: string) => void
  reviewMode: ReviewMode | null
  onAcceptChanges: () => void
  onRevertChanges: () => void
  onDedash: () => void
  onFindReplace: (findText: string, replaceText: string) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  isProcessing: boolean
  onSelectionChange: (hasSelection: boolean) => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

export function TranscriptPanel({
  editedText,
  onTextChange,
  reviewMode,
  onAcceptChanges,
  onRevertChanges,
  onDedash,
  onFindReplace,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isProcessing,
  onSelectionChange,
  textareaRef,
}: TranscriptPanelProps) {
  const [showFindReplace, setShowFindReplace] = useState(false)
  const [findText, setFindText] = useState("")
  const [replaceText, setReplaceText] = useState("")

  function handleTextSelection() {
    if (textareaRef.current) {
      const { selectionStart, selectionEnd } = textareaRef.current
      onSelectionChange(selectionStart !== selectionEnd)
    }
  }

  function handleFindReplaceSubmit() {
    if (!findText) return
    onFindReplace(findText, replaceText)
    setShowFindReplace(false)
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Transcript</CardTitle>
          <div className="flex items-center gap-1">
            {showFindReplace ? (
              <div className="flex items-center gap-2">
                <Input
                  value={findText}
                  onChange={e => setFindText(e.target.value)}
                  placeholder="Find"
                  className="h-8 w-28 text-sm"
                  onKeyDown={e => e.key === "Enter" && handleFindReplaceSubmit()}
                />
                <Input
                  value={replaceText}
                  onChange={e => setReplaceText(e.target.value)}
                  placeholder="Replace"
                  className="h-8 w-28 text-sm"
                  onKeyDown={e => e.key === "Enter" && handleFindReplaceSubmit()}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleFindReplaceSubmit}
                  disabled={!findText}
                  className="h-8 cursor-pointer"
                >
                  Replace All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowFindReplace(false)
                    setFindText("")
                    setReplaceText("")
                  }}
                  className="h-8 cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDedash}
                  disabled={isProcessing}
                  className="h-8 w-8 cursor-pointer"
                  title="De-dash: Replace em-dashes and double-dashes with commas"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFindReplace(true)}
                  className="h-8 w-8 cursor-pointer"
                  title="Find and Replace"
                >
                  <Replace className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-8 w-8 cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-8 w-8 cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-60px)]">
        {reviewMode ? (
          <ReviewModePanel
            reviewMode={reviewMode}
            onAccept={onAcceptChanges}
            onRevert={onRevertChanges}
          />
        ) : (
          <div className="relative h-full">
            {showFindReplace && findText ? (
              // Show highlighted preview when searching
              <div className="h-full overflow-auto rounded-md border bg-background p-3 font-mono text-sm whitespace-pre-wrap">
                {(() => {
                  const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
                  const parts: React.ReactNode[] = []
                  let lastIndex = 0
                  let match
                  let matchIndex = 0
                  while ((match = regex.exec(editedText)) !== null) {
                    if (match.index > lastIndex) {
                      parts.push(editedText.slice(lastIndex, match.index))
                    }
                    parts.push(
                      <span key={matchIndex++} className="text-red-600 dark:text-red-400 bg-red-500/20 rounded px-0.5">
                        {match[0]}
                      </span>
                    )
                    lastIndex = regex.lastIndex
                  }
                  if (lastIndex < editedText.length) {
                    parts.push(editedText.slice(lastIndex))
                  }
                  return parts.length > 0 ? parts : editedText
                })()}
              </div>
            ) : (
              <Textarea
                ref={textareaRef}
                value={editedText}
                onChange={e => onTextChange(e.target.value)}
                onSelect={handleTextSelection}
                onKeyUp={handleTextSelection}
                onMouseUp={handleTextSelection}
                className="h-full resize-none font-mono text-sm"
                placeholder="Transcript will appear here..."
              />
            )}
            <button
              onClick={() => {
                navigator.clipboard.writeText(editedText)
                toast.success("Copied to clipboard")
              }}
              className="absolute bottom-3 right-3 p-1.5 rounded bg-background/80 border hover:bg-muted cursor-pointer"
              title="Copy to clipboard"
            >
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
