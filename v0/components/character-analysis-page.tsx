"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Upload, FileText, X } from "lucide-react"
import { CharacterImageUpload } from "@/components/character-image-upload"
import { CharacterLoadingScreen } from "@/components/character-loading-screen"

function generateCacheKey(text: string, hasImage: boolean): string {
  const normalized = text.trim().toLowerCase().slice(0, 500)
  let hash = 0
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return `char_analysis_${hash}_${hasImage}`
}

function getPreviewText(text: string, maxLength = 300): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function CharacterAnalysisPage() {
  const router = useRouter()
  const [characterInfo, setCharacterInfo] = useState("")
  const [characterImageUrl, setCharacterImageUrl] = useState<string | null>(null)
  const [characterImageBase64, setCharacterImageBase64] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [isFileUploaded, setIsFileUploaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (url: string | null, base64: string | null) => {
    setCharacterImageUrl(url)
    setCharacterImageBase64(base64)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("text/") && !file.name.endsWith(".txt") && !file.name.endsWith(".md")) {
      setError("텍스트 파일(.txt, .md)만 업로드 가능합니다.")
      return
    }

    try {
      const text = await file.text()
      setCharacterInfo(text)
      setUploadedFileName(file.name)
      setIsFileUploaded(true)
      setError(null)
    } catch (err) {
      setError("파일을 읽는 중 오류가 발생했습니다.")
    }
  }

  const handleRemoveFile = () => {
    setCharacterInfo("")
    setUploadedFileName(null)
    setIsFileUploaded(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleAnalyze = async () => {
    if (!characterInfo.trim()) {
      setError("캐릭터 정보를 입력해주세요.")
      return
    }

    setError(null)
    setIsAnalyzing(true)

    try {
      const cacheKey = generateCacheKey(characterInfo, !!characterImageBase64)
      const cached = sessionStorage.getItem(cacheKey)

      if (cached) {
        const cachedData = JSON.parse(cached)
        const dataToPass = {
          characterInfo,
          processedCharacter: cachedData,
          characterImageUrl: characterImageBase64 || null,
          usedCache: true,
        }
        sessionStorage.setItem("characterAnalysisResult", JSON.stringify(dataToPass))

        // 캐시 사용 시에도 7초 로딩 표시
        await new Promise((resolve) => setTimeout(resolve, 7000))

        router.push("/character-result")
        return
      }

      const response = await fetch("/api/preprocess-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: characterInfo,
          imageBase64: characterImageBase64,
        }),
      })

      if (!response.ok) {
        throw new Error("캐릭터 분석에 실패했습니다.")
      }

      const data = await response.json()

      // 캐시 저장
      sessionStorage.setItem(cacheKey, JSON.stringify(data))

      const dataToPass = {
        characterInfo,
        processedCharacter: data,
        characterImageUrl: characterImageBase64 || null,
        usedCache: false,
      }
      sessionStorage.setItem("characterAnalysisResult", JSON.stringify(dataToPass))
      router.push("/character-result")
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.")
      setIsAnalyzing(false)
    }
  }

  const getDisplayText = () => {
    if (isFileUploaded && uploadedFileName) {
      // 파일 업로드 시 미리보기 텍스트 표시
      return getPreviewText(characterInfo, 400)
    }
    return characterInfo
  }

  return (
    <>
      {isAnalyzing && <CharacterLoadingScreen />}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-10">
          <Badge variant="secondary" className="mb-4">
            Step 1 of 2
          </Badge>
          <h1 className="text-3xl font-bold text-foreground mb-2">캐릭터 분석</h1>
          <p className="text-muted-foreground">캐릭터의 특성을 AI가 분석하여 구조화된 데이터로 변환합니다</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">캐릭터 정보 입력</CardTitle>
            <CardDescription>캐릭터의 외모, 성격, 배경, 역할 등 관련 텍스트와 이미지를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Upload - 상단에 배치 */}
            <div className="flex justify-center">
              <CharacterImageUpload imageUrl={characterImageUrl} onImageChange={handleImageChange} />
            </div>

            {/* Text Input - 확대된 영역 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,text/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  텍스트 파일 업로드
                </Button>
                {uploadedFileName && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{uploadedFileName}</span>
                    <span className="text-xs text-muted-foreground">({characterInfo.length}자)</span>
                    <button onClick={handleRemoveFile} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <Textarea
                placeholder="캐릭터에 대한 설명을 입력하세요...&#10;&#10;예시: 30대 중반의 여성 검사. 차분하고 냉정한 성격으로 감정을 잘 드러내지 않는다. 과거 트라우마로 인해 타인을 쉽게 믿지 못하지만, 정의에 대한 신념은 확고하다..."
                value={getDisplayText()}
                onChange={(e) => {
                  if (isFileUploaded) {
                    // 파일 업로드 상태에서 직접 입력 시 파일 모드 해제
                    setIsFileUploaded(false)
                    setUploadedFileName(null)
                  }
                  setCharacterInfo(e.target.value)
                }}
                className="min-h-[350px] resize-none text-base leading-relaxed"
                readOnly={isFileUploaded}
              />

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground space-y-1">
                  {characterInfo.length > 0 && !isFileUploaded && <p>{characterInfo.length}자 입력됨</p>}
                  {characterImageBase64 && <p className="text-primary">이미지가 분석에 포함됩니다</p>}
                </div>
                <Button size="lg" onClick={handleAnalyze} disabled={!characterInfo.trim() || isAnalyzing}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI 분석 시작
                </Button>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
