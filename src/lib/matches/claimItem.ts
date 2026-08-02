import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { bootstrapAuth } from "@/lib/supabase/auth";

export interface ClaimItemInput {
  itemId: string;
  /** 감사 편지(선택). 비어 있으면 매칭만 생성 */
  reply?: string;
}

/** claim_item RPC가 raise 하는 에러 코드 → 사용자 안내 메시지 */
const ERROR_MESSAGES: Record<string, string> = {
  not_authenticated:
    "로그인이 필요해요. 구글 로그인 후 다시 시도해주세요.",
  item_not_found: "이미 사라졌거나 없는 물품이에요.",
  cannot_claim_own_item: "내가 등록한 물품은 받을 수 없어요.",
  already_taken: "앗, 방금 다른 친구가 받아갔어요.",
};

/**
 * 물품을 기부 받는다(claim). 익명 세션으로 claim_item RPC를 호출한다.
 * RPC 안에서 matches insert + items.status 갱신 + (편지 있으면) 편지 저장까지 원자적으로 처리된다.
 * 반환: 생성된 match id
 */
export async function claimItem(input: ClaimItemInput): Promise<string> {
  const supabase = getSupabaseBrowserClient();

  const userId = await bootstrapAuth();
  if (!userId) {
    throw new Error(ERROR_MESSAGES.not_authenticated);
  }

  const reply = input.reply?.trim() || null;
  // claim_item 은 setof 가 아닌 단일 composite(public.matches)를 반환하므로
  // PostgREST 가 객체를 그대로 준다(.single() 불필요).
  const { data, error } = await supabase.rpc("claim_item", {
    p_item_id: input.itemId,
    p_reply: reply,
  });

  if (error) {
    // Postgres RAISE 메시지는 error.message 에 코드 문자열로 담겨 온다
    const friendly = ERROR_MESSAGES[error.message];
    throw new Error(
      friendly ?? "기부 받기 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.",
    );
  }

  return (data as { id: string }).id;
}
