import { getSupabaseBrowserClient } from "./client";

/**
 * 현재 로그인된(구글) 세션의 유저 UUID를 반환한다. 로그인 안 돼 있으면 null.
 * (익명 로그인은 더 이상 사용하지 않는다 — 구글 로그인 전용)
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

/**
 * `users` 프로필 행을 보장한다(로그인 유저 한정).
 * - 없으면 기본값으로 생성(이름=게스트 → 이후 닉네임 설정에서 교체), 있으면 그대로 둔다.
 * - items.owner_id 등이 users.id 를 참조하므로 쓰기 전에 반드시 존재해야 한다.
 */
async function ensureProfile(userId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("users").upsert(
    { id: userId, role: "donor_parent", name: "게스트" },
    { onConflict: "id", ignoreDuplicates: true },
  );
  if (error) console.error("[auth] 프로필 보장 실패:", error.message);
}

/**
 * 앱/쓰기 진입 시 호출: 로그인돼 있으면 프로필 행을 보장하고 UUID를 반환한다.
 * 로그인 안 돼 있으면 null (익명 세션을 만들지 않는다).
 */
export async function bootstrapAuth(): Promise<string | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  await ensureProfile(userId);
  return userId;
}
