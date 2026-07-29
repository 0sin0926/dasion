"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { bootstrapAuth } from "@/lib/supabase/auth";
import { getMyActivity, type ActivityEntry } from "@/lib/items/getMyActivity";
import { CATEGORY_MAP } from "@/lib/categories";
import type { ItemStatus } from "@/types/item";
import type { MatchStatus } from "@/types/profile";

type Filter = "all" | "donated" | "received";
type Tone = "green" | "amber" | "gray";

const ITEM_BADGE: Record<ItemStatus, { label: string; tone: Tone }> = {
  available: { label: "나눔 중", tone: "green" },
  matched: { label: "매칭됨", tone: "amber" },
  completed: { label: "나눔 완료", tone: "gray" },
};

const MATCH_BADGE: Record<MatchStatus, { label: string; tone: Tone }> = {
  pending: { label: "수거 대기", tone: "amber" },
  confirmed: { label: "수거 확정", tone: "green" },
  completed: { label: "완료", tone: "gray" },
};

const TONE_CLS: Record<Tone, string> = {
  green: "bg-[#EAF6EE] text-forest",
  amber: "bg-[#FFF1E5] text-[#B96A25]",
  gray: "bg-gray-100 text-gray-500",
};

/** "2026년 7월 29일" 형태로 날짜 표기 */
function formatDay(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function RecordPage() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const uid = await bootstrapAuth();
        if (!uid) {
          if (alive) setError(true);
          return;
        }
        const data = await getMyActivity(uid);
        if (alive) setEntries(data);
      } catch (err) {
        console.error("[record] 조회 실패:", err);
        if (alive) setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? entries : entries.filter((e) => e.kind === filter)),
    [entries, filter],
  );

  // 날짜별로 그룹핑(이미 최신순 정렬돼 있음)
  const groups = useMemo(() => {
    const map = new Map<string, ActivityEntry[]>();
    for (const e of filtered) {
      const day = formatDay(e.at);
      const arr = map.get(day);
      if (arr) arr.push(e);
      else map.set(day, [e]);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const donatedCount = entries.filter((e) => e.kind === "donated").length;
  const receivedCount = entries.filter((e) => e.kind === "received").length;

  return (
    <>
      <main className="flex-1 pb-28">
        <header className="sticky top-0 z-30 space-y-3 bg-page/95 px-5 pt-5 pb-3 backdrop-blur">
          <h1 className="text-[22px] font-extrabold text-ink">나눔 기록</h1>
          <div className="flex gap-2">
            <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>
              전체 {entries.length}
            </FilterBtn>
            <FilterBtn active={filter === "donated"} onClick={() => setFilter("donated")}>
              기부 {donatedCount}
            </FilterBtn>
            <FilterBtn active={filter === "received"} onClick={() => setFilter("received")}>
              받음 {receivedCount}
            </FilterBtn>
          </div>
        </header>

        {loading ? (
          <p className="px-5 py-16 text-center text-[14px] text-ink-40">불러오는 중이에요…</p>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 px-8 py-16 text-center">
            <span className="text-4xl">😢</span>
            <p className="text-[15px] font-bold text-ink">기록을 불러오지 못했어요</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-2 rounded-xl bg-forest px-6 py-3 text-[14px] font-bold text-white"
            >
              새로고침
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-8 py-16 text-center">
            <span className="text-4xl">📒</span>
            <p className="text-[15px] font-bold text-ink">아직 나눔 기록이 없어요</p>
            <p className="text-[13px] leading-6 text-ink-40">
              물품을 나누거나 받으면 이곳에 차곡차곡 쌓여요.
            </p>
            <Link
              href="/register"
              className="mt-2 rounded-xl bg-forest px-6 py-3 text-[14px] font-bold text-white"
            >
              첫 나눔 등록하기
            </Link>
          </div>
        ) : (
          <div className="space-y-6 px-4 pt-4">
            {groups.map(([day, dayEntries]) => (
              <section key={day}>
                <h2 className="mb-2 px-1 text-[13px] font-bold text-ink-40">{day}</h2>
                <div className="space-y-2.5">
                  {dayEntries.map((e) => (
                    <ActivityRow key={e.key} entry={e} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-[13px] font-bold transition-colors ${
        active
          ? "border-forest bg-forest text-page"
          : "border-forest/20 bg-chip text-teal"
      }`}
    >
      {children}
    </button>
  );
}

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  const cat = CATEGORY_MAP[entry.item.category];
  const donated = entry.kind === "donated";
  const badge = donated
    ? ITEM_BADGE[entry.status as ItemStatus]
    : MATCH_BADGE[entry.status as MatchStatus];

  return (
    <Link
      href={`/items/${entry.item.id}`}
      className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_0.5px_0.5px_0_rgba(0,0,0,0.15)]"
    >
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl"
        style={{ backgroundColor: cat.tint }}
      >
        {entry.item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage 원격 URL
          <img src={entry.item.imageUrl} alt={entry.item.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl">{cat.emoji}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <span
          className={`inline-block rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
            donated ? "bg-[#EAF6EE] text-forest" : "bg-[#FBEEF2] text-[#C24E7B]"
          }`}
        >
          {donated ? "기부함" : "받음"}
        </span>
        <p className="mt-1 truncate text-[14px] font-bold text-ink-60">{entry.item.name}</p>
        <p className="mt-0.5 truncate text-[12px] font-medium text-ink-40">
          {entry.item.region || "지역 미설정"}
        </p>
      </div>

      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${TONE_CLS[badge.tone]}`}>
        {badge.label}
      </span>
    </Link>
  );
}
