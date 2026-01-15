"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChevronDown, ChevronUp, User, Sparkles, Briefcase, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ActorRecommendation, Weights } from "./casting-recommendation"
import type { ActorData } from "@/types/actor"

interface RecommendationResultsProps {
  results: ActorRecommendation[]
  actorDatasets: ActorData[]
  weights: Weights
}

function getRankStyle(index: number) {
  switch (index) {
    case 0:
      return {
        bg: "bg-amber-500",
        text: "text-amber-500",
        border: "border-amber-500/30",
        gradient: "from-amber-500/10",
      }
    case 1:
      return {
        bg: "bg-slate-400",
        text: "text-slate-400",
        border: "border-slate-400/30",
        gradient: "from-slate-400/10",
      }
    case 2:
      return {
        bg: "bg-orange-600",
        text: "text-orange-600",
        border: "border-orange-600/30",
        gradient: "from-orange-600/10",
      }
    default:
      return { bg: "bg-muted", text: "text-muted-foreground", border: "border-border", gradient: "from-muted/10" }
  }
}

function getScoreColor(score: number) {
  if (score >= 85) return "bg-emerald-500"
  if (score >= 70) return "bg-blue-500"
  if (score >= 50) return "bg-amber-500"
  return "bg-red-500"
}

function ScoreBar({
  label,
  score,
  icon: Icon,
  reason,
  weight,
}: {
  label: string
  score: number
  icon: React.ElementType
  reason: string
  weight: number
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{label}</span>
          <Badge variant="outline" className="text-xs px-1.5 py-0">
            {weight}%
          </Badge>
        </div>
        <span className="font-semibold">{score}점</span>
      </div>
      <Progress value={score} className={cn("h-2", getScoreColor(score))} />
      <p className="text-xs text-muted-foreground leading-relaxed">{reason}</p>
    </div>
  )
}

function RecommendationCard({
  result,
  index,
  actorData,
  weights,
}: {
  result: ActorRecommendation
  index: number
  actorData?: ActorData
  weights: Weights
}) {
  const [isExpanded, setIsExpanded] = useState(index === 0)
  const rankStyle = getRankStyle(index)

  const profileImageUrl = actorData?.profile_image_url

  return (
    <div
      className={cn(
        "rounded-xl border-2 overflow-hidden transition-all duration-200",
        rankStyle.border,
        isExpanded && "shadow-lg",
      )}
    >
      {/* Header */}
      <div
        className={cn("flex items-center gap-4 p-4 cursor-pointer bg-gradient-to-r to-transparent", rankStyle.gradient)}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Rank Badge */}
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-lg shrink-0",
            rankStyle.bg,
          )}
        >
          {index + 1}
        </div>

        {/* Profile Image */}
        <div className="w-14 h-14 rounded-full overflow-hidden bg-muted shrink-0 border-2 border-background shadow-sm">
          {profileImageUrl ? (
            <img
              src={profileImageUrl || "/placeholder.svg"}
              alt={result.actorName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none"
                e.currentTarget.parentElement?.classList.add("flex", "items-center", "justify-center")
                const fallback = document.createElement("div")
                fallback.innerHTML =
                  '<svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>'
                e.currentTarget.parentElement?.appendChild(fallback.firstChild as Node)
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Actor Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-lg">{result.actorName}</h3>
            {index === 0 && (
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                최적 후보
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{result.summary}</p>
        </div>

        {/* Score & Expand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div
              className={cn(
                "text-2xl font-bold",
                result.score >= 80
                  ? "text-emerald-600"
                  : result.score >= 60
                    ? "text-blue-600"
                    : "text-muted-foreground",
              )}
            >
              {result.score}
            </div>
            <div className="text-xs text-muted-foreground">종합점수</div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-border/50 space-y-4">
          {/* Score Breakdown */}
          <div className="grid gap-4">
            <ScoreBar
              label="성격/이미지 유사도"
              score={result.detailedScores.personality}
              icon={User}
              reason={result.reasons.personality}
              weight={weights.personality}
            />
            <ScoreBar
              label="역할 경험 적합도"
              score={result.detailedScores.roleExperience}
              icon={Briefcase}
              reason={result.reasons.roleExperience}
              weight={weights.roleExperience}
            />
            <ScoreBar
              label="나이대/비주얼 조건"
              score={result.detailedScores.visualMatch}
              icon={Eye}
              reason={result.reasons.visualMatch}
              weight={weights.visualMatch}
            />
          </div>

          {/* Score Calculation Info */}
          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
            <span className="font-medium">점수 산출: </span>({result.detailedScores.personality} × {weights.personality}
            % +{result.detailedScores.roleExperience} × {weights.roleExperience}% +{result.detailedScores.visualMatch} ×{" "}
            {weights.visualMatch}%) =<span className="font-bold text-foreground ml-1">{result.score}점</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function RecommendationResults({ results, actorDatasets, weights }: RecommendationResultsProps) {
  // 배우 이름으로 ActorData 매칭
  const getActorData = (actorName: string) => {
    return actorDatasets.find((a) => a.name === actorName)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          추천 결과
        </CardTitle>
        <CardDescription>캐릭터에 가장 적합한 배우 TOP {results.length}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {results.map((result, index) => (
          <RecommendationCard
            key={result.actorName}
            result={result}
            index={index}
            actorData={getActorData(result.actorName)}
            weights={weights}
          />
        ))}
      </CardContent>
    </Card>
  )
}
