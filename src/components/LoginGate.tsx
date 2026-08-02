"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackHeader from "@/components/BackHeader";
import { getCurrentUserId } from "@/lib/supabase/auth";

/**
 * 로그인이 필요한 화면을 감싸는 게이트.
 * - 확인 중: 잠깐 로딩
 * - 비로그인: "로그인이 필요해요" 안내 + 구글 로그인(/login) 버튼
 * - 로그인: children 렌더
 */
export default function LoginGate({
  title = "로그인이 필요해요",
  message = "이 기능은 구글 로그인 후 이용할 수 있어요.",
  children,
}: {
  title?: string;
  message?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "in" | "out">("checking");

  useEffect(() => {
    let alive = true;
    getCurrentUserId().then((uid) => {
      if (alive) setState(uid ? "in" : "out");
    });
    return () => {
      alive = false;
    };
  }, []);

  if (state === "in") return <>{children}</>;

  return (
    <div className="flex flex-1 flex-col bg-page">
      <BackHeader title="로그인" />
      {state === "checking" ? (
        <p className="px-5 py-16 text-center text-[14px] text-ink-40">
          확인 중이에요…
        </p>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <span className="text-5xl">🔑</span>
          <p className="text-[16px] font-extrabold text-ink">{title}</p>
          <p className="text-[13px] leading-6 text-ink-40">{message}</p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-3 rounded-2xl bg-forest px-8 py-3.5 text-[15px] font-bold text-white"
          >
            구글로 로그인하기
          </button>
        </div>
      )}
    </div>
  );
}
