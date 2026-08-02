import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 브라우저(클라이언트 컴포넌트)용 Supabase 클라이언트.
 *
 * - publishable(anon) 키를 사용하며 RLS로 보호된다.
 * - 익명 인증 세션을 localStorage에 유지 → 등록/기부받기 같은 쓰기 시
 *   auth.uid()가 자동으로 실려 RLS 정책(auth.uid() = owner_id 등)을 만족한다.
 * - 싱글턴: 앱 전체에서 하나의 인스턴스를 공유한다.
 */
let browserClient: SupabaseClient | undefined;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase 환경변수가 없습니다. NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 를 확인하세요.",
    );
  }

  browserClient = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // 구글 OAuth 리다이렉트 복귀 시 URL의 code를 세션으로 교환해야 하므로 켠다.
      detectSessionInUrl: true,
    },
  });
  return browserClient;
}
