import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const DEFAULT_NAME = "게스트";

/** 닉네임 형식 검증 결과(문제 없으면 null) */
export function validateNickname(name: string): string | null {
  const v = name.trim();
  if (v.length < 2) return "닉네임은 2글자 이상이어야 해요.";
  if (v.length > 12) return "닉네임은 12글자 이하로 정해주세요.";
  if (v === DEFAULT_NAME) return "그 닉네임은 사용할 수 없어요.";
  return null;
}

/**
 * 닉네임 사용 가능 여부(대소문자 무시). 나 자신은 제외한다.
 * users select 는 공개(true)라 클라이언트에서 조회 가능.
 */
export async function isNicknameAvailable(
  userId: string,
  name: string,
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .ilike("name", name.trim())
    .neq("id", userId)
    .limit(1);
  if (error) throw error;
  return (data?.length ?? 0) === 0;
}

/**
 * 닉네임을 저장한다. DB 부분 유니크 인덱스(users_name_unique_ci)가 최종 방어선이라,
 * 동시 저장으로 충돌하면 23505 에러 → "이미 사용 중" 으로 매핑한다.
 */
export async function setNickname(userId: string, name: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("users")
    .update({ name: name.trim() })
    .eq("id", userId);
  if (error) {
    if (error.code === "23505") {
      throw new Error("이미 사용 중인 닉네임이에요.");
    }
    throw error;
  }
}
