import * as fs from "fs"

// Read the original JSON file
const jsonContent = fs.readFileSync("user_read_only_context/text_attachments/final_actors-1aOFG.json", "utf-8")

// Clean up the content - remove any control characters that shouldn't be in JSON
// Replace actual newlines/tabs within strings (but keep escaped ones)
const cleanedContent = jsonContent
  // Remove any actual control characters (0x00-0x1F except \t, \n, \r which we'll handle separately)
  .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")

try {
  // Try to parse the cleaned JSON
  const actors = JSON.parse(cleanedContent)

  console.log(`[v0] Successfully parsed ${actors.length} actors`)

  // Generate TypeScript file content
  const tsContent = `// Auto-generated actor dataset
// This file contains the actor data in TypeScript format to avoid JSON parsing issues

import type { ActorData } from "@/types/actor"

export const ACTOR_DATASET: ActorData[] = ${JSON.stringify(actors, null, 2)}
`

  // Write to data folder
  fs.writeFileSync("data/actors.ts", tsContent)
  console.log("[v0] Successfully wrote data/actors.ts")
} catch (error) {
  console.error("[v0] Error parsing JSON:", error)

  // If parsing still fails, try a more aggressive cleanup
  const aggressiveClean = jsonContent
    .split("\n")
    .map((line) => line.trim())
    .join("")
    .replace(/[\x00-\x1F]/g, (char) => {
      // Keep only escaped versions
      if (char === "\n") return "\\n"
      if (char === "\r") return "\\r"
      if (char === "\t") return "\\t"
      return ""
    })

  try {
    const actors = JSON.parse(aggressiveClean)
    console.log(`[v0] Aggressive cleanup: parsed ${actors.length} actors`)

    const tsContent = `// Auto-generated actor dataset
import type { ActorData } from "@/types/actor"

export const ACTOR_DATASET: ActorData[] = ${JSON.stringify(actors, null, 2)}
`
    fs.writeFileSync("data/actors.ts", tsContent)
    console.log("[v0] Successfully wrote data/actors.ts")
  } catch (e2) {
    console.error("[v0] Aggressive cleanup also failed:", e2)
  }
}
