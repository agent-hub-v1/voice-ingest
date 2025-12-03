"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { User } from "lucide-react"

interface Contact {
  id: string
  name: string
  aliases?: string[]
}

interface SpeakerMapperProps {
  speakers: string[]
  speakerNames: Record<string, string>
  onUpdateSpeakerNames: (names: Record<string, string>) => void
  onApplySpeakerNames: () => void
}

export function SpeakerMapper({
  speakers,
  speakerNames,
  onUpdateSpeakerNames,
  onApplySpeakerNames,
}: SpeakerMapperProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [customInputs, setCustomInputs] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch("/api/contacts")
      .then(res => res.json())
      .then(data => setContacts(data.contacts || []))
      .catch(() => setContacts([]))
  }, [])

  function handleSelectChange(speaker: string, value: string) {
    if (value === "__custom__") {
      setCustomInputs(prev => ({ ...prev, [speaker]: true }))
    } else {
      setCustomInputs(prev => ({ ...prev, [speaker]: false }))
      onUpdateSpeakerNames({ ...speakerNames, [speaker]: value })
    }
  }

  function handleCustomInput(speaker: string, value: string) {
    onUpdateSpeakerNames({ ...speakerNames, [speaker]: value })
  }

  if (speakers.length === 0) {
    return null
  }

  // If no contacts loaded, show simple inputs
  const useSimpleInputs = contacts.length === 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-4 w-4" />
          Speaker Mapping
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {speakers.map(speaker => (
          <div key={speaker} className="space-y-2">
            <Label htmlFor={`speaker-${speaker}`}>Speaker {speaker}</Label>
            {useSimpleInputs || customInputs[speaker] ? (
              <div className="flex gap-2">
                <Input
                  id={`speaker-${speaker}`}
                  placeholder="Enter name..."
                  value={speakerNames[speaker] || ""}
                  onChange={e => handleCustomInput(speaker, e.target.value)}
                />
                {!useSimpleInputs && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCustomInputs(prev => ({ ...prev, [speaker]: false }))
                      onUpdateSpeakerNames({ ...speakerNames, [speaker]: "" })
                    }}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            ) : (
              <Select
                value={speakerNames[speaker] || ""}
                onValueChange={value => handleSelectChange(speaker, value)}
              >
                <SelectTrigger id={`speaker-${speaker}`}>
                  <SelectValue placeholder="Select contact..." />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map(contact => (
                    <SelectItem key={contact.id} value={contact.name}>
                      {contact.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__">
                    + Custom name...
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
        <Button
          onClick={onApplySpeakerNames}
          className="w-full cursor-pointer"
          disabled={speakers.some(s => !speakerNames[s])}
        >
          Apply Speaker Names
        </Button>
      </CardContent>
    </Card>
  )
}
