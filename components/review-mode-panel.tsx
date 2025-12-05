"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { toast } from "sonner"
import { findDiffRanges } from "@/lib/diff"

export interface ReviewMode {
  before: string
  after: string
  isEntireTranscript?: boolean
  replacementStart?: number
  replacementEnd?: number
  replacementRanges?: Array<{ start: number; end: number }>
  originalRanges?: Array<{ start: number; end: number }>
}

interface ReviewModePanelProps {
  reviewMode: ReviewMode
  onAccept: () => void
  onRevert: () => void
}

function HighlightedText({
  text,
  ranges,
  className,
}: {
  text: string
  ranges: Array<{ start: number; end: number }>
  className: string
}) {
  if (ranges.length === 0) {
    return <>{text}</>
  }

  const parts: React.ReactNode[] = []
  let lastEnd = 0

  ranges.forEach((range, i) => {
    if (range.start > lastEnd) {
      parts.push(text.slice(lastEnd, range.start))
    }
    parts.push(
      <span key={i} className={className}>
        {text.slice(range.start, range.end)}
      </span>
    )
    lastEnd = range.end
  })

  if (lastEnd < text.length) {
    parts.push(text.slice(lastEnd))
  }

  return <>{parts}</>
}

export function ReviewModePanel({
  reviewMode,
  onAccept,
  onRevert,
}: ReviewModePanelProps) {
  // Determine highlights for the "After" pane
  const getAfterHighlights = (): Array<{ start: number; end: number }> => {
    if (reviewMode.replacementRanges && reviewMode.replacementRanges.length > 0) {
      return reviewMode.replacementRanges
    }
    if (reviewMode.replacementStart !== undefined && reviewMode.replacementEnd !== undefined) {
      return [{ start: reviewMode.replacementStart, end: reviewMode.replacementEnd }]
    }
    if (reviewMode.originalRanges && reviewMode.originalRanges.length > 0) {
      // Dedash mode - use diff to find changes in after
      return findDiffRanges(reviewMode.before, reviewMode.after)
    }
    return []
  }

  const afterHighlights = getAfterHighlights()

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
        {/* Before pane */}
        <div className="flex flex-col min-h-0">
          <p className="text-xs font-medium text-muted-foreground mb-1">Before</p>
          <div className="relative flex-1 min-h-0">
            <div className="absolute inset-0 overflow-auto rounded-md border bg-muted/30 p-3">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {reviewMode.originalRanges && reviewMode.originalRanges.length > 0 ? (
                  <HighlightedText
                    text={reviewMode.before}
                    ranges={reviewMode.originalRanges}
                    className="text-red-600 dark:text-red-400 bg-red-500/20 rounded px-0.5"
                  />
                ) : (
                  reviewMode.before
                )}
              </pre>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(reviewMode.before)
                toast.success("Copied to clipboard")
              }}
              className="absolute bottom-2 right-2 p-1.5 rounded bg-background/80 border hover:bg-muted cursor-pointer z-10"
              title="Copy to clipboard"
            >
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* After pane */}
        <div className="flex flex-col min-h-0">
          <p className="text-xs font-medium text-muted-foreground mb-1">After</p>
          <div className="relative flex-1 min-h-0">
            <div className="absolute inset-0 overflow-auto rounded-md border border-green-500/30 bg-green-500/5 p-3">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {afterHighlights.length > 0 ? (
                  <HighlightedText
                    text={reviewMode.after}
                    ranges={afterHighlights}
                    className="text-green-600 dark:text-green-400 bg-green-500/20 rounded px-0.5"
                  />
                ) : (
                  reviewMode.after
                )}
              </pre>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(reviewMode.after)
                toast.success("Copied to clipboard")
              }}
              className="absolute bottom-2 right-2 p-1.5 rounded bg-background/80 border hover:bg-muted cursor-pointer z-10"
              title="Copy to clipboard"
            >
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={onRevert}
          className="cursor-pointer"
        >
          Revert
        </Button>
        <Button
          onClick={onAccept}
          className="cursor-pointer"
        >
          Accept Changes
        </Button>
      </div>
    </div>
  )
}
