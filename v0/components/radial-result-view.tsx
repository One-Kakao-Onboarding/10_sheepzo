"use client"
import type { ActorData } from "@/types/actor"
import type { ActorRecommendation } from "./results-content"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Sparkles, Briefcase, Eye, ArrowRight, Trophy, Crown } from "lucide-react"

interface RadialResultViewProps {
  result: ActorRecommendation
  actorData?: ActorData
  rank: number
  characterImageUrl?: string | null
  characterName?: string
  weights?: {
    personality: number
    roleExperience: number
    visualMatch: number
  }
}

export function RadialResultView({
  result,
  actorData,
  rank,
  characterImageUrl,
  characterName,
  weights,
}: RadialResultViewProps) {
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: "bg-amber-500",
          text: "text-amber-500",
          label: "1위 최적 후보",
          gradient: "from-amber-500/20 to-transparent",
        }
      case 2:
        return {
          bg: "bg-slate-400",
          text: "text-slate-400",
          label: "2위",
          gradient: "from-slate-400/20 to-transparent",
        }
      case 3:
        return {
          bg: "bg-amber-700",
          text: "text-amber-700",
          label: "3위",
          gradient: "from-amber-700/20 to-transparent",
        }
      default:
        return {
          bg: "bg-muted",
          text: "text-muted-foreground",
          label: `${rank}위`,
          gradient: "from-muted/20 to-transparent",
        }
    }
  }

  const rankStyle = getRankStyle(rank)

  const calculatedScore = weights
    ? Math.round(
        (result.detailedScores.personality * weights.personality +
          result.detailedScores.roleExperience * weights.roleExperience +
          result.detailedScores.visualMatch * weights.visualMatch) /
          100,
      )
    : result.score

  const scoreItems = [
    {
      key: "personality",
      label: "성격/이미지 유사도",
      score: result.detailedScores.personality,
      weight: weights?.personality || 0,
      headline:
        typeof result.reasons.personality === "object"
          ? result.reasons.personality.headline
          : result.reasons.personality,
      detail:
        typeof result.reasons.personality === "object" ? result.reasons.personality.detail : result.reasons.personality,
      icon: Sparkles,
    },
    {
      key: "roleExperience",
      label: "역할 경험 적합도",
      score: result.detailedScores.roleExperience,
      weight: weights?.roleExperience || 0,
      headline:
        typeof result.reasons.roleExperience === "object"
          ? result.reasons.roleExperience.headline
          : result.reasons.roleExperience,
      detail:
        typeof result.reasons.roleExperience === "object"
          ? result.reasons.roleExperience.detail
          : result.reasons.roleExperience,
      icon: Briefcase,
    },
    {
      key: "visualMatch",
      label: "나이대/비주얼 유사도",
      score: result.detailedScores.visualMatch,
      weight: weights?.visualMatch || 0,
      headline:
        typeof result.reasons.visualMatch === "object"
          ? result.reasons.visualMatch.headline
          : result.reasons.visualMatch,
      detail:
        typeof result.reasons.visualMatch === "object" ? result.reasons.visualMatch.detail : result.reasons.visualMatch,
      icon: Eye,
    },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-500"
    if (score >= 70) return "text-blue-500"
    if (score >= 50) return "text-amber-500"
    return "text-red-500"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return "bg-emerald-500"
    if (score >= 70) return "bg-blue-500"
    if (score >= 50) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {rank === 1 ? (
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 p-6 text-white shadow-xl">
          <div className="absolute top-0 right-0 opacity-20">
            <Crown className="w-32 h-32 -mt-4 -mr-4" />
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm shrink-0">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold mb-2">최적의 캐스팅 후보</h2>
              <p className="text-2xl md:text-3xl font-bold leading-snug">"{result.summary}"</p>
            </div>
            <div className="ml-auto text-right shrink-0">
              <div className="text-5xl font-bold">{calculatedScore}</div>
              <div className="text-sm text-white/80">종합 매칭 점수</div>
            </div>
          </div>
        </div>
      ) : (
        <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">종합 평가</h3>
                <p className="text-xl font-semibold text-foreground leading-relaxed">"{result.summary}"</p>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-4xl font-bold ${getScoreColor(calculatedScore)}`}>{calculatedScore}</div>
                <div className="text-xs text-muted-foreground">종합 매칭 점수</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 캐릭터와 배우 비교 섹션 */}
      <div className="flex items-center justify-center gap-8 mb-10">
        {/* 캐릭터 */}
        <div className="text-center">
          <div className="w-32 h-40 rounded-xl overflow-hidden border-2 border-muted shadow-lg mx-auto mb-3">
            {characterImageUrl ? (
              <img
                src={characterImageUrl || "/placeholder.svg"}
                alt={characterName || "캐릭터"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <User className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </div>
          <p className="text-sm font-medium text-muted-foreground">캐릭터</p>
          <p className="font-semibold">{characterName || "캐릭터"}</p>
        </div>

        {/* 화살표와 매칭 점수 */}
        <div className="flex flex-col items-center gap-2">
          <Badge className={`${rankStyle.bg} text-white px-4 py-1.5 text-sm font-semibold`}>{rankStyle.label}</Badge>
          <div className="flex items-center gap-2">
            <ArrowRight className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* 배우 */}
        <div className="text-center">
          <div
            className={`w-32 h-40 rounded-xl overflow-hidden border-2 ${rank === 1 ? "border-amber-500 ring-2 ring-amber-500/30" : "border-primary"} shadow-lg mx-auto mb-3`}
          >
            {actorData?.profile_image_url ? (
              <img
                src={actorData.profile_image_url || "/placeholder.svg"}
                alt={result.actorName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `/placeholder.svg?height=160&width=128&query=${encodeURIComponent(result.actorName)}`
                }}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <User className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </div>
          <p className="text-sm font-medium text-muted-foreground">추천 배우</p>
          <p className="font-semibold">{result.actorName}</p>
          {actorData && (
            <p className="text-xs text-muted-foreground">
              {actorData.age_range} · {actorData.gender}
            </p>
          )}
        </div>
      </div>

      {/* 점수 카드 섹션 */}
      <div className="grid gap-6 md:grid-cols-3">
        {scoreItems.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.key} className="overflow-hidden">
              <CardContent className="p-0">
                {/* 점수 바 */}
                <div className="h-2 bg-muted">
                  <div
                    className={`h-full ${getScoreBgColor(item.score)} transition-all duration-500`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="font-medium text-sm text-muted-foreground">{item.label}</h3>
                    </div>
                    <span className={`text-2xl font-bold ${getScoreColor(item.score)}`}>{item.score}</span>
                  </div>
                  {/* 소제목 크게 강조 */}
                  <h4 className="text-lg font-bold text-foreground mb-2">{item.headline}</h4>
                  {/* 상세내용 항상 표시 */}
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
