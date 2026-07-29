import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface ItemLettersData {
  /** 기부자 편지 본문 — 당사자만 조회됨(비당사자는 null) */
  donorLetter: string | null;
  /** 수혜자 감사 편지 본문 — 당사자만 조회됨(비당사자는 null) */
  recipientReply: string | null;
  /** 기부자 편지 존재 여부(본문 없이, 받기 전 잠금 UI용) */
  hasDonorLetter: boolean;
}

/**
 * 물품 상세의 편지를 "현재 세션" 기준으로 조회한다.
 * - 본문(content)은 letters RLS(당사자 전용)로 보호 → 비당사자/비로그인은 빈 결과.
 * - 존재 여부(hasDonorLetter)는 security-definer 함수 `item_letter_flags`로 공개 조회
 *   (본문은 감춘 채 "편지가 있다"는 사실만 → 받기 전 잠금 UI 기대감 유지).
 */
export async function getItemLetters(itemId: string): Promise<ItemLettersData> {
  const supabase = getSupabaseBrowserClient();

  const [lettersRes, flagsRes] = await Promise.all([
    supabase.from("letters").select("type, content").eq("item_id", itemId),
    supabase.rpc("item_letter_flags", { p_item_id: itemId }),
  ]);

  if (lettersRes.error) throw lettersRes.error;

  const rows = (lettersRes.data ?? []) as { type: string; content: string }[];
  const donorLetter =
    rows.find((l) => l.type === "donor_letter")?.content ?? null;
  const recipientReply =
    rows.find((l) => l.type === "recipient_reply")?.content ?? null;

  // RPC(returns table)는 배열로 옴 → 첫 행. 실패 시엔 내가 읽은 본문 유무로 폴백.
  const flags = (flagsRes.data as { has_donor_letter: boolean }[] | null)?.[0];
  const hasDonorLetter = flags?.has_donor_letter ?? donorLetter !== null;

  return { donorLetter, recipientReply, hasDonorLetter };
}
