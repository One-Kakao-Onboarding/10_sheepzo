import { Suspense } from "react"
import { CharacterResultContent } from "@/components/character-result-content"

export default function CharacterResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      }
    >
      <CharacterResultContent />
    </Suspense>
  )
}
