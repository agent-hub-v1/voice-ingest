"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { useDraft } from "@/lib/use-draft"
import type { Utterance } from "@/lib/assemblyai"
import type { FormData } from "@/components/frontmatter-form"
import type { ReviewMode } from "@/components/review-mode-panel"

interface FileEntry {
  url: string
  pathname: string
  size: number
  uploadedAt: string
  type?: 'audio' | 'transcript'
}

export interface TranscriptionData {
  text: string
  utterances: Utterance[]
  confidence: number
}

interface UseTranscriptionProps {
  file: FileEntry
}

// Format date in MST (America/Edmonton) for datetime-local input
function formatDateMST(date: Date) {
  return date.toLocaleString('sv-SE', { timeZone: 'America/Edmonton' }).replace(' ', 'T').slice(0, 19)
}

export function useTranscription({ file }: UseTranscriptionProps) {
  const [status, setStatus] = useState<"idle" | "transcribing" | "ready" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [transcription, setTranscription] = useState<TranscriptionData | null>(null)
  const [editedText, setEditedText] = useState("")
  const [speakers, setSpeakers] = useState<string[]>([])
  const [speakerNames, setSpeakerNames] = useState<Record<string, string>>({})

  // Undo/redo history
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Review mode
  const [reviewMode, setReviewMode] = useState<ReviewMode | null>(null)

  // Trigger for auto-suggesting metadata
  const [triggerSuggest, setTriggerSuggest] = useState(false)

  // Editable display name
  const defaultDisplayName = file.pathname.replace("audio/", "").replace("transcripts/", "").replace(".json", "")
  const [displayName, setDisplayName] = useState(defaultDisplayName)

  // Form data
  const [formData, setFormData] = useState<FormData>({
    date: formatDateMST(new Date()),
    subject: "",
    summary: "",
    tags: [],
    participants: [],
  })

  // Draft persistence
  const { draft, saveDraft, clearDraft, saveStatus, isLoaded } = useDraft(file.pathname)

  const isTranscriptFile = file.type === 'transcript' || file.pathname.startsWith('transcripts/')

  // Push current state to history before a major operation
  const pushHistory = useCallback(() => {
    if (history.length > 0 && history[history.length - 1] === editedText) {
      return
    }
    const newHistory = [...history, editedText].slice(-20)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length)
  }, [history, editedText])

  const handleUndo = useCallback(() => {
    if (history.length === 0) return

    let currentHistory = history
    let currentIndex = historyIndex

    if (currentIndex >= history.length || history[history.length - 1] !== editedText) {
      currentHistory = [...history, editedText].slice(-20)
      setHistory(currentHistory)
      currentIndex = currentHistory.length - 1
    }

    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setHistoryIndex(newIndex)
      setEditedText(currentHistory[newIndex])
    }
  }, [history, historyIndex, editedText])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setEditedText(history[newIndex])
    }
  }, [history, historyIndex])

  // Transcribe audio file
  const transcribeFile = useCallback(async () => {
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

      const formattedText = data.utterances
        .map(u => `[Speaker ${u.speaker}]: ${u.text}`)
        .join("\n\n")
      setEditedText(formattedText)

      const uniqueSpeakers = [...new Set(data.utterances.map(u => u.speaker))]
      setSpeakers(uniqueSpeakers)

      const initialNames: Record<string, string> = {}
      const isMonologue = uniqueSpeakers.length === 1
      uniqueSpeakers.forEach((s, i) => {
        initialNames[s] = isMonologue && i === 0 ? "Richard" : ""
      })
      setSpeakerNames(initialNames)

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
  }, [file.url])

  // Load pre-transcribed JSON file
  const loadTranscriptFile = useCallback(async () => {
    try {
      setStatus("transcribing")
      setError(null)

      const res = await fetch(file.url)
      if (!res.ok) {
        throw new Error("Failed to load transcript file")
      }

      const data = await res.json()

      const transcriptionData: TranscriptionData = {
        text: data.text || "",
        utterances: data.utterances || [{ speaker: "A", text: data.text || "", start: 0, end: 0, confidence: 1.0 }],
        confidence: data.confidence || 1.0,
      }

      setTranscription(transcriptionData)

      const formattedText = transcriptionData.utterances
        .map(u => `[Speaker ${u.speaker}]: ${u.text}`)
        .join("\n\n")
      setEditedText(formattedText)

      const uniqueSpeakers = [...new Set(transcriptionData.utterances.map(u => u.speaker))]
      setSpeakers(uniqueSpeakers)

      const initialNames: Record<string, string> = {}
      const isMonologue = uniqueSpeakers.length === 1
      uniqueSpeakers.forEach((s, i) => {
        initialNames[s] = isMonologue && i === 0 ? "Richard" : ""
      })
      setSpeakerNames(initialNames)

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
  }, [file.url])

  // Load from draft, load transcript file, or start transcription
  useEffect(() => {
    if (!isLoaded) return

    if (draft?.transcription) {
      setTranscription(draft.transcription)
      setEditedText(draft.editedText)
      setFormData(draft.formData)

      const uniqueSpeakers = [...new Set(draft.transcription.utterances.map(u => u.speaker))]
      setSpeakers(uniqueSpeakers)

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

      if (draft.displayName) {
        setDisplayName(draft.displayName)
      }

      setStatus("ready")
    } else if (isTranscriptFile) {
      loadTranscriptFile()
    } else {
      transcribeFile()
    }
  }, [file.pathname, isLoaded, draft, isTranscriptFile, loadTranscriptFile, transcribeFile])

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
  }, [transcription, editedText, speakerNames, formData, displayName, status, saveDraft, defaultDisplayName])

  // Speaker handling
  const handleApplySpeakerNames = useCallback(() => {
    pushHistory()
    let newText = editedText
    Object.entries(speakerNames).forEach(([speaker, name]) => {
      if (name) {
        const regex = new RegExp(`\\[Speaker ${speaker}\\]`, "g")
        newText = newText.replace(regex, `**${name}**`)
      }
    })
    setEditedText(newText)

    const participants = Object.values(speakerNames)
      .filter(name => name)
      .map(name => ({ name, contact_id: null }))
    setFormData(prev => ({ ...prev, participants }))
  }, [pushHistory, editedText, speakerNames])

  const handleRemoveLabels = useCallback(() => {
    pushHistory()
    let newText = editedText
      .replace(/^\[Speaker [A-Z]\]:\s*/gm, "")
      .replace(/^\*\*[^*]+\*\*:\s*/gm, "")
    setEditedText(newText)
    toast.success("Speaker labels removed")
  }, [pushHistory, editedText])

  // Dedash
  const handleDedash = useCallback(() => {
    const dashPattern = /\s*[—–]\s*|\s*--\s*/g
    const originalRanges: Array<{ start: number; end: number }> = []
    let match
    while ((match = dashPattern.exec(editedText)) !== null) {
      originalRanges.push({ start: match.index, end: match.index + match[0].length })
    }

    if (originalRanges.length === 0) {
      toast.info("No dashes found", { description: "No em-dashes, en-dashes, or double-dashes to replace." })
      return
    }

    const afterText = editedText.replace(dashPattern, ", ")

    toast.success(`De-dashed`, {
      description: `Replaced ${originalRanges.length} dash${originalRanges.length === 1 ? '' : 'es'} with commas`
    })

    setReviewMode({
      before: editedText,
      after: afterText,
      isEntireTranscript: true,
      originalRanges,
    })
  }, [editedText])

  // Find and replace
  const handleFindReplace = useCallback((findText: string, replaceText: string) => {
    if (!findText) return

    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    const matches = [...editedText.matchAll(regex)]

    if (matches.length === 0) {
      toast.error("No matches found")
      return
    }

    let newText = ""
    let lastIndex = 0
    const replacementRanges: Array<{ start: number; end: number }> = []

    for (const match of matches) {
      const matchStart = match.index!
      newText += editedText.slice(lastIndex, matchStart)
      const replacementStart = newText.length
      newText += replaceText
      replacementRanges.push({ start: replacementStart, end: newText.length })
      lastIndex = matchStart + findText.length
    }
    newText += editedText.slice(lastIndex)

    toast.success(`Found ${matches.length} instance${matches.length === 1 ? '' : 's'}`)

    setReviewMode({
      before: editedText,
      after: newText,
      replacementRanges,
    })
  }, [editedText])

  // Accept/revert changes
  const handleAcceptChanges = useCallback(() => {
    if (!reviewMode) return
    pushHistory()
    setEditedText(reviewMode.after)
    if (reviewMode.isEntireTranscript) {
      setTriggerSuggest(true)
    }
    setReviewMode(null)
  }, [reviewMode, pushHistory])

  const handleRevertChanges = useCallback(() => {
    setReviewMode(null)
  }, [])

  return {
    // State
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

    // Actions
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
  }
}
