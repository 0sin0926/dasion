import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 서버 컴포넌트 읽기 전용 Supabase 클라이언트.
 *
 * - 공개 피드/상세처럼 RLS `select using (true)`로 열려 있는 데이터를 읽는다.
 * - publishable(anon) 키만 사용하므로 RLS를 우회하지 않는다(안전).
 * - 세션을 유지하지 않는다(요청마다 새로 생성해도 무방한 stateless read).
 */
export function createReadClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase 환경변수가 없습니다. NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 를 확인하세요.",
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
