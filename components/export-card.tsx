"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Download, Eye, FolderOpen, Loader2, Check } from "lucide-react"

interface ExportSettings {
  export: {
    defaultPath: string
    recentPaths: string[]
  }
}

interface ExportCardProps {
  onPreview: () => void
  getExportData: () => { content: string; filename: string } | null
}

export function ExportCard({ onPreview, getExportData }: ExportCardProps) {
  const [exportPath, setExportPath] = useState("")
  const [recentPaths, setRecentPaths] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  useEffect(() => {
    fetch("/settings.json")
      .then(res => res.json())
      .then((settings: ExportSettings) => {
        setExportPath(settings.export.defaultPath)
        setRecentPaths(settings.export.recentPaths)
      })
      .catch(() => {
        // Fallback defaults
        setExportPath("~/Downloads")
        setRecentPaths(["~/Downloads"])
      })
  }, [])

  async function handleExport() {
    const data = getExportData()
    if (!data) return

    setIsExporting(true)
    setExportSuccess(false)

    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: data.content,
          filename: data.filename,
          exportPath,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Export failed")
      }

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 2000)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Export failed")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FolderOpen className="h-4 w-4" />
          Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={exportPath} onValueChange={setExportPath}>
          <SelectTrigger>
            <SelectValue placeholder="Select export location" />
          </SelectTrigger>
          <SelectContent>
            {recentPaths.map(path => (
              <SelectItem key={path} value={path}>
                {path.replace("~/", "")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            onClick={onPreview}
            variant="outline"
            className="flex-1 cursor-pointer"
            size="sm"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 cursor-pointer"
            size="sm"
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : exportSuccess ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {exportSuccess ? "Saved!" : "Export"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
