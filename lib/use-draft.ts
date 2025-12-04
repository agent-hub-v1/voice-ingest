"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { Utterance } from "./assemblyai"
import type { FormData } from "@/components/frontmatter-form"

export interface DraftState {
  transcription: {
    text: string
    utterances: Utterance[]
    confidence: number
  } | null
  editedText: string
  speakerNames: Record<string, string>
  formData: FormData
  displayName?: string
  savedAt: string
}

const STORAGE_PREFIX = "voice-ingest:"
const DEBOUNCE_MS = 1000

export function useDraft(filePathname: string) {
  const [draft, setDraft] = useState<DraftState | null>(null)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [isLoaded, setIsLoaded] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSaveRef = useRef<string>("")

  const storageKey = `${STORAGE_PREFIX}${filePathname}`

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored) as DraftState
        setDraft(parsed)
        lastSaveRef.current = JSON.stringify(parsed)
      }
    } catch (e) {
      console.error("Failed to load draft:", e)
    }
    setIsLoaded(true)
  }, [storageKey])

  // Save draft to localStorage with debounce
  const saveDraft = useCallback(
    (newDraft: DraftState) => {
      setDraft(newDraft)

      // Check if anything actually changed
      const newDraftStr = JSON.stringify(newDraft)
      if (newDraftStr === lastSaveRef.current) {
        return
      }

      setSaveStatus("saving")

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      // Debounced save
      saveTimeoutRef.current = setTimeout(() => {
        try {
          const draftWithTimestamp = {
            ...newDraft,
            savedAt: new Date().toISOString(),
          }
          localStorage.setItem(storageKey, JSON.stringify(draftWithTimestamp))
          lastSaveRef.current = JSON.stringify(draftWithTimestamp)
          setSaveStatus("saved")

          // Reset status after a short delay
          setTimeout(() => setSaveStatus("idle"), 2000)
        } catch (e) {
          console.error("Failed to save draft:", e)
          setSaveStatus("idle")
        }
      }, DEBOUNCE_MS)
    },
    [storageKey]
  )

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
      setDraft(null)
      lastSaveRef.current = ""
    } catch (e) {
      console.error("Failed to clear draft:", e)
    }
  }, [storageKey])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  return {
    draft,
    saveDraft,
    clearDraft,
    saveStatus,
    isLoaded,
  }
}
