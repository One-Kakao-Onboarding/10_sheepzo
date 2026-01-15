"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { RadialResultView } from "@/components/radial-result-view"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Home } from "lucide-react"
import type { ActorData } from "@/types/actor"

export interface ActorRecommendation {
  actorName: string
  score: number
  summary: string
  detailedScores: {
    personality: number
    roleExperience: number
    visualMatch: number
  }
  reasons: {
    personality: { headline: string; detail: string } | string
    roleExperience: { headline: string; detail: string } | string
    visualMatch: { headline: string; detail: string } | string
  }
}

interface Weights {
  personality: number
  roleExperience: number
  visualMatch: number
}

export function ResultsContent() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<ActorRecommendation[]>([])
  const [actorDatasets, setActorDatasets] = useState<ActorData[]>([])
  const [characterName, setCharacterName] = useState("")
  const [characterImageUrl, setCharacterImageUrl] = useState<string | null>(null)
  const [weights, setWeights] = useState<Weights>({ personality: 34, roleExperience: 33, visualMatch: 33 })

  useEffect(() => {
    const storedData = sessionStorage.getItem("resultsData")
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData)
        const recommendations = parsed.recommendations || []
        const parsedWeights = parsed.weights || { personality: 34, roleExperience: 33, visualMatch: 33 }

        const sortedRecommendations = [...recommendations].sort((a, b) => {
          const scoreA =
            (a.detailedScores.personality * parsedWeights.personality +
              a.detailedScores.roleExperience * parsedWeights.roleExperience +
              a.detailedScores.visualMatch * parsedWeights.visualMatch) /
            100
          const scoreB =
            (b.detailedScores.personality * parsedWeights.personality +
              b.detailedScores.roleExperience * parsedWeights.roleExperience +
              b.detailedScores.visualMatch * parsedWeights.visualMatch) /
            100
          return scoreB - scoreA
        })

        setResults(sortedRecommendations)
        setActorDatasets(parsed.actorDatasets || [])
        setCharacterName(parsed.characterName || "캐릭터")
        setCharacterImageUrl(parsed.characterImageUrl || null)
        setWeights(parsedWeights)
      } catch (e) {
        console.error("Failed to parse results:", e)
      }
    }
  }, [])

  const currentResult = results[currentIndex]
  const currentActorData = actorDatasets.find((a) => a.name === currentResult?.actorName)

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
  }

  if (results.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">결과 데이터가 없습니다.</p>
          <Button onClick={() => router.push("/")}>
            <Home className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/")}>
            <Home className="mr-2 h-4 w-4" />
            홈으로
          </Button>
          <div className="text-center">
            <h1 className="font-semibold text-lg">{characterName} 캐스팅 추천 결과</h1>
            <p className="text-sm text-muted-foreground">
              {currentIndex + 1} / {results.length}위
            </p>
          </div>
          <div className="w-24" />
        </div>
      </header>

      {/* Navigation Arrows */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-20">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg bg-background/80 backdrop-blur-sm"
          onClick={handlePrev}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-20">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg bg-background/80 backdrop-blur-sm"
          onClick={handleNext}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Content - 가중치 전달 추가 */}
      <main className="container mx-auto px-4 py-8">
        <RadialResultView
          result={currentResult}
          actorData={currentActorData}
          rank={currentIndex + 1}
          characterImageUrl={characterImageUrl}
          characterName={characterName}
          weights={weights}
        />
      </main>

      {/* Bottom Navigation Dots */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {results.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-3 h-3 rounded-full transition-all ${
              idx === currentIndex ? "bg-primary scale-125" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
