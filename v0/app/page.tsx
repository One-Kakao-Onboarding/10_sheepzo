"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CoverPage } from "@/components/cover-page"
import { CharacterAnalysisPage } from "@/components/character-analysis-page"

export default function Home() {
  const [showCover, setShowCover] = useState(true)

  return (
    <main className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {showCover ? (
          <motion.div key="cover" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <CoverPage onStart={() => setShowCover(false)} />
          </motion.div>
        ) : (
          <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <CharacterAnalysisPage />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
