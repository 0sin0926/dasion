"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { bootstrapAuth } from "@/lib/supabase/auth";
import { getUnreadCount } from "@/lib/notifications/notifications";

/**
 * 웹브라우저 상단 배너 알림.
 * 안 읽은 알림이 있으면 화면 상단에 "새 알림 N개" 배너를 띄우고, 탭하면 알림함으로 이동한다.
 * - 알림함(/notifications) 화면에서는 표시하지 않는다.
 * - 경로가 바뀔 때마다 안 읽은 개수를 다시 확인한다(읽음 처리 후 자동으로 사라짐).
 * - X 로 닫으면 그 세션 동안 다시 뜨지 않는다.
 */
export default function NotificationBanner() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const uid = await bootstrapAuth();
        if (!uid || !alive) return;
        const count = await getUnreadCount(uid);
        if (alive) setUnread(count);
      } catch (err) {
        console.error("[banner] 안 읽은 알림 조회 실패:", err);
      }
    })();
    return () => {
      alive = false;
    };
  }, [pathname]);

  if (dismissed || unread <= 0 || pathname === "/notifications") return null;

  return (
    <div className="sticky top-0 z-50 flex items-center gap-2 bg-forest px-4 py-2.5 text-white shadow-md">
      <span className="text-base">🔔</span>
      <Link href="/notifications" className="min-w-0 flex-1 truncate text-[13px] font-bold">
        새 알림 {unread}개가 도착했어요! 확인해 보세요 →
      </Link>
      <button
        type="button"
        aria-label="알림 배너 닫기"
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-full px-2 py-0.5 text-[16px] leading-none text-white/80"
      >
        ×
      </button>
    </div>
  );
}
