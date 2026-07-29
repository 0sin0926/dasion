import "server-only";
import { createReadClient } from "@/server/supabase/read-client";
import type { CategoryKey, Item, ItemDetail, ItemStatus } from "@/types/item";

/** items 테이블 로우(스키마와 1:1) */
interface ItemRow {
  id: string;
  name: string;
  category: CategoryKey;
  region: string | null;
  photo_urls: string[] | null;
  voice_url: string | null;
  description: string | null;
  status: ItemStatus;
  created_at: string;
}

const ITEM_COLUMNS =
  "id, name, category, region, photo_urls, voice_url, description, status, created_at";

function toItem(row: ItemRow): Item {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    region: row.region ?? "",
    imageUrl: row.photo_urls?.[0],
    status: row.status,
  };
}

/**
 * 홈 피드용 물품 목록.
 * 기본적으로 나눔 대기(available) 물품만, 최신순으로 반환한다.
 * category를 넘기면 해당 카테고리로 필터링한다.
 */
export async function getItems(category?: CategoryKey): Promise<Item[]> {
  const supabase = createReadClient();
  let query = supabase
    .from("items")
    .select(ITEM_COLUMNS)
    .eq("status", "available")
    .order("created_at", { ascending: false });

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) throw error;
  return (data as ItemRow[]).map(toItem);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 물품 상세: 등록자 이름과 기부자 편지를 함께 조인해서 반환한다. */
export async function getItemById(id: string): Promise<ItemDetail | null> {
  // UUID 형식이 아니면 Postgres가 22P02 에러를 던지므로, 조회 전에 없는 것으로 처리(→ 404).
  if (!UUID_RE.test(id)) return null;

  const supabase = createReadClient();
  const { data, error } = await supabase
    .from("items")
    .select(
      `${ITEM_COLUMNS}, owner_id, owner:users(name), letters(type, content)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  // PostgREST 임베드는 타입 추론상 배열로 잡히므로 unknown 경유 캐스팅.
  const row = data as unknown as ItemRow & {
    owner_id: string;
    owner: { name: string } | null;
    letters: { type: string; content: string }[] | null;
  };

  const donorLetter =
    row.letters?.find((l) => l.type === "donor_letter")?.content ?? null;

  return {
    ...toItem(row),
    ownerId: row.owner_id,
    description: row.description,
    photoUrls: row.photo_urls ?? [],
    voiceUrl: row.voice_url,
    ownerName: row.owner?.name ?? "익명",
    createdAt: row.created_at,
    donorLetter,
  };
}
