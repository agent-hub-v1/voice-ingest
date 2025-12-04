"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { FileList } from "@/components/file-list"
import { TranscriptionEditor } from "@/components/transcription-editor"
import { Mic } from "lucide-react"

interface FileEntry {
  url: string
  pathname: string
  size: number
  uploadedAt: string
  type?: 'audio' | 'transcript'
}

function HomeContent() {
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()

  // On mount, check URL for file parameter and restore from file list
  useEffect(() => {
    const fileParam = searchParams.get("file")
    if (fileParam) {
      // Fetch file list to get the full file object
      fetch("/api/files")
        .then(res => res.json())
        .then(data => {
          const file = data.files?.find((f: FileEntry) => f.pathname === fileParam)
          if (file) {
            setSelectedFile(file)
          }
          setIsLoading(false)
        })
        .catch(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [searchParams])

  // Update URL when file selection changes
  function handleSelectFile(file: FileEntry | null) {
    setSelectedFile(file)
    if (file) {
      router.push(`/?file=${encodeURIComponent(file.pathname)}`, { scroll: false })
    } else {
      router.push("/", { scroll: false })
    }
  }

  async function handleDeleteFile() {
    if (!selectedFile) return
    const fileType = selectedFile.type === 'transcript' ? 'text file' : 'audio file'
    if (!confirm(`Delete this ${fileType}? This cannot be undone.`)) return

    try {
      const res = await fetch(`/api/files/${selectedFile.pathname}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete file")
      // Also clear localStorage for this file
      localStorage.removeItem(`voice-ingest:${selectedFile.pathname}`)
      handleSelectFile(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete file")
    }
  }

  if (isLoading) {
    return (
      <main className="h-[calc(100vh-65px)] flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    )
  }

  return (
    <main className="h-[calc(100vh-65px)]">
      {selectedFile ? (
        <TranscriptionEditor
          file={selectedFile}
          onBack={() => handleSelectFile(null)}
          onDelete={handleDeleteFile}
        />
      ) : (
        <div className="container mx-auto max-w-2xl py-8 px-4">
          <FileList
            onSelectFile={handleSelectFile}
            selectedFile={selectedFile}
          />
        </div>
      )}
    </main>
  )
}

function LoadingFallback() {
  return (
    <main className="h-[calc(100vh-65px)] flex items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </main>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Mic className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Voice Ingest</h1>
        </div>
      </header>

      <Suspense fallback={<LoadingFallback />}>
        <HomeContent />
      </Suspense>
    </div>
  )
}
