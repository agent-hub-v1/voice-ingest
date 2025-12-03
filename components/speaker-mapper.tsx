"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "lucide-react"

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
  function handleNameChange(speaker: string, value: string) {
    onUpdateSpeakerNames({ ...speakerNames, [speaker]: value })
  }

  if (speakers.length === 0) {
    return null
  }

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
            <Input
              id={`speaker-${speaker}`}
              placeholder="Enter name..."
              value={speakerNames[speaker] || ""}
              onChange={e => handleNameChange(speaker, e.target.value)}
            />
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
