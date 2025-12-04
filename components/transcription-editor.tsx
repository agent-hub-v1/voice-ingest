"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Loader2, Download, Eye, Trash2, ArrowLeft, Mic, Check, Save, Undo2, Redo2, Cpu, FileText } from "lucide-react"

import { FrontmatterForm, type FormData } from "./frontmatter-form"
import { SpeakerMapper } from "./speaker-mapper"
import { AITools } from "./ai-tools"
import { generateMarkdown, generateFilename } from "@/lib/markdown"
import { useDraft } from "@/lib/use-draft"
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

interface TranscriptionData {
  text: string
  utterances: Utterance[]
  confidence: number
}

export function TranscriptionEditor({
  file,
  onBack,
  onDelete,
}: TranscriptionEditorProps) {
  const [status, setStatus] = useState<"idle" | "transcribing" | "ready" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [transcription, setTranscription] = useState<TranscriptionData | null>(null)
  const [editedText, setEditedText] = useState("")
  const [speakers, setSpeakers] = useState<string[]>([])
  const [speakerNames, setSpeakerNames] = useState<Record<string, string>>({})
  const [hasSelection, setHasSelection] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewContent, setPreviewContent] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Undo/redo history for major operations (AI cleaning, speaker mapping)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Review mode for AI cleaning results
  const [reviewMode, setReviewMode] = useState<{
    before: string
    after: string
  } | null>(null)

  // Model selection
  interface Model {
    id: string
    name: string
  }
  const [models, setModels] = useState<Model[]>([])
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [loadingModels, setLoadingModels] = useState(true)

  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().slice(0, 19),
    subject: "",
    summary: "",
    tags: [],
    participants: [],
  })

  // Draft persistence
  const { draft, saveDraft, clearDraft, saveStatus, isLoaded } = useDraft(file.pathname)

  // Load available models
  useEffect(() => {
    fetch("/api/models")
      .then(res => res.json())
      .then(data => {
        const modelList = data.models || []
        setModels(modelList)
        if (modelList.length > 0) {
          setSelectedModel(modelList[0].id)
        }
      })
      .catch(() => setModels([]))
      .finally(() => setLoadingModels(false))
  }, [])

  // Load from draft, load transcript file, or start transcription
  useEffect(() => {
    if (!isLoaded) return

    if (draft?.transcription) {
      // Restore from draft
      setTranscription(draft.transcription)
      setEditedText(draft.editedText)
      setSpeakerNames(draft.speakerNames)
      setFormData(draft.formData)

      // Extract speakers from transcription
      const uniqueSpeakers = [...new Set(draft.transcription.utterances.map(u => u.speaker))]
      setSpeakers(uniqueSpeakers)

      setStatus("ready")
    } else if (file.type === 'transcript' || file.pathname.startsWith('transcripts/')) {
      // Load pre-transcribed JSON directly
      loadTranscriptFile()
    } else {
      // No draft, start fresh transcription
      transcribeFile()
    }
  }, [file.pathname, isLoaded])

  // Auto-save when state changes
  useEffect(() => {
    if (status !== "ready" || !transcription) return

    saveDraft({
      transcription,
      editedText,
      speakerNames,
      formData,
      savedAt: new Date().toISOString(),
    })
  }, [transcription, editedText, speakerNames, formData, status, saveDraft])

  // Push current state to history before a major operation
  function pushHistory() {
    // Don't add duplicate entries
    if (history.length > 0 && history[history.length - 1] === editedText) {
      return
    }
    const newHistory = [...history, editedText].slice(-20)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  function handleUndo() {
    if (history.length > 0 && historyIndex >= 0) {
      // If at the end and current text differs from last history, save current first
      if (historyIndex === history.length - 1 && editedText !== history[historyIndex]) {
        const newHistory = [...history, editedText].slice(-20)
        setHistory(newHistory)
        setHistoryIndex(newHistory.length - 2)
        setEditedText(history[historyIndex])
      } else if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setEditedText(history[newIndex])
      }
    }
  }

  function handleRedo() {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setEditedText(history[newIndex])
    }
  }

  async function transcribeFile() {
    try {
      setStatus("transcribing")
      setError(null)

      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blobUrl: file.url }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Transcription failed")
      }

      const data: TranscriptionData = await res.json()
      setTranscription(data)

      // Format text with speaker labels
      const formattedText = data.utterances
        .map(u => `[Speaker ${u.speaker}]: ${u.text}`)
        .join("\n\n")
      setEditedText(formattedText)

      // Extract unique speakers
      const uniqueSpeakers = [...new Set(data.utterances.map(u => u.speaker))]
      setSpeakers(uniqueSpeakers)

      // Initialize speaker names
      const initialNames: Record<string, string> = {}
      uniqueSpeakers.forEach(s => {
        initialNames[s] = ""
      })
      setSpeakerNames(initialNames)

      setStatus("ready")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transcription failed")
      setStatus("error")
    }
  }

  async function loadTranscriptFile() {
    try {
      setStatus("transcribing")
      setError(null)

      // Fetch the JSON file directly from blob storage
      const res = await fetch(file.url)
      if (!res.ok) {
        throw new Error("Failed to load transcript file")
      }

      const data = await res.json()

      // Convert pre-transcribed format to TranscriptionData
      const transcriptionData: TranscriptionData = {
        text: data.text || "",
        utterances: data.utterances || [{ speaker: "A", text: data.text || "", start: 0, end: 0, confidence: 1.0 }],
        confidence: data.confidence || 1.0,
      }

      setTranscription(transcriptionData)

      // Format text with speaker labels (or just plain text for single speaker)
      const formattedText = transcriptionData.utterances
        .map(u => `[Speaker ${u.speaker}]: ${u.text}`)
        .join("\n\n")
      setEditedText(formattedText)

      // Extract unique speakers
      const uniqueSpeakers = [...new Set(transcriptionData.utterances.map(u => u.speaker))]
      setSpeakers(uniqueSpeakers)

      // Initialize speaker names
      const initialNames: Record<string, string> = {}
      uniqueSpeakers.forEach(s => {
        initialNames[s] = ""
      })
      setSpeakerNames(initialNames)

      setStatus("ready")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transcript")
      setStatus("error")
    }
  }

  function handleApplySpeakerNames() {
    pushHistory()
    let newText = editedText
    Object.entries(speakerNames).forEach(([speaker, name]) => {
      if (name) {
        const regex = new RegExp(`\\[Speaker ${speaker}\\]`, "g")
        newText = newText.replace(regex, `**${name}**`)
      }
    })
    setEditedText(newText)

    // Update participants based on speaker names
    const participants = Object.values(speakerNames)
      .filter(name => name)
      .map(name => ({ name, contact_id: null }))
    setFormData(prev => ({ ...prev, participants }))
  }

  function handleTextSelection() {
    if (textareaRef.current) {
      const { selectionStart, selectionEnd } = textareaRef.current
      setHasSelection(selectionStart !== selectionEnd)
    }
  }

  async function handleCleanText(mode: "filler" | "clarity", model: string) {
    try {
      setIsProcessing(true)
      const res = await fetch("/api/clean-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editedText, mode, model }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Text cleaning failed")
      }

      const data = await res.json()
      // Enter review mode instead of directly applying
      setReviewMode({
        before: editedText,
        after: data.result,
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : "Text cleaning failed")
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleCleanSelection(mode: "filler" | "clarity", model: string) {
    if (!textareaRef.current) return

    const { selectionStart, selectionEnd } = textareaRef.current
    if (selectionStart === selectionEnd) return

    const selectedText = editedText.slice(selectionStart, selectionEnd)

    try {
      setIsProcessing(true)
      const res = await fetch("/api/clean-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedText, mode, model }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Text cleaning failed")
      }

      const data = await res.json()
      const newText =
        editedText.slice(0, selectionStart) +
        data.result +
        editedText.slice(selectionEnd)
      // Enter review mode instead of directly applying
      setReviewMode({
        before: editedText,
        after: newText,
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : "Text cleaning failed")
    } finally {
      setIsProcessing(false)
    }
  }

  function handleAcceptChanges() {
    if (!reviewMode) return
    pushHistory()
    setEditedText(reviewMode.after)
    setReviewMode(null)
  }

  function handleRevertChanges() {
    setReviewMode(null)
  }

  function generatePreview() {
    if (!transcription) return

    // Parse the edited text back into utterances format
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

    const isTranscript = file.type === 'transcript' || file.pathname.startsWith('transcripts/')
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
        sourceAudio: isTranscript ? undefined : file.pathname.replace("audio/", ""),
        transcriptionConfidence: transcription.confidence || 0,
        processedDate: new Date().toISOString(),
      },
      parsedUtterances,
      speakerNames
    )

    setPreviewContent(markdown)
    setShowPreview(true)
  }

  function handleExport() {
    if (!transcription) return

    // Parse the edited text back into utterances format
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

    const isTranscript = file.type === 'transcript' || file.pathname.startsWith('transcripts/')
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
      sourceAudio: isTranscript ? undefined : file.pathname.replace("audio/", ""),
      transcriptionConfidence: transcription.confidence || 0,
      processedDate: new Date().toISOString(),
    }

    const markdown = generateMarkdown(metadata, parsedUtterances, speakerNames)
    const filename = generateFilename(metadata)

    // Download file
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

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

  const isTranscriptFile = file.type === 'transcript' || file.pathname.startsWith('transcripts/')

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
      <div className="flex h-full">
        {/* Left Panel - Controls */}
        <div className="w-1/2 border-r border-border overflow-y-auto p-4">
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
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {isTranscriptFile ? (
                      <FileText className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                    {file.pathname.replace("audio/", "").replace("transcripts/", "").replace(".json", "")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    {!isTranscriptFile && (
                      <p className="text-sm text-muted-foreground">
                        Confidence: {((transcription?.confidence || 0) * 100).toFixed(1)}%
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

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Cpu className="h-4 w-4" />
                    AI Model
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingModels ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
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
                </CardContent>
              </Card>
            </div>

            <FrontmatterForm
              formData={formData}
              onFormChange={setFormData}
              transcript={editedText}
              selectedModel={selectedModel}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />

            <SpeakerMapper
              speakers={speakers}
              speakerNames={speakerNames}
              onUpdateSpeakerNames={setSpeakerNames}
              onApplySpeakerNames={handleApplySpeakerNames}
            />

            <AITools
              onCleanText={handleCleanText}
              onCleanSelection={handleCleanSelection}
              hasSelection={hasSelection}
              isProcessing={isProcessing}
              selectedModel={selectedModel}
            />

            <Separator />

            <div className="flex gap-2">
              <Button
                onClick={generatePreview}
                variant="outline"
                className="flex-1 cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button
                onClick={handleExport}
                className="flex-1 cursor-pointer"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Transcript Editor */}
        <div className="w-1/2 p-4">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Transcript</CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className="h-8 w-8 cursor-pointer"
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
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
                <div className="flex flex-col h-full gap-3">
                  <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
                    <div className="flex flex-col min-h-0">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Before</p>
                      <div className="flex-1 overflow-auto rounded-md border bg-muted/30 p-3">
                        <pre className="whitespace-pre-wrap font-mono text-sm">{reviewMode.before}</pre>
                      </div>
                    </div>
                    <div className="flex flex-col min-h-0">
                      <p className="text-xs font-medium text-muted-foreground mb-1">After</p>
                      <div className="flex-1 overflow-auto rounded-md border border-green-500/30 bg-green-500/5 p-3">
                        <pre className="whitespace-pre-wrap font-mono text-sm">{reviewMode.after}</pre>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={handleRevertChanges}
                      className="cursor-pointer"
                    >
                      Revert
                    </Button>
                    <Button
                      onClick={handleAcceptChanges}
                      className="cursor-pointer"
                    >
                      Accept Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <Textarea
                  ref={textareaRef}
                  value={editedText}
                  onChange={e => setEditedText(e.target.value)}
                  onSelect={handleTextSelection}
                  onKeyUp={handleTextSelection}
                  onMouseUp={handleTextSelection}
                  className="h-full resize-none font-mono text-sm"
                  placeholder="Transcript will appear here..."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
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
            <Button onClick={handleExport} className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
