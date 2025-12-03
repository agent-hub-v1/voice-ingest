"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, X, FileText, Sparkles, Loader2 } from "lucide-react"

interface Contact {
  id: string
  name: string
}

interface Participant {
  name: string
  contact_id: string | null
}

export interface FormData {
  date: string
  subject: string
  summary: string
  tags: string[]
  participants: Participant[]
}

interface FrontmatterFormProps {
  formData: FormData
  onFormChange: (data: FormData) => void
  transcript?: string
  selectedModel?: string
  isProcessing?: boolean
  setIsProcessing?: (processing: boolean) => void
}

const SUGGESTED_TAGS = [
  "business",
  "family",
  "health",
  "spiritual",
  "creative",
  "social",
  "financial",
  "planning",
  "reflection",
  "decision",
  "brainstorm",
  "meeting",
  "personal",
]

export function FrontmatterForm({
  formData,
  onFormChange,
  transcript,
  selectedModel,
  isProcessing,
  setIsProcessing,
}: FrontmatterFormProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [tagInput, setTagInput] = useState("")
  const [isSuggesting, setIsSuggesting] = useState(false)

  useEffect(() => {
    fetch("/api/contacts")
      .then(res => res.json())
      .then(data => setContacts(data.contacts || []))
      .catch(() => setContacts([]))
  }, [])

  async function handleAISuggest() {
    if (!transcript || !selectedModel) return

    try {
      setIsSuggesting(true)
      setIsProcessing?.(true)

      const res = await fetch("/api/suggest-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, model: selectedModel }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to generate suggestions")
      }

      const suggestions = await res.json()

      onFormChange({
        ...formData,
        subject: suggestions.subject || formData.subject,
        summary: suggestions.summary || formData.summary,
        tags: suggestions.tags?.length > 0 ? suggestions.tags : formData.tags,
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to generate suggestions")
    } finally {
      setIsSuggesting(false)
      setIsProcessing?.(false)
    }
  }

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    onFormChange({ ...formData, [key]: value })
  }

  function addTag(tag: string) {
    const trimmed = tag.trim().toLowerCase()
    if (trimmed && !formData.tags.includes(trimmed)) {
      updateField("tags", [...formData.tags, trimmed])
    }
    setTagInput("")
  }

  function removeTag(tag: string) {
    updateField("tags", formData.tags.filter(t => t !== tag))
  }

  function addParticipant() {
    updateField("participants", [
      ...formData.participants,
      { name: "", contact_id: null },
    ])
  }

  function updateParticipant(index: number, name: string, contact_id: string | null) {
    const updated = [...formData.participants]
    updated[index] = { name, contact_id }
    updateField("participants", updated)
  }

  function removeParticipant(index: number) {
    updateField("participants", formData.participants.filter((_, i) => i !== index))
  }

  function handleContactSelect(index: number, value: string) {
    if (value === "__custom__") {
      updateParticipant(index, "", null)
    } else {
      const contact = contacts.find(c => c.id === value)
      if (contact) {
        updateParticipant(index, contact.name, contact.id)
      }
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Frontmatter
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAISuggest}
            disabled={isSuggesting || isProcessing || !transcript || !selectedModel}
            className="cursor-pointer gap-1.5"
          >
            {isSuggesting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            AI Suggest
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date/Time</Label>
          <Input
            id="date"
            type="datetime-local"
            value={formData.date.slice(0, 16)}
            onChange={e => updateField("date", e.target.value + ":00")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            placeholder="Brief title for this recording..."
            value={formData.subject}
            onChange={e => updateField("subject", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">Summary</Label>
          <Textarea
            id="summary"
            placeholder="One paragraph context/summary..."
            value={formData.summary}
            onChange={e => updateField("summary", e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-1 mb-2">
            {formData.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="cursor-pointer hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add tag..."
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addTag(tagInput)
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => addTag(tagInput)}
              className="cursor-pointer"
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {SUGGESTED_TAGS.filter(t => !formData.tags.includes(t))
              .slice(0, 6)
              .map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => addTag(tag)}
                >
                  + {tag}
                </Badge>
              ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Participants</Label>
          {formData.participants.map((participant, index) => (
            <div key={index} className="flex gap-2">
              {participant.contact_id ? (
                <Input
                  value={participant.name}
                  disabled
                  className="flex-1"
                />
              ) : (
                <Select
                  value={participant.contact_id || "__custom__"}
                  onValueChange={value => handleContactSelect(index, value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map(contact => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="__custom__">+ Custom name</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {!participant.contact_id && (
                <Input
                  placeholder="Name..."
                  value={participant.name}
                  onChange={e => updateParticipant(index, e.target.value, null)}
                  className="flex-1"
                />
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeParticipant(index)}
                className="cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addParticipant}
            className="cursor-pointer w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Participant
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
