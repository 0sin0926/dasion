// Gemini API 공용 호출 헬퍼. /api/stt, /api/compose 등이 공유한다.
// 모델/엔드포인트/키 처리와 에러 매핑을 한곳에 모아 중복을 없앤다.

const BASE = "https://generativelanguage.googleapis.com/v1beta";
// gemini-2.5-flash-lite: 오디오 입력 지원 + 무료 티어 한도가 넉넉(경량 모델).
const MODEL = "models/gemini-2.5-flash-lite";

export type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

/** 호출 실패 사유를 코드로 담는 에러. 라우트에서 상태코드로 매핑한다. */
export class GeminiError extends Error {
  constructor(
    public code: string,
    public detail?: string | null,
  ) {
    super(code);
    this.name = "GeminiError";
  }
}

export async function generateFromParts(
  parts: GeminiPart[],
  opts: { temperature?: number } = {},
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new GeminiError("server_no_key");

  let res: Response;
  try {
    res = await fetch(`${BASE}/${MODEL}:generateContent`, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts }],
        // 낮은 temperature로 상상/환각 억제(충실한 전사·정리에 가깝게).
        generationConfig: { temperature: opts.temperature ?? 0.2 },
      }),
    });
  } catch (e) {
    console.error("[gemini] network 실패:", e);
    throw new GeminiError("network");
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = body?.error?.message ?? null;
    // 429: 무료 티어 분당 요청 한도(RPM) 초과. 10여 초 뒤 재시도하면 풀리는
    // 일시적 상황이라 진짜 실패와 구분되는 코드로 던진다.
    if (res.status === 429) {
      console.warn("[gemini] rate limited (429):", detail);
      throw new GeminiError("rate_limited", detail);
    }
    console.error("[gemini] error", res.status, detail);
    throw new GeminiError("gemini_failed", detail);
  }

  const text: string =
    body?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  if (!text) throw new GeminiError("empty_result");
  return text;
}

/** GeminiError를 JSON 응답으로 변환(라우트 공용). */
export function geminiErrorResponse(e: unknown): Response {
  if (e instanceof GeminiError) {
    const status =
      e.code === "server_no_key" ? 500 : e.code === "rate_limited" ? 429 : 502;
    return Response.json({ error: e.code, detail: e.detail ?? null }, { status });
  }
  console.error("[gemini] unknown 실패:", e);
  return Response.json({ error: "unknown" }, { status: 500 });
}
