"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BackHeader from "@/components/BackHeader";
import { bootstrapAuth } from "@/lib/supabase/auth";
import {
  getMyNotifications,
  markAllNotificationsRead,
} from "@/lib/notifications/notifications";
import type { AppNotification } from "@/types/notification";

/** 알림 종류별 아이콘 이모지 */
const TYPE_EMOJI: Record<string, string> = {
  donation_pickup: "🚚",
  delivery_incoming: "📦",
  letter_received: "💌",
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}.${m}.${day} ${hh}:${mm}`;
}

export default function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const uid = await bootstrapAuth();
        if (!uid) {
          if (alive) setNeedLogin(true);
          return;
        }
        const list = await getMyNotifications(uid);
        if (!alive) return;
        setItems(list);
        // 목록을 보여준 뒤 모두 읽음 처리(배지/배너 정리)
        if (list.some((n) => !n.read)) {
          markAllNotificationsRead(uid).catch((err) =>
            console.error("[notifications] 읽음 처리 실패:", err),
          );
        }
      } catch (err) {
        console.error("[notifications] 조회 실패:", err);
        if (alive) setLoadError(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col bg-page">
      <BackHeader title="알림" />
      <main className="flex-1 pb-16">
        {loading ? (
          <p className="px-5 py-16 text-center text-[14px] text-ink-40">
            불러오는 중이에요…
          </p>
        ) : needLogin ? (
          <div className="flex flex-col items-center gap-2 px-8 py-20 text-center">
            <span className="text-4xl">🔑</span>
            <p className="text-[15px] font-bold text-ink">로그인이 필요해요</p>
            <p className="text-[13px] leading-6 text-ink-40">
              구글 로그인하면 알림을 받아볼 수 있어요.
            </p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-2 px-8 py-16 text-center">
            <span className="text-4xl">😢</span>
            <p className="text-[15px] font-bold text-ink">
              알림을 불러오지 못했어요
            </p>
            <p className="text-[13px] leading-6 text-ink-40">
              잠시 후 다시 시도해주세요.
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-8 py-20 text-center">
            <span className="text-4xl">🔔</span>
            <p className="text-[15px] font-bold text-ink">아직 알림이 없어요</p>
            <p className="text-[13px] leading-6 text-ink-40">
              편지나 기부 소식이 오면 여기에 모여요.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {items.map((n) => (
              <NotificationRow key={n.id} n={n} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function NotificationRow({ n }: { n: AppNotification }) {
  const emoji = TYPE_EMOJI[n.type] ?? "🔔";
  const inner = (
    <div
      className={`flex gap-3 px-5 py-4 ${n.read ? "" : "bg-[#EFF7EF]/60"}`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-chip text-lg">
        {emoji}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {!n.read && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-forest" aria-hidden />
          )}
          <p className="truncate text-[14px] font-bold text-ink">{n.title}</p>
        </div>
        {n.body && (
          <p className="mt-1 text-[13px] leading-6 text-ink-60">{n.body}</p>
        )}
        <p className="mt-1 text-[11px] font-medium text-ink-40">
          {formatWhen(n.createdAt)}
        </p>
      </div>
    </div>
  );

  return n.link ? (
    <li>
      <Link href={n.link}>{inner}</Link>
    </li>
  ) : (
    <li>{inner}</li>
  );
}
