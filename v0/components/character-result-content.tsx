"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, User, Brain, Theater, Heart } from "lucide-react"
import type { CharacterData } from "@/types/character"

interface CharacterAnalysisData {
  characterInfo: string
  processedCharacter: CharacterData
  characterImageUrl: string | null
  usedCache: boolean
}

const analysisCategories = [
  { key: "outer_image", label: "외적 이미지", icon: User, color: "bg-blue-500" },
  { key: "personality_spectrum", label: "성격 스펙트럼", icon: Brain, color: "bg-purple-500" },
  { key: "narrative_role", label: "서사적 역할", icon: Theater, color: "bg-amber-500" },
  { key: "emotion_spectrum", label: "감정 스펙트럼", icon: Heart, color: "bg-rose-500" },
] as const

export function CharacterResultContent() {
  const router = useRouter()
  const [data, setData] = useState<CharacterAnalysisData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("characterAnalysisResult")
      if (!stored) {
        setError("분석 결과를 찾을 수 없습니다. 다시 분석해주세요.")
        return
      }
      setData(JSON.parse(stored))
    } catch (err) {
      setError("데이터를 불러오는 중 오류가 발생했습니다.")
    }
  }, [])

  const handleNextStep = () => {
    if (!data) return

    // match 페이지에서 사용할 데이터 저장
    const dataToPass = {
      characterInfo: data.characterInfo,
      processedCharacter: data.processedCharacter,
      characterImageUrl: data.characterImageUrl,
    }
    sessionStorage.setItem("characterData", JSON.stringify(dataToPass))
    router.push("/match")
  }

  const handleBack = () => {
    router.push("/")
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={handleBack}>돌아가기</Button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const { processedCharacter, characterImageUrl, usedCache } = data

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <header className="text-center mb-10">
        <Badge variant="secondary" className="mb-4">
          분석 완료
        </Badge>
        <h1 className="text-3xl font-bold text-foreground mb-2">캐릭터 분석 결과</h1>
        <p className="text-muted-foreground">AI가 분석한 캐릭터의 특성입니다</p>
      </header>

      <div className="space-y-8">
        {/* Character Image (if exists) */}
        {characterImageUrl && (
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={characterImageUrl || "/placeholder.svg"}
                alt="캐릭터 이미지"
                className="w-40 h-40 object-cover rounded-2xl shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                분석됨
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {analysisCategories.map(({ key, label, icon: Icon, color }) => (
            <Card key={key} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{processedCharacter[key] || "분석 결과 없음"}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleBack} className="gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            다시 분석하기
          </Button>
          <Button size="lg" onClick={handleNextStep} className="gap-2">
            다음 단계: 배우 매칭
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
