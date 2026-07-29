// 음성 → 텍스트(+정리) 라우트.
// 아이가 녹음한 오디오를 Gemini에 직접 넣어 전사 + 자연스러운 글로 정리해서 돌려준다.
// (Gemini는 오디오를 직접 입력받으므로 STT와 생성이 한 번의 호출로 끝난다.)
//
// mode:
//   - "describe": 물품 소개 설명글
//   - "letter":   받을 친구에게 보내는 편지글

const BASE = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = "models/gemini-flash-latest";

const PROMPTS: Record<string, string> = {
  describe: `아이가 자신이 기부할 물건을 음성으로 소개했어요. 음성 내용을 바탕으로 물건을 소개하는 따뜻하고 자연스러운 한국어 설명글로 정리해주세요.
- 아이가 실제로 말한 내용에만 근거하고, 없는 사실을 지어내지 마세요.
- 2~3문장으로 짧고 읽기 쉽게, 존댓말로.
- 설명글 본문만 출력하세요. 따옴표나 "설명:" 같은 머리말은 붙이지 마세요.`,
  letter: `아이가 물건을 받을 친구에게 전할 편지를 음성으로 말했어요. 음성 내용을 바탕으로 따뜻한 편지글로 정리해주세요.
- 아이가 실제로 말한 내용에 근거하고, 없는 사실을 지어내지 마세요.
- 2~4문장으로, 친근하고 다정한 말투로.
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
