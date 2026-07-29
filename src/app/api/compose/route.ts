// 질문 가이드 답변 합치기 라우트(텍스트 → 텍스트, 오디오 없음).
// 아이가 질문마다 답한 짧은 문장들을 모아 하나의 물품 소개글로 자연스럽게 이어준다.
// 답변에 있는 내용만 사용하고, 없는 정보는 지어내지 않는다.

import { CATEGORY_MAP } from "@/lib/categories";
import type { CategoryKey } from "@/types/item";
import { generateFromParts, geminiErrorResponse } from "@/server/ai/gemini";

interface Pair {
  question: string;
  answer: string;
}

export async function POST(req: Request) {
  let category: CategoryKey | undefined;
  let pairs: Pair[];
  try {
    const body = await req.json();
    category = body.category ?? undefined;
    pairs = Array.isArray(body.pairs) ? body.pairs : [];
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const clean = pairs
    .filter((p) => p && typeof p.answer === "string" && p.answer.trim())
    .map((p) => ({ question: String(p.question ?? ""), answer: p.answer.trim() }));

  if (clean.length === 0) {
    return Response.json({ error: "no_answers" }, { status: 400 });
  }

  const label = category ? CATEGORY_MAP[category]?.label : undefined;
  const qa = clean
    .map((p) => `질문: ${p.question}\n답: ${p.answer}`)
    .join("\n\n");

  const prompt = `아래는 아이가 자기 물건에 대해 질문에 답한 내용이야. 이 답변들만 사용해서 물건을 소개하는 짧고 따뜻한 글로 자연스럽게 이어줘.
${label ? `참고로 이 물건의 종류는 "${label}"이야.\n` : ""}
[규칙]
- 아이가 답한 내용만 사용하고, 없는 정보(색·상태·종류 등)는 절대 지어내지 마.
- 답이 없는 내용은 그냥 빼.
- 말투는 아이 목소리 그대로 반말로. 2~4문장으로 짧게.
- 소개글 본문만 출력해. 머리말이나 따옴표는 붙이지 마.

${qa}`;

  try {
    const text = await generateFromParts([{ text: prompt }], {
      temperature: 0.2,
    });
    return Response.json({ text });
  } catch (e) {
    return geminiErrorResponse(e);
  }
}
