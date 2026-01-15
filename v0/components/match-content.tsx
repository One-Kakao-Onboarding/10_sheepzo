"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { WeightSettings, type Weights } from "./weight-settings"
import { LoadingScreen } from "./loading-screen"
import { ActorCard } from "./actor-card"
import { ArrowLeft, User, Brain, Theater, Heart, CheckSquare, Square } from "lucide-react"
import type { ActorData } from "@/types/actor"
import type { CharacterData } from "@/types/character"

const AGENCY_NAMES: Record<string, string> = {
  awesome: "어썸이엔티",
  bh: "BH엔터테인먼트",
  jwide: "J와이드컴퍼니",
  kingkong: "킹콩by스타쉽",
  soop: "숲엔터테인먼트",
  vast: "바스트엔터테인먼트",
}

const ACTOR_JSON_URL = "https://blobs.vusercontent.net/blob/final_actors-1aOFG5CqB5kp6yte2CUdOWm34evbPg.json"

function hashRequest(data: object): string {
  const str = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return `recommend_cache_${hash}`
}

interface CharacterPageData {
  characterInfo: string
  processedCharacter: CharacterData
  characterImageUrl?: string | null
}

export function MatchContent() {
  const router = useRouter()
  const [characterData, setCharacterData] = useState<CharacterPageData | null>(null)
  const [actorDataset, setActorDataset] = useState<ActorData[]>([])
  const [isLoadingActors, setIsLoadingActors] = useState(true)
  const [selectedActors, setSelectedActors] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<string>("all")
  const [weights, setWeights] = useState<Weights>({
    personality: 40,
    roleExperience: 35,
    visualMatch: 25,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const actorsByAgency = useMemo(() => {
    const grouped: Record<string, ActorData[]> = {}
    actorDataset.forEach((actor) => {
      const agency = actor.agency || "unknown"
      if (!grouped[agency]) {
        grouped[agency] = []
      }
      grouped[agency].push(actor)
    })
    return grouped
  }, [actorDataset])

  const agencies = useMemo(() => {
    return Object.keys(actorsByAgency).sort((a, b) => {
      const nameA = AGENCY_NAMES[a] || a
      const nameB = AGENCY_NAMES[b] || b
      return nameA.localeCompare(nameB, "ko")
    })
  }, [actorsByAgency])

  const currentActors = useMemo(() => {
    if (activeTab === "all") {
      return actorDataset
    }
    return actorsByAgency[activeTab] || []
  }, [activeTab, actorDataset, actorsByAgency])

  const selectedActorsData = useMemo(() => {
    return actorDataset.filter((actor) => selectedActors.has(actor.name))
  }, [actorDataset, selectedActors])

  useEffect(() => {
    async function loadActors() {
      try {
        const response = await fetch("/api/actors")
        if (!response.ok) {
          throw new Error("배우 데이터를 불러오는데 실패했습니다.")
        }
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        setActorDataset(data)
      } catch (err) {
        console.error("Failed to load actor dataset:", err)
        setError("배우 데이터를 불러오는데 실패했습니다.")
      } finally {
        setIsLoadingActors(false)
      }
    }
    loadActors()
  }, [])

  useEffect(() => {
    const storedData = sessionStorage.getItem("characterData")
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData)
        setCharacterData(parsed)
      } catch (e) {
        console.error("Failed to parse character data:", e)
        router.push("/")
      }
    } else {
      router.push("/")
    }
  }, [router])

  const extractCharacterName = (info: string): string => {
    const firstLine = info.split("\n")[0]
    const nameMatch = firstLine.match(/이름[:\s]*([^\n,]+)/) || firstLine.match(/^([가-힣a-zA-Z\s]+)/)
    return nameMatch ? nameMatch[1].trim().slice(0, 20) : "캐릭터"
  }

  const toggleActorSelection = (actorName: string) => {
    setSelectedActors((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(actorName)) {
        newSet.delete(actorName)
      } else {
        newSet.add(actorName)
      }
      return newSet
    })
  }

  const selectAllInCurrentTab = () => {
    setSelectedActors((prev) => {
      const newSet = new Set(prev)
      currentActors.forEach((actor) => newSet.add(actor.name))
      return newSet
    })
  }

  const deselectAllInCurrentTab = () => {
    setSelectedActors((prev) => {
      const newSet = new Set(prev)
      currentActors.forEach((actor) => newSet.delete(actor.name))
      return newSet
    })
  }

  const allCurrentSelected = currentActors.length > 0 && currentActors.every((actor) => selectedActors.has(actor.name))

  const handleRecommend = async () => {
    if (!characterData) return
    if (selectedActors.size === 0) {
      setError("최소 1명 이상의 배우를 선택해주세요.")
      return
    }

    setError(null)
    setIsLoading(true)

    const requestData = {
      characterInfo: characterData.characterInfo,
      processedCharacter: characterData.processedCharacter,
      actorDatasets: selectedActorsData,
      weights,
    }

    const cacheKey = hashRequest(requestData)

    try {
      const cachedResult = sessionStorage.getItem(cacheKey)

      if (cachedResult) {
        const data = JSON.parse(cachedResult)

        const resultsData = {
          recommendations: data.recommendations,
          actorDatasets: selectedActorsData,
          characterName: extractCharacterName(characterData.characterInfo),
          characterImageUrl: characterData.characterImageUrl || null,
        }

        sessionStorage.setItem("resultsData", JSON.stringify(resultsData))
        router.push("/results")
        return
      }

      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error("추천 요청에 실패했습니다.")
      }

      const data = await response.json()

      sessionStorage.setItem(cacheKey, JSON.stringify(data))

      const resultsData = {
        recommendations: data.recommendations,
        actorDatasets: selectedActorsData,
        characterName: extractCharacterName(characterData.characterInfo),
        characterImageUrl: characterData.characterImageUrl || null,
      }

      sessionStorage.setItem("resultsData", JSON.stringify(resultsData))
      router.push("/results")
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.")
      setIsLoading(false)
    }
  }

  if (!characterData || isLoadingActors) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        {isLoadingActors && <p className="text-sm text-muted-foreground">배우 데이터 로딩 중...</p>}
      </div>
    )
  }

  const { processedCharacter, characterImageUrl } = characterData

  const characterSummary = [
    { key: "outer_image", label: "외적 이미지", icon: User },
    { key: "personality_spectrum", label: "성격", icon: Brain },
    { key: "narrative_role", label: "역할", icon: Theater },
    { key: "emotion_spectrum", label: "감정", icon: Heart },
  ] as const

  return (
    <>
      {isLoading && <LoadingScreen />}

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-10">
          <Badge variant="secondary" className="mb-4">
            Step 2 of 2
          </Badge>
          <h1 className="text-3xl font-bold text-foreground mb-2">배우 매칭</h1>
          <p className="text-muted-foreground">분석된 캐릭터에 어울리는 배우를 찾아보세요</p>
        </header>

        {/* Back Button */}
        <Button variant="ghost" className="mb-6" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          캐릭터 분석으로 돌아가기
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Character Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-base">분석된 캐릭터</CardTitle>
                <CardDescription>Step 1에서 분석한 캐릭터 정보</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {characterImageUrl && (
                  <div className="flex justify-center mb-4">
                    <div className="w-24 h-32 rounded-lg overflow-hidden border">
                      <img
                        src={characterImageUrl || "/placeholder.svg"}
                        alt="캐릭터 이미지"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                {characterSummary.map(({ key, label, icon: Icon }) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {label}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {processedCharacter[key]?.slice(0, 100)}...
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actor Dataset & Weights */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">배우 데이터셋</CardTitle>
                    <CardDescription>
                      총 {actorDataset.length}명 중{" "}
                      <span className="font-semibold text-primary">{selectedActors.size}명</span> 선택됨
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={allCurrentSelected ? deselectAllInCurrentTab : selectAllInCurrentTab}
                  >
                    {allCurrentSelected ? (
                      <>
                        <Square className="mr-2 h-4 w-4" />
                        전체 해제
                      </>
                    ) : (
                      <>
                        <CheckSquare className="mr-2 h-4 w-4" />
                        전체 선택
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full flex-wrap h-auto gap-1 mb-4">
                    <TabsTrigger value="all" className="text-xs">
                      전체 ({actorDataset.length})
                    </TabsTrigger>
                    {agencies.map((agency) => (
                      <TabsTrigger key={agency} value={agency} className="text-xs">
                        {AGENCY_NAMES[agency] || agency} ({actorsByAgency[agency]?.length || 0})
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                    {currentActors.map((actor, index) => (
                      <div key={`${actor.name}-${index}`} className="relative">
                        <div
                          className="absolute top-2 left-2 z-10"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleActorSelection(actor.name)
                          }}
                        >
                          <Checkbox checked={selectedActors.has(actor.name)} className="bg-background" />
                        </div>
                        <div
                          className={`cursor-pointer transition-all ${
                            selectedActors.has(actor.name)
                              ? "ring-2 ring-primary rounded-lg"
                              : "opacity-70 hover:opacity-100"
                          }`}
                          onClick={() => toggleActorSelection(actor.name)}
                        >
                          <ActorCard actor={actor} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Tabs>
              </CardContent>
            </Card>

            <WeightSettings weights={weights} onChange={setWeights} />

            <div className="flex flex-col gap-4">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                size="lg"
                className="w-full"
                onClick={handleRecommend}
                disabled={isLoading || selectedActors.size === 0}
              >
                {selectedActors.size > 0 ? `선택한 ${selectedActors.size}명으로 배우 추천받기` : "배우를 선택해주세요"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
