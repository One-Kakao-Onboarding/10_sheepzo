"use client"

import { useEffect, useState } from "react"
import { Loader2, FileText, Brain, Sparkles, User } from "lucide-react"

const loadingSteps = [
  { icon: FileText, text: "캐릭터 텍스트 분석 중..." },
  { icon: User, text: "외적 이미지 추출 중..." },
  { icon: Brain, text: "성격 및 서사 분석 중..." },
  { icon: Sparkles, text: "감정 스펙트럼 생성 중..." },
]

export function CharacterLoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % loadingSteps.length)
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  const CurrentIcon = loadingSteps[currentStep].icon

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Animated Icon */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-primary/30 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <CurrentIcon className="w-10 h-10 text-primary animate-pulse" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">AI 캐릭터 분석 중</h2>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {loadingSteps[currentStep].text}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2">
          {loadingSteps.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentStep ? "bg-primary w-6" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
