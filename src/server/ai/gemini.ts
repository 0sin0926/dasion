// Gemini 호출 공용 헬퍼. /api/stt, /api/compose 등이 공유한다.
//
// 제공 경로: Google Cloud "Vertex AI" (AI Studio API 키가 아님).
// 이유: AI Studio Gemini API엔 Cloud 무료 크레딧이 적용되지 않지만, Vertex AI는
// Cloud 서비스라 프로젝트의 크레딧으로 결제된다 + 무료 티어(분당 20회)보다 한도가 넓다.
//
// 인증(ADC):
//   - 로컬:  GOOGLE_APPLICATION_CREDENTIALS = 서비스계정 JSON 키 파일 절대경로
//   - Vercel: GCP_SA_JSON = 서비스계정 JSON 전체(문자열). 서버리스라 파일 경로를 못 쓰므로
//            env에 통째로 넣고 파싱해서 credentials로 넘긴다.
// 공통: GOOGLE_CLOUD_PROJECT(프로젝트 ID), GOOGLE_CLOUD_LOCATION(리전, 기본 us-central1).

import { GoogleGenAI, type Part } from "@google/genai";

// Vertex에서는 "models/" 접두사 없이 모델 ID만.
const MODEL = "gemini-2.5-flash-lite";

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

let client: GoogleGenAI | null = null;

/** Vertex AI 클라이언트(싱글턴). 인증/프로젝트 설정을 한곳에서 구성. */
function getClient(): GoogleGenAI {
  if (client) return client;

  const project = process.env.GOOGLE_CLOUD_PROJECT;
  if (!project) {
    throw new GeminiError("server_no_config", "GOOGLE_CLOUD_PROJECT 미설정");
  }
  const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

  // Vercel: JSON 전체를 env에 넣은 경우 → 파싱해서 명시적 credentials로 인증.
  // 로컬: GCP_SA_JSON 없으면 GOOGLE_APPLICATION_CREDENTIALS(파일)로 ADC 자동 인증.
  let googleAuthOptions: { credentials: Record<string, unknown> } | undefined;
  const raw = process.env.GCP_SA_JSON;
  if (raw) {
    try {
      googleAuthOptions = { credentials: JSON.parse(raw) };
    } catch {
      throw new GeminiError("server_no_config", "GCP_SA_JSON 파싱 실패");
    }
  }

  client = new GoogleGenAI({
    vertexai: true,
    project,
    location,
    googleAuthOptions,
  });
  return client;
}

export async function generateFromParts(
  parts: GeminiPart[],
  opts: { temperature?: number } = {},
): Promise<string> {
  try {
    const ai = getClient();
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: parts as Part[] }],
      // 낮은 temperature로 상상/환각 억제(충실한 전사·정리에 가깝게).
      config: { temperature: opts.temperature ?? 0.2 },
    });
    const text = res.text?.trim() ?? "";
    if (!text) throw new GeminiError("empty_result");
    return text;
  } catch (e) {
    if (e instanceof GeminiError) throw e;
    const msg = e instanceof Error ? e.message : String(e);
    // 429/쿼터 → 잠시 후 재시도하면 풀리는 일시적 상황(진짜 실패와 구분).
    if (/RESOURCE_EXHAUSTED|429|quota/i.test(msg)) {
      console.warn("[gemini] rate limited:", msg);
      throw new GeminiError("rate_limited", msg);
    }
    console.error("[gemini] Vertex 호출 실패:", msg);
    throw new GeminiError("gemini_failed", msg);
  }
}

/** GeminiError를 JSON 응답으로 변환(라우트 공용). */
export function geminiErrorResponse(e: unknown): Response {
  if (e instanceof GeminiError) {
    const status =
      e.code === "rate_limited"
        ? 429
        : e.code === "server_no_config" || e.code === "server_no_key"
          ? 500
          : 502;
    return Response.json({ error: e.code, detail: e.detail ?? null }, { status });
  }
  console.error("[gemini] unknown 실패:", e);
  return Response.json({ error: "unknown" }, { status: 500 });
}
