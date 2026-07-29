// 음성 → 텍스트(+어미 보정) 라우트.
// 아이가 녹음한 오디오를 Gemini에 직접 넣어 전사하되, 말을 재구성하지 않고
// 흐린 어미/끝맺음만 자연스럽게 보정해서 돌려준다(아이 말투·반말 그대로).
//
// mode:
//   - "describe": 물품 설명 (자유 녹음)
//   - "letter":   받을 친구에게 보내는 편지 (자유 녹음)
//   - "answer":   질문 가이드에서 한 질문에 대한 짧은 답

import {
  generateFromParts,
  geminiErrorResponse,
  type GeminiPart,
} from "@/server/ai/gemini";

// 공통 원칙(어미 보정 스타일). 각 mode 프롬프트에서 재사용.
const RULES = `[규칙]
- 아이가 말한 단어와 순서는 최대한 그대로 유지하세요. 멀쩡한 말을 새로 쓰거나 문장을 합치지 마세요. (단, 문장 끝맺음은 아래 규칙을 반드시 따르세요.)
- 각 문장의 마지막은 반드시 완결된 어미로 맺으세요. 아이가 "~거든", "~는데", "~구", "~고"처럼 뒷말이 잘린 듯 끝냈더라도 그대로 두지 말고, "~어", "~야", "~어!"로 바꿔 완결하세요. (예: "안녕." → "안녕!", "빨간색.." → "빨간색이야!", "좋아했거든" → "좋아했어!", "놀았으면 좋겠구" → "놀았으면 좋겠어!")
- 아이의 말투를 그대로 두세요. 반말이면 반말로. 존댓말로 바꾸지 마세요.
- 잘못 알아들어서 문맥상 전혀 말이 안 되는 단어가 있으면, 발음이 비슷하면서 아이가 하려던 말로 자연스럽게 바로잡으세요. 단, 무슨 말인지 애매하면 그대로 두세요.
- 말하지 않은 새로운 정보(색·상태·종류 등)를 추가하거나 지어내지 마세요. 짧으면 짧은 대로 두세요.`;

const PROMPTS: Record<string, string> = {
  describe: `아이가 자신이 기부할 물건을 음성으로 소개했어요. 아래 규칙에 따라 음성을 글로 옮겨주세요.

${RULES}
- 설명글 본문만 출력하세요. 따옴표나 "설명:" 같은 머리말은 붙이지 마세요.`,
  letter: `아이가 물건을 받을 친구에게 전할 편지를 음성으로 말했어요. 아래 규칙에 따라 음성을 글로 옮겨주세요.

${RULES}
- 편지 본문만 출력하세요. 받는사람/보내는사람 표기나 머리말은 붙이지 마세요.`,
  answer: `아이에게 물건에 대해 질문을 했고, 아이가 음성으로 짧게 답했어요. 아래 규칙에 따라 아이의 답을 글로 옮겨주세요.

${RULES}
- 설명글로 부풀리지 말고, 답한 그대로만 짧게 옮기세요.
- 답 본문만 출력하세요. 머리말이나 따옴표는 붙이지 마세요.`,
};

// Gemini 인라인 데이터 요청 상한(약 20MB) 안쪽으로 제한. 짧은 녹음이라 넉넉.
const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

export async function POST(req: Request) {
  let audio: FormDataEntryValue | null;
  let mode: string;
  try {
    const form = await req.formData();
    audio = form.get("audio");
    mode = String(form.get("mode") ?? "describe");
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  if (!(audio instanceof Blob) || audio.size === 0) {
    return Response.json({ error: "no_audio" }, { status: 400 });
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return Response.json({ error: "audio_too_large" }, { status: 413 });
  }

  const prompt = PROMPTS[mode] ?? PROMPTS.describe;
  const base64 = Buffer.from(await audio.arrayBuffer()).toString("base64");
  const mimeType = audio.type || "audio/webm";
  const parts: GeminiPart[] = [
    { text: prompt },
    { inlineData: { mimeType, data: base64 } },
  ];

  try {
    const text = await generateFromParts(parts, { temperature: 0.2 });
    return Response.json({ text });
  } catch (e) {
    return geminiErrorResponse(e);
  }
}
