"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BackHeader from "@/components/BackHeader";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { signInWithGoogle } from "@/lib/supabase/authEmail";
import { bootstrapAuth } from "@/lib/supabase/auth";
import { getMyProfile } from "@/lib/profile/profile";
import {
  isNicknameAvailable,
  setNickname,
  validateNickname,
} from "@/lib/profile/nickname";

type Step = "auth" | "nickname";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("auth");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 닉네임 단계
  const [userId, setUserId] = useState<string | null>(null);
  const [nickname, setNicknameInput] = useState("");
  const [nickError, setNickError] = useState<string | null>(null);

  // 리다이렉트 복귀/이미 로그인 상태를 한 번만 처리하기 위한 가드
  const handledRef = useRef(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let alive = true;

    async function afterAuth(uid: string) {
      if (handledRef.current) return;
      handledRef.current = true;
      // 프로필 행 보장 후, 닉네임이 기본값이면 닉네임 설정 단계로
      await bootstrapAuth();
      let name = "";
      try {
        const profile = await getMyProfile(uid);
        name = profile?.name ?? "";
      } catch (err) {
        console.error("[login] 프로필 조회 실패:", err);
      }
      if (!name.trim() || name === "게스트") {
        if (!alive) return;
        setUserId(uid);
        setStep("nickname");
      } else {
        router.replace("/my");
      }
    }

    // 구글 리다이렉트 복귀 시 세션이 잡히면 알림
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && !session.user.is_anonymous) {
        afterAuth(session.user.id);
      }
    });

    // 이미 구글로 로그인된 상태로 들어온 경우도 처리
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && !user.is_anonymous) afterAuth(user.id);
    })();

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle(); // 성공 시 구글로 리다이렉트됨
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "구글 로그인 중 문제가 발생했어요.",
      );
      setBusy(false);
    }
  }

  async function handleSaveNickname() {
    if (!userId) return;
    setNickError(null);
    const formatError = validateNickname(nickname);
    if (formatError) {
      setNickError(formatError);
      return;
    }
    setBusy(true);
    try {
      const available = await isNicknameAvailable(userId, nickname);
      if (!available) {
        setNickError("이미 사용 중인 닉네임이에요. 다른 이름을 정해주세요.");
        setBusy(false);
        return;
      }
      await setNickname(userId, nickname);
      router.replace("/my");
    } catch (err) {
      setNickError(err instanceof Error ? err.message : "저장에 실패했어요.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-page">
      <BackHeader title={step === "nickname" ? "닉네임 설정" : "로그인"} />

      <main className="flex-1 px-6 py-8">
        {step === "auth" ? (
          <>
            <div className="mb-8 mt-6 text-center">
              <p className="text-4xl">🌱</p>
              <h2 className="mt-3 text-[20px] font-extrabold text-ink">
                다시온 시작하기
              </h2>
              <p className="mt-1 text-[13px] leading-6 text-ink-40">
                구글 계정으로 간편하게 로그인하고
                <br />
                닉네임을 정해보세요.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={busy}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-line bg-white py-4 text-[15px] font-bold text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08)] disabled:opacity-60"
            >
              <GoogleGlyph />
              {busy ? "이동 중…" : "구글로 계속하기"}
            </button>

            {error && (
              <p className="mt-4 text-[13px] font-medium text-red-600">{error}</p>
            )}

            <p className="mt-6 text-center text-[12px] leading-5 text-ink-40">
              구글 계정으로 안전하게 로그인해요.
              <br />
              별도 회원가입은 없어요.
            </p>
          </>
        ) : (
          <>
            <div className="mb-6 mt-4 text-center">
              <p className="text-4xl">🙂</p>
              <h2 className="mt-3 text-[20px] font-extrabold text-ink">
                닉네임을 정해주세요
              </h2>
              <p className="mt-1 text-[13px] text-ink-40">
                다른 친구들에게 보여질 이름이에요. (2~12글자, 중복 불가)
              </p>
            </div>

            <input
              type="text"
              value={nickname}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="예: 나눔이"
              className="w-full rounded-xl bg-[#F3F4F3] px-4 py-3 text-sm placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-forest"
            />

            {nickError && (
              <p className="mt-3 text-[13px] font-medium text-red-600">
                {nickError}
              </p>
            )}

            <button
              type="button"
              onClick={handleSaveNickname}
              disabled={busy}
              className="mt-6 w-full rounded-2xl bg-forest py-4 text-base font-bold text-white disabled:opacity-60"
            >
              {busy ? "확인 중…" : "이 닉네임으로 시작하기"}
            </button>
          </>
        )}
      </main>
    </div>
  );
}

/** 구글 브랜드 G 로고 */
function GoogleGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
