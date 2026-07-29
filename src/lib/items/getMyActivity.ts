import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CategoryKey, Item, ItemStatus } from "@/types/item";
import type { MatchStatus } from "@/types/profile";

/** 활동 기록 한 줄 = 내가 등록한 물품 or 내가 받은 물품 */
export interface ActivityEntry {
  key: string;
  kind: "donated" | "received";
  item: Item;
  /** 발생 시각(등록일 또는 매칭일) ISO 문자열 */
  at: string;
  /** 물품 상태(donated) 또는 매칭 상태(received) */
  status: ItemStatus | MatchStatus;
}

interface DonationRow {
  id: string;
  name: string;
  category: CategoryKey;
  region: string | null;
  photo_urls: string[] | null;
  status: ItemStatus;
  created_at: string;
}

interface MatchRow {
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

function toItem(r: {
  id: string;
  name: string;
  category: CategoryKey;
  region: string | null;
  photo_urls: string[] | null;
  status: ItemStatus;
}): Item {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    region: r.region ?? "",
    imageUrl: r.photo_urls?.[0],
    status: r.status,
  };
}

/**
 * 내 나눔 활동 기록: 내가 등록한 물품(기부)과 내가 받은 물품(수령)을
 * 하나의 타임라인으로 합쳐 최신순으로 반환한다. (기록 탭 전용)
 */
export async function getMyActivity(userId: string): Promise<ActivityEntry[]> {
  const supabase = getSupabaseBrowserClient();

  const [donations, matches] = await Promise.all([
    supabase
      .from("items")
      .select("id, name, category, region, photo_urls, status, created_at")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("matches")
      .select(
        "id, status, matched_at, item:items(id, name, category, region, photo_urls, status)",
      )
      .eq("recipient_id", userId)
      .order("matched_at", { ascending: false }),
  ]);

  if (donations.error) throw donations.error;
  if (matches.error) throw matches.error;

  const donated: ActivityEntry[] = (donations.data as DonationRow[]).map((r) => ({
    key: `d-${r.id}`,
    kind: "donated",
    item: toItem(r),
    at: r.created_at,
    status: r.status,
  }));

  const received: ActivityEntry[] = (matches.data as unknown as MatchRow[])
    .filter((r) => r.item)
    .map((r) => ({
      key: `r-${r.id}`,
      kind: "received",
      item: toItem(r.item!),
      at: r.matched_at,
      status: r.status,
    }));

  return [...donated, ...received].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
}
