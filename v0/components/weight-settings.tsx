"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

export interface Weights {
  personality: number
  roleExperience: number
  visualMatch: number
}

interface WeightSettingsProps {
  weights: Weights
  onChange: (weights: Weights) => void
}

const WEIGHT_LABELS = {
  personality: {
    label: "성격/이미지 유사도",
    description: "캐릭터와 배우의 성격 및 이미지 매칭",
  },
  roleExperience: {
    label: "역할 경험 적합도",
    description: "유사한 역할 수행 경험",
  },
  visualMatch: {
    label: "나이대/비주얼 조건",
    description: "외모, 나이대, 체형 등 시각적 조건",
  },
} as const

export function WeightSettings({ weights, onChange }: WeightSettingsProps) {
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0)

  const handleWeightChange = (key: keyof Weights, value: number[]) => {
    onChange({ ...weights, [key]: value[0] })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>매칭 가중치 설정</CardTitle>
        <CardDescription>추천 기준의 우선순위를 조정하세요. 합계: {totalWeight}%</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {(Object.keys(WEIGHT_LABELS) as Array<keyof Weights>).map((key) => (
          <div key={key} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">{WEIGHT_LABELS[key].label}</Label>
                <p className="text-xs text-muted-foreground">{WEIGHT_LABELS[key].description}</p>
              </div>
              <span className="text-sm font-semibold tabular-nums w-12 text-right">{weights[key]}%</span>
            </div>
            <Slider
              value={[weights[key]]}
              onValueChange={(value) => handleWeightChange(key, value)}
              max={100}
              min={0}
              step={5}
              aria-label={WEIGHT_LABELS[key].label}
            />
          </div>
        ))}

        {totalWeight !== 100 && (
          <p className="text-sm text-amber-600">가중치 합계가 100%가 아닙니다. 현재 합계: {totalWeight}%</p>
        )}
      </CardContent>
    </Card>
  )
}
