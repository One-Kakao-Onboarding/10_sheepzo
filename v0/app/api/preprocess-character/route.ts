import { generateObject } from "@/lib/llm"
import type { ModelId, MessageContent, ImageInput } from "@/lib/llm"
import { z } from "zod"

// data URL에서 미디어 타입과 base64 데이터 추출
function parseImageData(imageBase64: string): { data: string; mediaType: ImageInput["mediaType"] } {
  const dataUrlMatch = imageBase64.match(/^data:([^;]+);base64,(.+)$/)
  if (dataUrlMatch) {
    const mimeType = dataUrlMatch[1] as ImageInput["mediaType"]
    const data = dataUrlMatch[2]
    // 지원되는 타입만 허용
    if (["image/jpeg", "image/png", "image/gif", "image/webp"].includes(mimeType)) {
      return { data, mediaType: mimeType }
    }
  }
  // data URL 형식이 아니면 그대로 반환 (기본값 jpeg)
  return { data: imageBase64, mediaType: "image/jpeg" }
}

const characterSchema = z.object({
  outer_image: z
    .string()
    .describe(
      "외적 이미지: 나이대, 성별, 첫인상, 목소리 특징, 키/체형 등. 텍스트에 명시되지 않은 정보는 '확인할 수 없음'으로 표기",
    ),
  personality_spectrum: z
    .string()
    .describe("성격 스펙트럼: 겉으로 드러나는 성격, 내면의 성향, 대인관계 특성, 강점과 약점. 텍스트에 근거하여 분석"),
  narrative_role: z
    .string()
    .describe(
      "서사적 역할: 이야기에서의 위치(주인공/조연/악역 등), 직업, 사회적 지위, 성장 가능성, 과거 트라우마 여부",
    ),
  emotion_spectrum: z
    .string()
    .describe(
      "감정 스펙트럼: 감정 표현 방식(절제/폭발), 중요한 연기 디테일(눈빛, 침묵, 호흡 등), 극단적 감정의 빈도와 특징",
    ),
})

export async function POST(req: Request) {
  try {
    const { rawText, imageBase64 } = (await req.json()) as {
      rawText: string
      imageBase64?: string | null
    }

    if (!rawText || rawText.trim().length === 0) {
      return Response.json({ error: "캐릭터 텍스트가 비어있습니다." }, { status: 400 })
    }

    const basePrompt = `캐릭터 설명을 분석하여 4가지 영역으로 구조화해주세요.
${imageBase64 ? "이미지가 제공된 경우 외모 분석에 활용하세요." : ""}
텍스트에 없는 정보는 "확인할 수 없음"으로 표기하세요.

## 캐릭터 설명
${rawText}`

    // 이미지 유무에 따른 모델 선택
    const model: ModelId = imageBase64 ? "gpt-4o" : "claude-sonnet-4-20250514"

    // 메시지 콘텐츠 구성
    let content: MessageContent[]
    if (imageBase64) {
      const { data, mediaType } = parseImageData(imageBase64)
      content = [
        {
          type: "image",
          image: {
            type: "base64",
            data,
            mediaType,
          },
        },
        { type: "text", text: basePrompt },
      ]
    } else {
      content = [{ type: "text", text: basePrompt }]
    }

    const { object } = await generateObject({
      model,
      schema: characterSchema,
      messages: [{ role: "user", content }],
    })

    return Response.json(object)
  } catch (error) {
    console.error("Character preprocessing error:", error)
    return Response.json({ error: "캐릭터 분석에 실패했습니다." }, { status: 500 })
  }
}
