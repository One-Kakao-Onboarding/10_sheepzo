import { NextResponse } from "next/server"

const ACTOR_JSON_URL = "https://blobs.vusercontent.net/blob/final_actors-1aOFG5CqB5kp6yte2CUdOWm34evbPg.json"

export async function GET() {
  try {
    const response = await fetch(ACTOR_JSON_URL, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch actor data" }, { status: 500 })
    }

    const text = await response.text()

    // Clean up control characters and truncation markers
    const cleanedText = text
      // Remove control characters except newlines/tabs
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      // Fix truncated strings by removing the truncation marker and closing the string
      .replace(/\.\.\.\s*<truncated>/g, "...")
      .replace(/<truncated>/g, "")

    try {
      const data = JSON.parse(cleanedText)
      return NextResponse.json(data)
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      // Try more aggressive cleanup
      const aggressiveClean = cleanedText.replace(/[\u0000-\u001F\u007F-\u009F]/g, "")

      const data = JSON.parse(aggressiveClean)
      return NextResponse.json(data)
    }
  } catch (error) {
    console.error("Error fetching actors:", error)
    return NextResponse.json({ error: "Failed to load actor data" }, { status: 500 })
  }
}
