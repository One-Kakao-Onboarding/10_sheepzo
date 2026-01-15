import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "actors.json")
    const fileContent = await fs.readFile(filePath, "utf-8")
    const data = JSON.parse(fileContent)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error reading actors.json:", error)
    return NextResponse.json({ error: "Failed to load actor data" }, { status: 500 })
  }
}
