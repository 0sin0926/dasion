import { getSupabaseBrowserClient } from "./client";

/**
 * 익명 세션을 보장한다.
 * - 이미 세션이 있으면 그대로 사용(같은 기기 = 같은 UUID 유저).
 * - 없으면 익명 로그인으로 새 세션 생성.
 * 반환값: 유저 UUID (실패 시 null).
 */
async function ensureAnonymousSession(): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.user) return session.user.id;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    // 대시보드에서 Anonymous sign-ins 가 꺼져 있으면 여기서 실패한다.
    console.error("[auth] 익명 로그인 실패:", error.message);
    return null;
  }
  return data.user?.id ?? null;
}

/**
 * `users` 프로필 행을 보장한다.
 * - 없으면 기본값으로 생성, 이미 있으면(이름 등 저장해둔 값) 그대로 둔다.
 * - items.owner_id 가 users.id 를 참조하므로 물품 등록 전에 반드시 존재해야 한다.
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
 * 앱 진입/쓰기 직전에 호출: 익명 세션 + 프로필 행을 모두 보장하고 유저 UUID를 반환한다.
 * 세션 생성에 실패하면 null.
 */
export async function bootstrapAuth(): Promise<string | null> {
  const userId = await ensureAnonymousSession();
  if (!userId) return null;
  await ensureProfile(userId);
  return userId;
}
