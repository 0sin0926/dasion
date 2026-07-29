import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CategoryKey, Item, ItemStatus } from "@/types/item";

interface Row {
  id: string;
  name: string;
  category: CategoryKey;
  region: string | null;
  photo_urls: string[] | null;
  status: ItemStatus;
}

/**
 * 내가 등록한(기부한) 물품 목록.
 * 홈 피드와 달리 status 상관없이 전부(대기/매칭/완료) 최신순으로 반환한다.
 */
export async function getMyDonations(userId: string): Promise<Item[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("items")
    .select("id, name, category, region, photo_urls, status")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data as Row[]).map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    region: r.region ?? "",
    imageUrl: r.photo_urls?.[0],
    status: r.status,
  }));
}
