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

/**
 * 전체 기부 물품 목록(상태 무관, 최신순).
 * onlyCompleted=true 면 이미 나눔된(matched/completed) 물품만 반환한다.
 * (홈 히어로 "기부된 물품"→전체, "나눔 완료"→완료만 이동에 사용)
 */
export async function getAllItems(onlyCompleted = false): Promise<Item[]> {
  const supabase = createReadClient();
  let query = supabase
    .from("items")
    .select(ITEM_COLUMNS)
    .order("created_at", { ascending: false });

  if (onlyCompleted) query = query.in("status", ["matched", "completed"]);

  const { data, error } = await query;
  if (error) throw error;
  return (data as ItemRow[]).map(toItem);
}

export interface CommunityStats {
  /** 기부된 물품 — 등록된 전체 items 수 */
  donated: number;
  /** 참여 가정 — 가입(익명 포함)된 전체 users 수 */
  families: number;
  /** 나눔 완료 — 실제 전달(매칭)된 건수 */
  completed: number;
}

/**
 * 홈 히어로 커뮤니티 통계. 세 테이블의 행 수를 count 로 집계한다.
 * (RLS select 는 모두 공개(true)라 read-client 로 집계 가능)
 */
export async function getCommunityStats(): Promise<CommunityStats> {
  const supabase = createReadClient();
  const [items, users, matches] = await Promise.all([
    supabase.from("items").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("matches").select("id", { count: "exact", head: true }),
  ]);
  return {
    donated: items.count ?? 0,
    families: users.count ?? 0,
    completed: matches.count ?? 0,
  };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 물품 상세: 등록자 이름 등 공개 정보를 반환한다.
 * 편지 본문은 당사자만 볼 수 있어야 하므로(letters RLS) 여기서 조인하지 않고,
 * 상세 화면에서 세션 기준 클라이언트(`getItemLetters`)로 따로 조회한다.
 */
export async function getItemById(id: string): Promise<ItemDetail | null> {
  // UUID 형식이 아니면 Postgres가 22P02 에러를 던지므로, 조회 전에 없는 것으로 처리(→ 404).
  if (!UUID_RE.test(id)) return null;

  const supabase = createReadClient();
  const { data, error } = await supabase
    .from("items")
    .select(`${ITEM_COLUMNS}, owner_id, owner:users(name)`)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  // PostgREST 임베드는 타입 추론상 배열로 잡히므로 unknown 경유 캐스팅.
  const row = data as unknown as ItemRow & {
    owner_id: string;
    owner: { name: string } | null;
  };

  return {
    ...toItem(row),
    ownerId: row.owner_id,
    description: row.description,
    photoUrls: row.photo_urls ?? [],
    voiceUrl: row.voice_url,
    ownerName: row.owner?.name ?? "익명",
    createdAt: row.created_at,
  };
}
