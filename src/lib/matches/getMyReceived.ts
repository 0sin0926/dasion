import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CategoryKey, ItemStatus } from "@/types/item";
import type { MatchStatus, ReceivedItem } from "@/types/profile";

interface Row {
  id: string;
  status: MatchStatus;
  matched_at: string;
  item: {
    id: string;
    name: string;
    category: CategoryKey;
    region: string | null;
    photo_urls: string[] | null;
    status: ItemStatus;
  } | null;
}

/** 내가 기부 받은 물품 목록(매칭 + 물품 요약), 최신 매칭순. */
export async function getMyReceived(userId: string): Promise<ReceivedItem[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("matches")
    .select(
      "id, status, matched_at, item:items(id, name, category, region, photo_urls, status)",
    )
    .eq("recipient_id", userId)
    .order("matched_at", { ascending: false });
  if (error) throw error;

  // PostgREST 임베드는 타입 추론상 배열로 잡히므로 unknown 경유 캐스팅.
  return (data as unknown as Row[])
    .filter((r) => r.item) // 물품이 삭제된 매칭은 제외
    .map((r) => ({
      matchId: r.id,
      matchStatus: r.status,
      matchedAt: r.matched_at,
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
