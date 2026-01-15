import { Suspense } from "react"
import { MatchContent } from "@/components/match-content"

export default function MatchPage() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        }
      >
        <MatchContent />
      </Suspense>
    </main>
  )
}
