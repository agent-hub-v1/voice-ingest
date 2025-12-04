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
import { Download, Eye, FolderOpen } from "lucide-react"

interface ExportSettings {
  export: {
    defaultPath: string
    recentPaths: string[]
  }
}

interface ExportCardProps {
  onPreview: () => void
  onExport: (exportPath: string) => void
}

export function ExportCard({ onPreview, onExport }: ExportCardProps) {
  const [exportPath, setExportPath] = useState("")
  const [recentPaths, setRecentPaths] = useState<string[]>([])

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
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button
            onClick={() => onExport(exportPath)}
            className="flex-1 cursor-pointer"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
