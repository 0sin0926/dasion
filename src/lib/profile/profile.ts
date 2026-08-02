import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Profile, UserRole } from "@/types/profile";

/**
 * 내 프로필 조회(클라이언트, 익명 세션).
 * users select 정책은 공개(true)라 조회 자체는 read-client로도 되지만,
 * "내 것"을 알려면 세션의 user id가 필요하므로 클라이언트에서 수행한다.
 */
export async function getMyProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, role, name, region, address, avatar_url")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const row = data as {
    id: string;
    role: UserRole;
    name: string;
    region: string | null;
    address: string | null;
    avatar_url: string | null;
  };
  return {
    id: row.id,
    role: row.role,
    name: row.name,
    region: row.region,
    address: row.address,
    avatarUrl: row.avatar_url,
  };
}

export interface ProfileUpdate {
  name: string;
  region: string | null;
  /** 택배 배송용 상세 주소 */
  address: string | null;
  role: UserRole;
  /** 새 사진 URL. undefined면 사진은 건드리지 않음(기존 유지) */
  avatarUrl?: string | null;
}

/** 내 프로필 수정. users_update_own RLS(auth.uid() = id) 충족. */
export async function updateProfile(
  userId: string,
  patch: ProfileUpdate,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const update: Record<string, unknown> = {
    name: patch.name.trim(),
    region: patch.region?.trim() || null,
    address: patch.address?.trim() || null,
    role: patch.role,
  };
  // avatarUrl 키가 넘어온 경우에만 사진 컬럼 갱신(undefined면 미변경)
  if (patch.avatarUrl !== undefined) update.avatar_url = patch.avatarUrl;

  const { error } = await supabase.from("users").update(update).eq("id", userId);
  if (error) throw error;
}
