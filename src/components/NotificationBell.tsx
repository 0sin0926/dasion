"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { bootstrapAuth } from "@/lib/supabase/auth";
import { getUnreadCount } from "@/lib/notifications/notifications";

/** 홈 헤더용 알림 벨 — 안 읽은 알림 수를 빨간 배지로 표시하고, 탭하면 알림함으로 이동. */
export default function NotificationBell() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const uid = await bootstrapAuth();
        if (!alive) return;
        setLoggedIn(!!uid);
        if (!uid) return;
        const count = await getUnreadCount(uid);
        if (alive) setUnread(count);
      } catch (err) {
        console.error("[bell] 안 읽은 알림 조회 실패:", err);
      }
    })();
    return () => {
      alive = false;
    };
  }, [pathname]);

  // 로그인 안 했으면 벨을 숨긴다(알림은 로그인 전용)
  if (!loggedIn) return null;

  return (
    <Link
      href="/notifications"
      aria-label={unread > 0 ? `알림 ${unread}개` : "알림"}
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-forest"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {unread > 0 && (
        <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
