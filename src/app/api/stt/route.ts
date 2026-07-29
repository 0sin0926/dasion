// 음성 → 텍스트(+정리) 라우트.
// 아이가 녹음한 오디오를 Gemini에 직접 넣어 전사 + 자연스러운 글로 정리해서 돌려준다.
// (Gemini는 오디오를 직접 입력받으므로 STT와 생성이 한 번의 호출로 끝난다.)
//
// mode:
//   - "describe": 물품 소개 설명글
//   - "letter":   받을 친구에게 보내는 편지글

const BASE = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = "models/gemini-flash-latest";

// 스타일: "따뜻하게 다듬기" — 말한 내용은 그대로 살리되 말투만 다정하게,
// 새로운 사실은 절대 추가하지 않음. 짧게 말하면 짧게. (환각 방지가 최우선)
const PROMPTS: Record<string, string> = {
  describe: `아이가 자신이 기부할 물건을 음성으로 소개했어요. 아래 규칙에 따라 음성 내용을 물건 소개글로 정리해주세요.

[규칙]
- 아이가 실제로 말한 내용만 사용하세요. 물건의 종류·색깔·상태·크기·용도 등 말하지 않은 정보는 절대 지어내지 마세요.
- 말이 짧으면 짧은 대로 두세요. 억지로 문장을 늘리거나 빈 내용을 채우지 마세요.
- 물건에 대한 정보가 거의 없으면(예: "안녕"처럼 인사만 한 경우), 들린 말만 그대로 다듬어 출력하세요. 소개글을 만들어내지 마세요.
- 말투는 다정하고 자연스럽게, 아이의 마음이 느껴지도록 손보세요. 단, 새로운 사실은 절대 추가하지 마세요.
- 설명글 본문만 출력하세요. 따옴표나 "설명:" 같은 머리말은 붙이지 마세요.`,
  letter: `아이가 물건을 받을 친구에게 전할 편지를 음성으로 말했어요. 아래 규칙에 따라 음성 내용을 편지글로 정리해주세요.

[규칙]
- 아이가 실제로 말한 내용만 사용하세요. 말하지 않은 내용은 절대 지어내지 마세요.
- 말이 짧으면 짧은 대로 두세요. 억지로 늘리지 마세요.
- 할 말이 거의 없으면 들린 말만 그대로 다듬어 출력하세요. 편지를 만들어내지 마세요.
- 말투는 친근하고 다정하게 손보세요. 단, 새로운 사실은 절대 추가하지 마세요.
- 편지 본문만 출력하세요. 받는사람/보내는사람 표기나 머리말은 붙이지 마세요.`,
};

// Gemini 인라인 데이터 요청 상한(약 20MB) 안쪽으로 제한. 짧은 녹음이라 넉넉.
const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "server_no_key" }, { status: 500 });
  }

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

  try {
    const res = await fetch(`${BASE}/${MODEL}:generateContent`, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: base64 } },
            ],
          },
        ],
        // 낮은 temperature로 상상/환각 억제(충실한 전사에 가깝게).
        generationConfig: { temperature: 0.2 },
      }),
    });
    const body = await res.json();
    if (!res.ok) {
      console.error("[stt] gemini error", res.status, body?.error?.message);
      return Response.json(
        { error: "gemini_failed", detail: body?.error?.message ?? null },
        { status: 502 },
      );
    }
    const text: string =
      body?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    if (!text) {
      return Response.json({ error: "empty_result" }, { status: 502 });
    }
    return Response.json({ text });
  } catch (e) {
    console.error("[stt] fetch failed", e);
    return Response.json({ error: "network" }, { status: 502 });
  }
}
