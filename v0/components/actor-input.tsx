"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileJson, AlertCircle } from "lucide-react"
import type { ActorData } from "@/types/actor"
import { ActorCard } from "@/components/actor-card"

interface ActorInputProps {
  datasets: ActorData[]
  onChange: (datasets: ActorData[]) => void
}

export function ActorInput({ datasets, onChange }: ActorInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    try {
      const text = await file.text()
      console.log("[v0] File content length:", text.length)

      const parsed = JSON.parse(text)
      console.log("[v0] Parsed JSON:", typeof parsed, Array.isArray(parsed) ? `array of ${parsed.length}` : "object")

      const actors: ActorData[] = Array.isArray(parsed) ? parsed : [parsed]

      const validActors = actors.filter((actor) => {
        if (!actor || typeof actor !== "object") {
          console.log("[v0] Invalid actor data:", actor)
          return false
        }
        if (!actor.name) {
          console.log("[v0] Actor missing name:", actor)
          return false
        }
        return true
      })

      console.log("[v0] Valid actors count:", validActors.length)

      if (validActors.length === 0) {
        setError("유효한 배우 데이터가 없습니다. name 필드가 필요합니다.")
        return
      }

      onChange([...datasets, ...validActors])
    } catch (err) {
      console.error("[v0] JSON parsing error:", err)
      setError(`JSON 파싱 오류: ${err instanceof Error ? err.message : "알 수 없는 오류"}`)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemove = (index: number) => {
    onChange(datasets.filter((_, i) => i !== index))
  }

  const handleClearAll = () => {
    onChange([])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>배우 데이터셋</CardTitle>
        <CardDescription>
          전처리된 배우 JSON 파일을 업로드해주세요. 여러 배우가 포함된 배열 형식을 지원합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {datasets.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">총 {datasets.length}명의 배우</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-destructive hover:text-destructive"
              >
                전체 삭제
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
              {datasets.map((actor, index) => (
                <ActorCard key={`${actor.name}-${index}`} actor={actor} onRemove={() => handleRemove(index)} />
              ))}
            </div>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileUpload} className="hidden" />

        <Button
          type="button"
          variant="outline"
          className="w-full bg-transparent"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          JSON 파일 업로드
        </Button>

        {datasets.length === 0 && !error && (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-muted-foreground">
            <FileJson className="h-5 w-5" />
            <span className="text-sm">배우 데이터가 없습니다</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
