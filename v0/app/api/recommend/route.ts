import { generateObject } from "@/lib/llm"
import type { ModelId } from "@/lib/llm"
import { z } from "zod"
import type { ActorData } from "@/types/actor"
import type { CharacterData } from "@/types/character"

const recommendationSchema = z.object({
  recommendations: z.array(
    z.object({
      actorName: z.string().describe("배우 이름"),
      score: z.number().min(0).max(100).describe("종합 적합도 점수 (0-100)"),
      detailedScores: z.object({
        personality: z.number().min(0).max(100).describe("성격/이미지 유사도 점수"),
        roleExperience: z.number().min(0).max(100).describe("역할 경험 적합도 점수"),
        visualMatch: z.number().min(0).max(100).describe("나이대/비주얼 조건 점수"),
      }),
      reasons: z.object({
        personality: z.object({
          headline: z.string().describe("성격/이미지 유사도 핵심 요약 (10자 이내의 임팩트 있는 키워드나 문구)"),
          detail: z.string().describe("성격/이미지 유사도에 대한 구체적인 평가 설명"),
        }),
        roleExperience: z.object({
          headline: z.string().describe("역할 경험 적합도 핵심 요약 (10자 이내의 임팩트 있는 키워드나 문구)"),
          detail: z.string().describe("역할 경험 적합도에 대한 구체적인 평가 설명"),
        }),
        visualMatch: z.object({
          headline: z.string().describe("나이대/비주얼 조건 핵심 요약 (10자 이내의 임팩트 있는 키워드나 문구)"),
          detail: z.string().describe("나이대/비주얼 조건에 대한 구체적인 평가 설명"),
        }),
      }),
      summary: z.string().describe("종합 추천 사유 (1-2문장)"),
    }),
  ),
})

interface Weights {
  personality: number
  roleExperience: number
  visualMatch: number
}

function formatCharacterData(processed: CharacterData): string {
  return `외적: ${processed.outer_image}
성격: ${processed.personality_spectrum}
역할: ${processed.narrative_role}
감정: ${processed.emotion_spectrum}`
}

function formatActorData(actor: ActorData): string {
  const roles =
    actor.narrative_roles
      ?.slice(0, 3)
      .map((r) => `${r.work_title}(${r.role_type})`)
      .join(", ") || "없음"

  return `[${actor.name}] ${actor.age_range}/${actor.gender}, ${actor.impression}, 주요작품: ${roles}`
}

export async function POST(req: Request) {
  try {
    const { characterInfo, processedCharacter, actorDatasets, weights } = (await req.json()) as {
      characterInfo: string
      processedCharacter: CharacterData | null
      actorDatasets: ActorData[]
      weights: Weights
    }

    console.log("[v0] Received actorDatasets count:", actorDatasets?.length)
    console.log("[v0] First actor sample:", actorDatasets?.[0]?.name)

    const actorList = actorDatasets.map(formatActorData).join("\n")

    const characterSection = processedCharacter ? formatCharacterData(processedCharacter) : characterInfo

    const prompt = `캐스팅 전문가로서 캐릭터에 맞는 배우를 추천해주세요.

## 캐릭터
${characterSection}

## 후보 배우
${actorList}

## 가중치
- 성격/이미지: ${weights.personality}%
- 역할 경험: ${weights.roleExperience}%
- 비주얼: ${weights.visualMatch}%

각 배우별로 점수(0-100)와 간단한 평가를 해주세요. headline은 10자 이내로 작성.`

    const model: ModelId = "gemini-3-flash-preview"

    const { object } = await generateObject({
      model,
      schema: recommendationSchema,
      prompt,
    })

    return Response.json(object)
  } catch (error) {
    console.error("Recommendation error:", error)
    return Response.json({ error: "추천 생성에 실패했습니다." }, { status: 500 })
  }
}
