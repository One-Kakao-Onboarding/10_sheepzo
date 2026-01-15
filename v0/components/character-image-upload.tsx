"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CharacterImageUploadProps {
  imageUrl: string | null
  onImageChange: (url: string | null, base64: string | null) => void
}

export function CharacterImageUpload({ imageUrl, onImageChange }: CharacterImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.")
        return
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file)

      // Convert to base64 for AI analysis
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        onImageChange(previewUrl, base64)
      }
      reader.readAsDataURL(file)
    },
    [onImageChange],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleRemove = useCallback(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    onImageChange(null, null)
  }, [imageUrl, onImageChange])

  if (imageUrl) {
    return (
      <div className="relative group">
        <div className="aspect-[3/4] max-w-[200px] rounded-xl overflow-hidden border-2 border-primary/20 shadow-lg">
          <img src={imageUrl || "/placeholder.svg"} alt="캐릭터 이미지" className="w-full h-full object-cover" />
        </div>
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
        <p className="text-xs text-muted-foreground mt-2 text-center">이미지가 AI 분석에 활용됩니다</p>
      </div>
    )
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        relative aspect-[3/4] max-w-[200px] rounded-xl border-2 border-dashed
        flex flex-col items-center justify-center gap-3 cursor-pointer
        transition-all duration-200
        ${isDragging ? "border-primary bg-primary/5 scale-105" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"}
      `}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <div className={`p-3 rounded-full ${isDragging ? "bg-primary/10" : "bg-muted"}`}>
        {isDragging ? (
          <Upload className="h-6 w-6 text-primary" />
        ) : (
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <div className="text-center px-2">
        <p className="text-sm font-medium">캐릭터 이미지</p>
        <p className="text-xs text-muted-foreground mt-1">드래그 또는 클릭하여 업로드</p>
      </div>
    </div>
  )
}
