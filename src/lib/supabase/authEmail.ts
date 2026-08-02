import { getSupabaseBrowserClient } from "./client";

/**
 * 구글 계정으로 로그인(간편 로그인).
 * 브라우저가 구글 동의 화면으로 리다이렉트되고, 계정 선택 후 /login 으로 돌아온다.
 * 성공 시 이 함수는 리다이렉트로 페이지를 떠나므로 반환하지 않는다.
 */
export async function signInWithGoogle(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const redirectTo = `${window.location.origin}/login`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) throw error;
}

/** 로그아웃. 로그인 전용 앱이므로 이후에는 비로그인 상태가 된다. */
export async function signOut(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** 현재 로그인 상태(로그인 여부 + 이메일) */
export async function getAuthState(): Promise<{
  loggedIn: boolean;
  email: string | null;
}> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return {
    loggedIn: !!user,
    email: user?.email ?? null,
  };
}
