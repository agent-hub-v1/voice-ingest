"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileAudio, Loader2, Trash2, Check, RotateCcw } from "lucide-react"

interface AudioFile {
  url: string
  pathname: string
  size: number
  uploadedAt: string
}

interface FileListProps {
  onSelectFile: (file: AudioFile) => void
  selectedFile: AudioFile | null
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

const STORAGE_PREFIX = "voice-ingest:"

function hasTranscription(pathname: string): boolean {
  if (typeof window === "undefined") return false
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${pathname}`)
    if (!stored) return false
    const draft = JSON.parse(stored)
    return !!draft?.transcription
  } catch {
    return false
  }
}

export function FileList({ onSelectFile, selectedFile }: FileListProps) {
  const [files, setFiles] = useState<AudioFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [transcribed, setTranscribed] = useState<Set<string>>(new Set())

  async function fetchFiles() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/files")
      if (!res.ok) throw new Error("Failed to fetch files")
      const data = await res.json()
      setFiles(data.files)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load files")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  // Check which files have transcriptions in localStorage
  useEffect(() => {
    if (files.length === 0) return
    const transcribedSet = new Set<string>()
    files.forEach(file => {
      if (hasTranscription(file.pathname)) {
        transcribedSet.add(file.pathname)
      }
    })
    setTranscribed(transcribedSet)
  }, [files])

  async function handleDelete(file: AudioFile, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm("Delete this audio file?")) return

    try {
      setDeleting(file.pathname)
      const res = await fetch(`/api/files/${file.pathname}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete file")
      setFiles(files.filter(f => f.pathname !== file.pathname))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete file")
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchFiles} className="mt-4 cursor-pointer">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileAudio className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No audio files yet</p>
          <p className="text-sm text-muted-foreground">
            Upload voice memos via iOS Shortcut
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Audio Files</span>
          <Badge variant="secondary">{files.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-1 p-4 pt-0">
            {files.map(file => (
              <div
                key={file.pathname}
                onClick={() => onSelectFile(file)}
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent ${
                  selectedFile?.pathname === file.pathname
                    ? "border-primary bg-accent"
                    : "border-transparent"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileAudio className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">
                        {file.pathname.replace("audio/", "")}
                      </p>
                      {transcribed.has(file.pathname) && (
                        <>
                          <Badge variant="secondary" className="shrink-0 gap-1 text-xs text-green-600">
                            <Check className="h-3 w-3" />
                            Transcribed
                          </Badge>
                          <Badge
                            variant="outline"
                            className="shrink-0 gap-1 text-xs cursor-pointer hover:bg-accent"
                            onClick={e => {
                              e.stopPropagation()
                              if (confirm("Re-transcribe this file? This will clear your saved edits.")) {
                                localStorage.removeItem(`${STORAGE_PREFIX}${file.pathname}`)
                                setTranscribed(prev => {
                                  const next = new Set(prev)
                                  next.delete(file.pathname)
                                  return next
                                })
                                onSelectFile(file)
                              }
                            }}
                          >
                            <RotateCcw className="h-3 w-3" />
                            Re-transcribe
                          </Badge>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={e => handleDelete(file, e)}
                  disabled={deleting === file.pathname}
                  className="shrink-0 cursor-pointer"
                >
                  {deleting === file.pathname ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
