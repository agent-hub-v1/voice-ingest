"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Loader2, Download, Eye, Trash2, ArrowLeft, Mic, Check, Save, Undo2, Redo2, Cpu, FileText, Pencil, Copy, Replace, Minus } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import { FrontmatterForm, type FormData } from "./frontmatter-form"
import { SpeakerMapper } from "./speaker-mapper"
import { AITools } from "./ai-tools"
import { ExportCard } from "./export-card"
import { LastApiCall } from "./last-api-call"
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

// Simple diff function to find character-level differences between two strings
// Returns ranges in the "after" string that differ from "before"
function findDiffRanges(before: string, after: string): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = []
  let i = 0 // before index
  let j = 0 // after index

  while (i < before.length && j < after.length) {
    if (before[i] === after[j]) {
      i++
      j++
    } else {
      // Found a difference - find where it ends
      const diffStart = j

      // Look ahead to find where strings sync up again
      // Try to find a matching substring
      let foundSync = false
      for (let lookAhead = 1; lookAhead < 20 && !foundSync; lookAhead++) {
        // Check if after[j+lookAhead:] starts matching before[i:]
        if (j + lookAhead < after.length && after[j + lookAhead] === before[i]) {
          // Verify it's a real sync by checking a few more chars
          let matches = true
          for (let k = 0; k < 3 && i + k < before.length && j + lookAhead + k < after.length; k++) {
            if (before[i + k] !== after[j + lookAhead + k]) {
              matches = false
              break
            }
          }
          if (matches) {
            ranges.push({ start: diffStart, end: j + lookAhead })
            j = j + lookAhead
            foundSync = true
          }
        }
        // Check if before[i+lookAhead:] starts matching after[j:]
        if (!foundSync && i + lookAhead < before.length && before[i + lookAhead] === after[j]) {
          let matches = true
          for (let k = 0; k < 3 && i + lookAhead + k < before.length && j + k < after.length; k++) {
            if (before[i + lookAhead + k] !== after[j + k]) {
              matches = false
              break
            }
          }
          if (matches) {
            // Deletion in before, no range to add in after
            i = i + lookAhead
            foundSync = true
          }
        }
      }

      if (!foundSync) {
        // Couldn't find sync point, just move both forward
        ranges.push({ start: diffStart, end: j + 1 })
        i++
        j++
      }
    }
  }

  // If after has extra content at the end
  if (j < after.length) {
    ranges.push({ start: j, end: after.length })
  }

  // Merge adjacent/overlapping ranges
  const merged: Array<{ start: number; end: number }> = []
  for (const range of ranges) {
    if (merged.length === 0) {
      merged.push(range)
    } else {
      const last = merged[merged.length - 1]
      if (range.start <= last.end + 1) {
        last.end = Math.max(last.end, range.end)
      } else {
        merged.push(range)
      }
    }
  }

  return merged
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
    isEntireTranscript?: boolean
    // For selection-based changes, track where the replacement starts/ends
    replacementStart?: number
    replacementEnd?: number
    // For find/replace and dedash, track multiple replacement ranges
    replacementRanges?: Array<{ start: number; end: number }>
    // For dedash, track original ranges in the "before" text to highlight
    originalRanges?: Array<{ start: number; end: number }>
  } | null>(null)

  // Find and replace state
  const [showFindReplace, setShowFindReplace] = useState(false)
  const [findText, setFindText] = useState("")
  const [replaceText, setReplaceText] = useState("")

  // Trigger for auto-suggesting metadata after accepting entire transcript changes
  const [triggerSuggest, setTriggerSuggest] = useState(false)

  // Model selection
  interface Model {
    id: string
    name: string
    pricing?: { prompt: number; completion: number }
  }
  const [models, setModels] = useState<Model[]>([])
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [loadingModels, setLoadingModels] = useState(true)
  const [modelTier, setModelTier] = useState<'free' | 'paid'>('free')
  const [lastCost, setLastCost] = useState<number | null>(null)
  const [lastApiCall, setLastApiCall] = useState<{
    usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
    cost: number | null
    modelName: string
    pricing?: { prompt: number; completion: number } | null
  } | null>(null)

  // Editable display name for the file
  const defaultDisplayName = file.pathname.replace("audio/", "").replace("transcripts/", "").replace(".json", "")
  const [displayName, setDisplayName] = useState(defaultDisplayName)
  const [isEditingName, setIsEditingName] = useState(false)

  // Format date in MST (America/Edmonton) for datetime-local input
  const formatDateMST = (date: Date) => {
    return date.toLocaleString('sv-SE', { timeZone: 'America/Edmonton' }).replace(' ', 'T').slice(0, 19)
  }

  const [formData, setFormData] = useState<FormData>({
    date: formatDateMST(new Date()),
    subject: "",
    summary: "",
    tags: [],
    participants: [],
  })

  // Draft persistence
  const { draft, saveDraft, clearDraft, saveStatus, isLoaded } = useDraft(file.pathname)

  // Load available models based on tier
  useEffect(() => {
    setLoadingModels(true)
    fetch(`/api/models?tier=${modelTier}`)
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
  }, [modelTier])

  // Load from draft, load transcript file, or start transcription
  useEffect(() => {
    if (!isLoaded) return

    if (draft?.transcription) {
      // Restore from draft
      setTranscription(draft.transcription)
      setEditedText(draft.editedText)
      setFormData(draft.formData)

      // Extract speakers from transcription
      const uniqueSpeakers = [...new Set(draft.transcription.utterances.map(u => u.speaker))]
      setSpeakers(uniqueSpeakers)

      // Apply "Richard" default for monologues if speaker names are empty
      const isMonologue = uniqueSpeakers.length === 1
      const hasEmptySpeakerNames = Object.values(draft.speakerNames).every(n => !n)
      if (isMonologue && hasEmptySpeakerNames) {
        const defaultNames: Record<string, string> = {}
        uniqueSpeakers.forEach((s, i) => {
          defaultNames[s] = i === 0 ? "Richard" : ""
        })
        setSpeakerNames(defaultNames)
        if (draft.formData.participants.length === 0) {
          setFormData(prev => ({
            ...prev,
            participants: [{ name: "Richard", contact_id: null }]
          }))
        }
      } else {
        setSpeakerNames(draft.speakerNames)
      }

      // Restore display name if saved
      if (draft.displayName) {
        setDisplayName(draft.displayName)
      }

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
      displayName: displayName !== defaultDisplayName ? displayName : undefined,
      savedAt: new Date().toISOString(),
    })
  }, [transcription, editedText, speakerNames, formData, displayName, status, saveDraft])

  // Push current state to history before a major operation
  function pushHistory() {
    // Don't add duplicate entries
    if (history.length > 0 && history[history.length - 1] === editedText) {
      return
    }
    const newHistory = [...history, editedText].slice(-20)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length)
  }

  function handleUndo() {
    if (history.length === 0) return

    // Save current state for redo if not already in history
    let currentHistory = history
    let currentIndex = historyIndex

    if (currentIndex >= history.length || history[history.length - 1] !== editedText) {
      currentHistory = [...history, editedText].slice(-20)
      setHistory(currentHistory)
      currentIndex = currentHistory.length - 1
    }

    // Go back one step
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setHistoryIndex(newIndex)
      setEditedText(currentHistory[newIndex])
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

      // Initialize speaker names - default to "Richard" for monologues
      const initialNames: Record<string, string> = {}
      const isMonologue = uniqueSpeakers.length === 1
      uniqueSpeakers.forEach((s, i) => {
        initialNames[s] = isMonologue && i === 0 ? "Richard" : ""
      })
      setSpeakerNames(initialNames)

      // Set default participant for monologues
      if (isMonologue) {
        setFormData(prev => ({
          ...prev,
          participants: [{ name: "Richard", contact_id: null }]
        }))
      }

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

      // Initialize speaker names - default to "Richard" for monologues
      const initialNames: Record<string, string> = {}
      const isMonologue = uniqueSpeakers.length === 1
      uniqueSpeakers.forEach((s, i) => {
        initialNames[s] = isMonologue && i === 0 ? "Richard" : ""
      })
      setSpeakerNames(initialNames)

      // Set default participant for monologues
      if (isMonologue) {
        setFormData(prev => ({
          ...prev,
          participants: [{ name: "Richard", contact_id: null }]
        }))
      }

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

  function handleRemoveLabels() {
    pushHistory()
    // Remove [Speaker X]: and **Name**: patterns from the start of paragraphs
    let newText = editedText
      .replace(/^\[Speaker [A-Z]\]:\s*/gm, "")
      .replace(/^\*\*[^*]+\*\*:\s*/gm, "")
    setEditedText(newText)
    toast.success("Speaker labels removed")
  }

  function handleTextSelection() {
    if (textareaRef.current) {
      const { selectionStart, selectionEnd } = textareaRef.current
      setHasSelection(selectionStart !== selectionEnd)
    }
  }

  async function handleProcess(mode: "clean" | "improve" | "enhance", target: "all" | "selection") {
    // For selection mode, validate selection exists
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

    // Use selected model for all modes
    const model = selectedModel
    const selectedModelData = models.find(m => m.id === selectedModel)
    const modelName = selectedModelData?.name || model
    const pricing = selectedModelData?.pricing

    // Show request toast
    const inputChars = textToProcess.length
    toast.info(`API Request: ${mode}`, {
      description: `Model: ${modelName} | Input: ${inputChars.toLocaleString()} chars`,
    })

    const startTime = Date.now()

    try {
      setIsProcessing(true)

      // Map mode to API mode (clean -> filler for backwards compatibility)
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

      // Save full API call details
      if (data.usage) {
        setLastApiCall({
          usage: data.usage,
          cost: data.cost,
          modelName,
          pricing,
        })
      }

      // Show response toast with details
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

      // Build the new text
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

      // Enter review mode
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

  async function handleDedash() {
    // Find all dashes in the original text first
    const dashPattern = /—|–|--\s*|\s*--/g
    const originalRanges: Array<{ start: number; end: number }> = []
    let match
    while ((match = dashPattern.exec(editedText)) !== null) {
      originalRanges.push({ start: match.index, end: match.index + match[0].length })
    }

    if (originalRanges.length === 0) {
      toast.info("No dashes found", { description: "No em-dashes, en-dashes, or double-dashes to replace." })
      return
    }

    const model = selectedModel
    const selectedModelData = models.find(m => m.id === selectedModel)
    const modelName = selectedModelData?.name || model
    const pricing = selectedModelData?.pricing

    const inputChars = editedText.length
    toast.info(`API Request: dedash`, {
      description: `Model: ${modelName} | Found ${originalRanges.length} dash${originalRanges.length === 1 ? '' : 'es'}`,
    })

    const startTime = Date.now()

    try {
      setIsProcessing(true)

      const res = await fetch("/api/clean-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: editedText,
          mode: "dedash",
          model,
          pricing,
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
      toast.success(`Response: dedash`, { description })

      setReviewMode({
        before: editedText,
        after: data.result,
        isEntireTranscript: true,
        originalRanges,
      })
    } catch (err) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
      toast.error(`Failed: dedash`, {
        description: `${err instanceof Error ? err.message : "Processing failed"} (${elapsed}s)`,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  function handleAcceptChanges() {
    if (!reviewMode) return
    pushHistory()
    setEditedText(reviewMode.after)
    // Trigger AI suggest if this was an entire transcript operation
    if (reviewMode.isEntireTranscript) {
      setTriggerSuggest(true)
    }
    setReviewMode(null)
  }

  function handleRevertChanges() {
    setReviewMode(null)
  }

  function handleFindReplace() {
    if (!findText) return

    // Find all occurrences
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    const matches = [...editedText.matchAll(regex)]

    if (matches.length === 0) {
      toast.error("No matches found")
      return
    }

    // Build the new text and track replacement ranges
    let newText = ""
    let lastIndex = 0
    const replacementRanges: Array<{ start: number; end: number }> = []

    for (const match of matches) {
      const matchStart = match.index!
      // Add text before this match
      newText += editedText.slice(lastIndex, matchStart)
      // Track where this replacement starts in the new text
      const replacementStart = newText.length
      // Add the replacement
      newText += replaceText
      // Track where this replacement ends
      replacementRanges.push({ start: replacementStart, end: newText.length })
      lastIndex = matchStart + findText.length
    }
    // Add remaining text
    newText += editedText.slice(lastIndex)

    toast.success(`Found ${matches.length} instance${matches.length === 1 ? '' : 's'}`)

    // Enter review mode with multiple highlights
    setReviewMode({
      before: editedText,
      after: newText,
      replacementRanges,
    })

    setShowFindReplace(false)
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
        sourceAudio: isTranscript ? undefined : file.pathname.replace("audio/", ""),
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
      sourceAudio: isTranscript ? undefined : file.pathname.replace("audio/", ""),
      transcriptionConfidence: transcription.confidence || 0,
      processedDate: new Date().toISOString(),
    }

    const markdown = generateMarkdown(metadata, parsedUtterances, speakerNames, isMonologue)
    const filename = generateFilename(metadata)

    return { content: markdown, filename }
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
                        onChange={e => setDisplayName(e.target.value)}
                        onBlur={() => setIsEditingName(false)}
                        onKeyDown={e => {
                          if (e.key === "Enter") setIsEditingName(false)
                          if (e.key === "Escape") {
                            setDisplayName(defaultDisplayName)
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
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      AI Model
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs", modelTier === 'free' ? "text-foreground" : "text-muted-foreground")}>Free</span>
                      <Switch
                        checked={modelTier === 'paid'}
                        onCheckedChange={(checked) => setModelTier(checked ? 'paid' : 'free')}
                      />
                      <span className={cn("text-xs", modelTier === 'paid' ? "text-foreground" : "text-muted-foreground")}>Paid</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
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
                  {lastCost !== null && modelTier === 'paid' && (
                    <p className="text-xs text-muted-foreground">
                      Last call: {(() => {
                        const cents = lastCost * 100
                        if (cents >= 100) return `$${(cents / 100).toFixed(2)}`
                        if (cents >= 0.5) return `${cents.toFixed(2)} cents`
                        return `1/${Math.round(1 / cents)} cent`
                      })()}
                    </p>
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
                        onKeyDown={e => e.key === "Enter" && handleFindReplace()}
                      />
                      <Input
                        value={replaceText}
                        onChange={e => setReplaceText(e.target.value)}
                        placeholder="Replace"
                        className="h-8 w-28 text-sm"
                        onKeyDown={e => e.key === "Enter" && handleFindReplace()}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleFindReplace}
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
                        onClick={handleDedash}
                        disabled={isProcessing}
                        className="h-8 w-8 cursor-pointer"
                        title="De-dash: Replace em-dashes and double-dashes with contextual punctuation"
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
                      <div className="relative flex-1 min-h-0">
                        <div className="absolute inset-0 overflow-auto rounded-md border bg-muted/30 p-3">
                          <pre className="whitespace-pre-wrap font-mono text-sm">
                            {reviewMode.originalRanges && reviewMode.originalRanges.length > 0 ? (
                              // Highlight original ranges (for dedash)
                              (() => {
                                const parts: React.ReactNode[] = []
                                let lastEnd = 0
                                reviewMode.originalRanges.forEach((range, i) => {
                                  if (range.start > lastEnd) {
                                    parts.push(reviewMode.before.slice(lastEnd, range.start))
                                  }
                                  parts.push(
                                    <span key={i} className="text-red-600 dark:text-red-400 bg-red-500/20 rounded px-0.5">
                                      {reviewMode.before.slice(range.start, range.end)}
                                    </span>
                                  )
                                  lastEnd = range.end
                                })
                                if (lastEnd < reviewMode.before.length) {
                                  parts.push(reviewMode.before.slice(lastEnd))
                                }
                                return parts
                              })()
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
                    <div className="flex flex-col min-h-0">
                      <p className="text-xs font-medium text-muted-foreground mb-1">After</p>
                      <div className="relative flex-1 min-h-0">
                        <div className="absolute inset-0 overflow-auto rounded-md border border-green-500/30 bg-green-500/5 p-3">
                          <pre className="whitespace-pre-wrap font-mono text-sm">
                            {reviewMode.replacementRanges && reviewMode.replacementRanges.length > 0 ? (
                              // Multiple replacement ranges (find/replace)
                              (() => {
                                const parts: React.ReactNode[] = []
                                let lastEnd = 0
                                reviewMode.replacementRanges.forEach((range, i) => {
                                  if (range.start > lastEnd) {
                                    parts.push(reviewMode.after.slice(lastEnd, range.start))
                                  }
                                  parts.push(
                                    <span key={i} className="text-green-600 dark:text-green-400 bg-green-500/20 rounded px-0.5">
                                      {reviewMode.after.slice(range.start, range.end)}
                                    </span>
                                  )
                                  lastEnd = range.end
                                })
                                if (lastEnd < reviewMode.after.length) {
                                  parts.push(reviewMode.after.slice(lastEnd))
                                }
                                return parts
                              })()
                            ) : reviewMode.replacementStart !== undefined && reviewMode.replacementEnd !== undefined ? (
                              // Single replacement range (selection-based)
                              <>
                                {reviewMode.after.slice(0, reviewMode.replacementStart)}
                                <span className="text-green-600 dark:text-green-400 bg-green-500/20 rounded px-0.5">
                                  {reviewMode.after.slice(reviewMode.replacementStart, reviewMode.replacementEnd)}
                                </span>
                                {reviewMode.after.slice(reviewMode.replacementEnd)}
                              </>
                            ) : reviewMode.originalRanges && reviewMode.originalRanges.length > 0 ? (
                              // Dedash mode - use diff to find changes in after
                              (() => {
                                const diffRanges = findDiffRanges(reviewMode.before, reviewMode.after)
                                if (diffRanges.length === 0) {
                                  return reviewMode.after
                                }
                                const parts: React.ReactNode[] = []
                                let lastEnd = 0
                                diffRanges.forEach((range, i) => {
                                  if (range.start > lastEnd) {
                                    parts.push(reviewMode.after.slice(lastEnd, range.start))
                                  }
                                  parts.push(
                                    <span key={i} className="text-green-600 dark:text-green-400 bg-green-500/20 rounded px-0.5">
                                      {reviewMode.after.slice(range.start, range.end)}
                                    </span>
                                  )
                                  lastEnd = range.end
                                })
                                if (lastEnd < reviewMode.after.length) {
                                  parts.push(reviewMode.after.slice(lastEnd))
                                }
                                return parts
                              })()
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
                      onChange={e => setEditedText(e.target.value)}
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
