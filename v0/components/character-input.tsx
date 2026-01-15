"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, ChevronDown, ChevronUp } from "lucide-react"
import type { CharacterData } from "@/types/character"

interface CharacterInputProps {
  value: string
  onChange: (value: string) => void
  processedData: CharacterData | null
  onProcessedDataChange: (data: CharacterData | null) => void
}

export function CharacterInput({ value, onChange, processedData, onProcessedDataChange }: CharacterInputProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)

  const handlePreprocess = async () => {
    if (!value.trim()) {
      setError("캐릭터 설명을 먼저 입력해주세요.")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/preprocess-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: value }),
      })

      if (!response.ok) {
        throw new Error("분석에 실패했습니다.")
      }

      const data = await response.json()
      onProcessedDataChange(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.")
    } finally {
      setIsProcessing(false)
    }
  }

  const analysisItems = [
    { key: "outer_image", label: "외적 이미지", icon: "👤" },
    { key: "personality_spectrum", label: "성격 스펙트럼", icon: "💭" },
    { key: "narrative_role", label: "서사적 역할", icon: "🎭" },
    { key: "emotion_spectrum", label: "감정 스펙트럼", icon: "❤️" },
  ] as const

  return (
    <Card>
      <CardHeader>
        <CardTitle>캐릭터 정보</CardTitle>
        <CardDescription>소설/웹툰 속 캐릭터에 대한 설명을 입력하고 AI 분석을 실행하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="character-info" className="sr-only">
            캐릭터 설명
          </Label>
          <Textarea
            id="character-info"
            placeholder="예시: 30대 초반의 냉철한 검사. 차가운 외모와 날카로운 눈빛을 가졌으며, 정의를 위해서라면 수단과 방법을 가리지 않는 이중성을 지닌 인물. 감정을 잘 드러내지 않지만 결정적인 순간에 폭발적인 분노를 표출하기도 한다..."
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              if (processedData) {
                onProcessedDataChange(null)
              }
            }}
            className="min-h-[150px] resize-y"
          />
        </div>

        <Button onClick={handlePreprocess} disabled={isProcessing || !value.trim()} className="w-full">
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              AI 분석 중...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              캐릭터 분석하기
            </>
          )}
        </Button>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {processedData && (
          <div className="mt-4 space-y-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex w-full items-center justify-between rounded-lg bg-muted/50 px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI 분석 결과
              </span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {isExpanded && (
              <div className="grid gap-3">
                {analysisItems.map(({ key, label, icon }) => (
                  <div key={key} className="rounded-lg border bg-card p-3">
                    <h4 className="mb-2 text-sm font-semibold flex items-center gap-2">
                      <span>{icon}</span>
                      {label}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{processedData[key]}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
