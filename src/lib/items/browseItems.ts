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

export interface BrowseFilters {
  /** 물품 이름 부분 일치 검색어 */
  keyword?: string;
  /** 카테고리 필터 */
  category?: CategoryKey;
  /** 지역 접두 일치("서울특별시" → 서울 전체, "서울특별시 강남구" → 해당 구) */
  region?: string;
}

// PostgREST ilike 패턴에 쓰이는 특수문자(% _)를 리터럴로 이스케이프
function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

/**
 * 홈 피드와 동일하게 나눔 대기(available) 물품을 최신순으로 조회하되,
 * 이름/카테고리/지역 필터를 자유롭게 조합한다. (검색·지역 탭 공용)
 * 브라우저 클라이언트를 쓰므로 클라이언트 컴포넌트에서 바로 호출 가능하다.
 */
export async function browseItems(filters: BrowseFilters = {}): Promise<Item[]> {
  const supabase = getSupabaseBrowserClient();
  let query = supabase
    .from("items")
    .select("id, name, category, region, photo_urls, status")
    .eq("status", "available")
    .order("created_at", { ascending: false });

  if (filters.category) query = query.eq("category", filters.category);

  const keyword = filters.keyword?.trim();
  if (keyword) query = query.ilike("name", `%${escapeLike(keyword)}%`);

  const region = filters.region?.trim();
  if (region) query = query.ilike("region", `${escapeLike(region)}%`);

  const { data, error } = await query;
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
