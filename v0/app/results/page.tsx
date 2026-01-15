import { Suspense } from "react"
import { ResultsContent } from "@/components/results-content"

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p>로딩 중...</p>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  )
}
