"use client"

import { useState } from "react"
import { FileList } from "@/components/file-list"
import { TranscriptionEditor } from "@/components/transcription-editor"
import { Mic } from "lucide-react"

interface AudioFile {
  url: string
  pathname: string
  size: number
  uploadedAt: string
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<AudioFile | null>(null)

  async function handleDeleteFile() {
    if (!selectedFile) return
    if (!confirm("Delete this audio file? This cannot be undone.")) return

    try {
      const res = await fetch(`/api/files/${selectedFile.pathname}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete file")
      setSelectedFile(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete file")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Mic className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Voice Ingest</h1>
        </div>
      </header>

      <main className="h-[calc(100vh-65px)]">
        {selectedFile ? (
          <TranscriptionEditor
            file={selectedFile}
            onBack={() => setSelectedFile(null)}
            onDelete={handleDeleteFile}
          />
        ) : (
          <div className="container mx-auto max-w-2xl py-8 px-4">
            <FileList
              onSelectFile={setSelectedFile}
              selectedFile={selectedFile}
            />
          </div>
        )}
      </main>
    </div>
  )
}
