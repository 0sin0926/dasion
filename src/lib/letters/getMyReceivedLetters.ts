import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CategoryKey, ItemStatus } from "@/types/item";
import type { ReceivedLetter } from "@/types/profile";

interface Row {
  id: string;
  content: string;
  created_at: string;
  author: { name: string } | null;
  item: {
    id: string;
    name: string;
    category: CategoryKey;
    region: string | null;
    photo_urls: string[] | null;
    status: ItemStatus;
  } | null;
}

/**
 * 내가 기부한 물품에 달린 수혜자 답장(recipient_reply) 편지 목록, 최신순.
 * items!inner 로 owner_id = 나 인 물품의 편지만 필터한다.
 * (letters_select_all RLS 덕분에 조회 자체는 열려 있으므로 별도 정책 불필요)
 */
export async function getMyReceivedLetters(
  userId: string,
): Promise<ReceivedLetter[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("letters")
    .select(
      "id, content, created_at, author:users(name), item:items!inner(id, name, category, region, photo_urls, status, owner_id)",
    )
    .eq("type", "recipient_reply")
    .eq("item.owner_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  // PostgREST 임베드는 타입 추론상 배열로 잡히므로 unknown 경유 캐스팅.
  return (data as unknown as Row[])
    .filter((r) => r.item) // 물품이 삭제된 편지는 제외
    .map((r) => ({
      id: r.id,
      content: r.content,
      createdAt: r.created_at,
      senderName: r.author?.name ?? null,
      item: {
        id: r.item!.id,
        name: r.item!.name,
        category: r.item!.category,
        region: r.item!.region ?? "",
        imageUrl: r.item!.photo_urls?.[0],
        status: r.item!.status,
      },
    }));
}
