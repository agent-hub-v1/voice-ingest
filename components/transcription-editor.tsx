"use client"

import React, { useState, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Loader2, Download, Trash2, ArrowLeft } from "lucide-react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { toast } from "sonner"

import { FrontmatterForm, type FormData } from "./frontmatter-form"
import { SpeakerMapper } from "./speaker-mapper"
import { AITools } from "./ai-tools"
import { ExportCard } from "./export-card"
import { LastApiCall } from "./last-api-call"
import { FileInfoCard } from "./file-info-card"
import { ModelSelector, type Model } from "./model-selector"
import { TranscriptPanel } from "./transcript-panel"
import { generateMarkdown, generateFilename } from "@/lib/markdown"
import { useTranscription, type TranscriptionData } from "@/hooks/use-transcription"
import type { Utterance } from "@/lib/assemblyai"

interface FileEntry {
  url: string
  pathname: string
  size: number
  uploadedAt: string
  type?: 'audio' | 'transcript'
}

interface TranscriptionEditorProps {
  file: FileEntry
  onBack: () => void
  onDelete: () => void
}

export function TranscriptionEditor({
  file,
  onBack,
  onDelete,
}: TranscriptionEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [hasSelection, setHasSelection] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewContent, setPreviewContent] = useState("")

  // Model selection state
  const [models, setModels] = useState<Model[]>([])
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [lastCost, setLastCost] = useState<number | null>(null)
  const [lastApiCall, setLastApiCall] = useState<{
    usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
    cost: number | null
    modelName: string
    pricing?: { prompt: number; completion: number } | null
  } | null>(null)

  // Use transcription hook for core state management
  const {
    status,
    error,
    transcription,
    editedText,
    setEditedText,
    speakers,
    speakerNames,
    setSpeakerNames,
    formData,
    setFormData,
    displayName,
    setDisplayName,
    defaultDisplayName,
    reviewMode,
    setReviewMode,
    history,
    historyIndex,
    triggerSuggest,
    setTriggerSuggest,
    isTranscriptFile,
    saveStatus,
    isLoaded,
    transcribeFile,
    loadTranscriptFile,
    pushHistory,
    handleUndo,
    handleRedo,
    handleApplySpeakerNames,
    handleRemoveLabels,
    handleDedash,
    handleFindReplace,
    handleAcceptChanges,
    handleRevertChanges,
  } = useTranscription({ file })

  // Handle AI processing
  async function handleProcess(mode: "clean" | "improve" | "enhance", target: "all" | "selection") {
    let textToProcess = editedText
    let selectionStart = 0
    let selectionEnd = editedText.length

    if (target === "selection") {
      if (!textareaRef.current) return
      selectionStart = textareaRef.current.selectionStart
      selectionEnd = textareaRef.current.selectionEnd
      if (selectionStart === selectionEnd) return
      textToProcess = editedText.slice(selectionStart, selectionEnd)
    }

    const model = selectedModel
    const selectedModelData = models.find(m => m.id === selectedModel)
    const modelName = selectedModelData?.name || model
    const pricing = selectedModelData?.pricing

    const inputChars = textToProcess.length
    toast.info(`API Request: ${mode}`, {
      description: `Model: ${modelName} | Input: ${inputChars.toLocaleString()} chars`,
    })

    const startTime = Date.now()

    try {
      setIsProcessing(true)

      const apiMode = mode === "clean" ? "filler" : mode

      const res = await fetch("/api/clean-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToProcess,
          mode: apiMode,
          model,
          pricing,
          splitParagraphs: target === "all",
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Processing failed")
      }

      const data = await res.json()
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

      if (data.cost !== null && data.cost !== undefined) {
        setLastCost(data.cost)
      }

      if (data.usage) {
        setLastApiCall({
          usage: data.usage,
          cost: data.cost,
          modelName,
          pricing,
        })
      }

      const usage = data.usage
      let description = `Time: ${elapsed}s`
      if (usage) {
        description += ` | Tokens: ${usage.prompt_tokens.toLocaleString()} in / ${usage.completion_tokens.toLocaleString()} out`
      }
      if (data.cost !== null) {
        const costDisplay = data.cost < 0.01
          ? `1/${Math.round(0.01 / data.cost)} cent`
          : `${(data.cost * 100).toFixed(2)}¢`
        description += ` | Cost: ${costDisplay}`
      }
      toast.success(`Response: ${mode}`, { description })

      let newText: string
      let replacementStart: number | undefined
      let replacementEnd: number | undefined

      if (target === "selection") {
        newText = editedText.slice(0, selectionStart) + data.result + editedText.slice(selectionEnd)
        replacementStart = selectionStart
        replacementEnd = selectionStart + data.result.length
      } else {
        newText = data.result
      }

      setReviewMode({
        before: editedText,
        after: newText,
        isEntireTranscript: target === "all",
        replacementStart,
        replacementEnd,
      })
    } catch (err) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
      toast.error(`Failed: ${mode}`, {
        description: `${err instanceof Error ? err.message : "Processing failed"} (${elapsed}s)`,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  function generatePreview() {
    if (!transcription) return

    const lines = editedText.split("\n\n").filter(line => line.trim())
    const parsedUtterances: Utterance[] = lines.map((line, i) => {
      const match = line.match(/^\*\*(.+?)\*\*:\s*(.+)$/s) ||
        line.match(/^\[Speaker (.+?)\]:\s*(.+)$/s)
      return {
        speaker: match ? match[1] : `Speaker ${i}`,
        text: match ? match[2] : line,
        start: 0,
        end: 0,
        confidence: transcription.confidence || 0,
      }
    })

    const isMonologue = speakers.length <= 1
    const markdown = generateMarkdown(
      {
        date: formData.date,
        participants: formData.participants.length > 0
          ? formData.participants
          : Object.values(speakerNames).filter(n => n).map(name => ({
              name,
              contact_id: null,
            })),
        subject: formData.subject || "Untitled Recording",
        summary: formData.summary || "No summary provided.",
        tags: formData.tags,
        sourceAudio: isTranscriptFile ? undefined : file.pathname.replace("audio/", ""),
        transcriptionConfidence: transcription.confidence || 0,
        processedDate: new Date().toISOString(),
      },
      parsedUtterances,
      speakerNames,
      isMonologue
    )

    setPreviewContent(markdown)
    setShowPreview(true)
  }

  function getExportData(): { content: string; filename: string } | null {
    if (!transcription) return null

    const lines = editedText.split("\n\n").filter(line => line.trim())
    const parsedUtterances: Utterance[] = lines.map((line, i) => {
      const match = line.match(/^\*\*(.+?)\*\*:\s*(.+)$/s) ||
        line.match(/^\[Speaker (.+?)\]:\s*(.+)$/s)
      return {
        speaker: match ? match[1] : `Speaker ${i}`,
        text: match ? match[2] : line,
        start: 0,
        end: 0,
        confidence: transcription.confidence || 0,
      }
    })

    const isMonologue = speakers.length <= 1
    const metadata = {
      date: formData.date,
      participants: formData.participants.length > 0
        ? formData.participants
        : Object.values(speakerNames).filter(n => n).map(name => ({
            name,
            contact_id: null,
          })),
      subject: formData.subject || "Untitled Recording",
      summary: formData.summary || "No summary provided.",
      tags: formData.tags,
      sourceAudio: isTranscriptFile ? undefined : file.pathname.replace("audio/", ""),
      transcriptionConfidence: transcription.confidence || 0,
      processedDate: new Date().toISOString(),
    }

    const markdown = generateMarkdown(metadata, parsedUtterances, speakerNames, isMonologue)
    const filename = generateFilename(metadata)

    return { content: markdown, filename }
  }

  const handleModelsLoaded = useCallback((loadedModels: Model[]) => {
    setModels(loadedModels)
  }, [])

  const handleModelChange = useCallback((model: string) => {
    setSelectedModel(model)
  }, [])

  // Loading state
  if (!isLoaded || status === "idle") {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-96">
          <CardContent className="py-12 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg font-medium">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Transcribing state
  if (status === "transcribing") {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-96">
          <CardContent className="py-12 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg font-medium">
              {isTranscriptFile ? "Loading transcript..." : "Transcribing audio..."}
            </p>
            {!isTranscriptFile && (
              <p className="text-sm text-muted-foreground">
                This may take a few minutes
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (status === "error") {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-96">
          <CardContent className="py-12 text-center">
            <p className="text-lg font-medium text-destructive">
              {isTranscriptFile ? "Failed to Load" : "Transcription Failed"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <div className="mt-6 flex gap-4 justify-center">
              <Button onClick={onBack} variant="outline" className="cursor-pointer">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={isTranscriptFile ? loadTranscriptFile : transcribeFile} className="cursor-pointer">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Controls */}
        <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
          <div className="h-full overflow-y-auto p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button onClick={onBack} variant="ghost" className="cursor-pointer">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Files
                </Button>
                <Button
                  onClick={onDelete}
                  variant="ghost"
                  className="cursor-pointer text-destructive hover:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete {isTranscriptFile ? "Text" : "Audio"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FileInfoCard
                  displayName={displayName}
                  onDisplayNameChange={setDisplayName}
                  defaultDisplayName={defaultDisplayName}
                  isTranscriptFile={isTranscriptFile}
                  confidence={transcription?.confidence}
                  saveStatus={saveStatus}
                />

                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={handleModelChange}
                  models={models}
                  onModelsLoaded={handleModelsLoaded}
                  lastCost={lastCost}
                />
              </div>

              <FrontmatterForm
                formData={formData}
                onFormChange={setFormData}
                transcript={editedText}
                selectedModel={selectedModel}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                isMonologue={speakers.length <= 1}
                triggerSuggest={triggerSuggest}
                onSuggestComplete={() => setTriggerSuggest(false)}
              />

              <SpeakerMapper
                speakers={speakers}
                speakerNames={speakerNames}
                onUpdateSpeakerNames={setSpeakerNames}
                onApplySpeakerNames={handleApplySpeakerNames}
                onRemoveLabels={handleRemoveLabels}
              />

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <AITools
                  onProcess={handleProcess}
                  hasSelection={hasSelection}
                  isProcessing={isProcessing}
                />
                <ExportCard
                  onPreview={generatePreview}
                  getExportData={getExportData}
                />
              </div>

              {lastApiCall && (
                <LastApiCall
                  usage={lastApiCall.usage}
                  cost={lastApiCall.cost}
                  modelName={lastApiCall.modelName}
                  pricing={lastApiCall.pricing}
                />
              )}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Transcript Editor */}
        <ResizablePanel defaultSize={60} minSize={40}>
          <div className="h-full p-4">
            <TranscriptPanel
              editedText={editedText}
              onTextChange={setEditedText}
              reviewMode={reviewMode}
              onAcceptChanges={handleAcceptChanges}
              onRevertChanges={handleRevertChanges}
              onDedash={handleDedash}
              onFindReplace={handleFindReplace}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              isProcessing={isProcessing}
              onSelectionChange={setHasSelection}
              textareaRef={textareaRef}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-6xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Markdown Preview</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <pre className="whitespace-pre-wrap font-mono text-sm p-4 bg-muted rounded-lg">
              {previewContent}
            </pre>
          </ScrollArea>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              className="cursor-pointer"
            >
              Close
            </Button>
            <Button
              onClick={async () => {
                const data = getExportData()
                if (!data) return
                try {
                  const res = await fetch("/api/export", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      content: data.content,
                      filename: data.filename,
                      exportPath: "~/symbiont/docs/ingest",
                    }),
                  })
                  if (!res.ok) throw new Error("Export failed")
                  setShowPreview(false)
                } catch {
                  alert("Export failed")
                }
              }}
              className="cursor-pointer"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
