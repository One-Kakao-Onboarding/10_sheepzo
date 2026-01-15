"use client"

import { useEffect, useState } from "react"
import { Loader2, Sparkles, Users, Brain } from "lucide-react"

const loadingSteps = [
  { icon: Users, text: "배우 데이터 분석 중..." },
  { icon: Brain, text: "캐릭터 매칭 계산 중..." },
  { icon: Sparkles, text: "최적의 후보 선정 중..." },
]

export function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % loadingSteps.length)
    }, 2000)
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
          <h2 className="text-xl font-semibold">AI 캐스팅 분석 중</h2>
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
