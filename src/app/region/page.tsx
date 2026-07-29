"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import ItemCard from "@/components/home/ItemCard";
import { browseItems } from "@/lib/items/browseItems";
import { bootstrapAuth } from "@/lib/supabase/auth";
import { getMyProfile } from "@/lib/profile/profile";
import {
  SIDO_LIST,
  getSigungu,
  parseRegion,
  formatRegion,
} from "@/lib/regions";
import type { Item } from "@/types/item";

export default function RegionPage() {
  const [sido, setSido] = useState("");
  const [sigungu, setSigungu] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState(false);
  // 마지막으로 결과가 반영된 지역 키. 현재 선택과 다르면 = 조회 중(로딩).
  const [doneKey, setDoneKey] = useState<string | null>(null);
  const regionKey = formatRegion(sido, sigungu); // "" = 전국
  const loading = doneKey !== regionKey;

  // 진입 시 내 프로필의 지역을 기본값으로
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const uid = await bootstrapAuth();
        if (uid) {
          const profile = await getMyProfile(uid);
          if (alive && profile?.region) {
            const { sido: s, sigungu: g } = parseRegion(profile.region);
            setSido(s);
            setSigungu(g);
          }
        }
      } catch (err) {
        console.error("[region] 프로필 조회 실패:", err);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 지역 선택이 바뀔 때마다 물품 조회 (시/도 미선택이면 전국)
  // (로딩은 doneKey≠regionKey 로 파생하므로 여기선 결과 반영만 한다)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const result = await browseItems({ region: regionKey || undefined });
        if (!alive) return;
        setItems(result);
        setError(false);
      } catch (err) {
        console.error("[region] 물품 조회 실패:", err);
        if (!alive) return;
        setError(true);
      } finally {
        if (alive) setDoneKey(regionKey);
      }
    })();
    return () => {
      alive = false;
    };
  }, [regionKey]);

  const sigunguOptions = getSigungu(sido);
  const label = regionKey || "전국";

  return (
    <>
      <main className="flex-1 pb-28">
        <header className="sticky top-0 z-30 space-y-3 bg-page/95 px-5 pt-5 pb-3 backdrop-blur">
          <div className="flex items-center gap-1.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-forest">
              <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            <h1 className="text-[22px] font-extrabold text-ink">지역별 나눔</h1>
          </div>

          {/* 시/도 · 시/군/구 선택 */}
          <div className="grid grid-cols-2 gap-2">
            <select
              value={sido}
              onChange={(e) => {
                setSido(e.target.value);
                setSigungu("");
              }}
              className="w-full rounded-xl bg-[#F3F4F3] px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest"
            >
              <option value="">전국</option>
              {SIDO_LIST.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={sigungu}
              onChange={(e) => setSigungu(e.target.value)}
              disabled={!sido || sigunguOptions.length === 0}
              className="w-full rounded-xl bg-[#F3F4F3] px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest disabled:opacity-50"
            >
              <option value="">
                {sido && sigunguOptions.length === 0 ? "해당 없음" : "전체"}
              </option>
              {sigunguOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </header>

        <div className="px-4 pt-2">
          <p className="mb-3 text-[15px] font-bold text-ink-60">
            <span className="text-forest">{label}</span>
            <span className="text-ink-40"> · 나눔 대기 {items.length}건</span>
          </p>

          {loading ? (
            <p className="py-16 text-center text-[14px] text-ink-40">불러오는 중이에요…</p>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <span className="text-4xl">😢</span>
              <p className="text-[14px] font-bold text-ink">불러오지 못했어요</p>
              <p className="text-[13px] text-ink-40">잠시 후 다시 시도해주세요.</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <span className="text-4xl">🗺️</span>
              <p className="text-[15px] font-bold text-ink">
                {label}에 등록된 나눔이 아직 없어요
              </p>
              <p className="text-[13px] leading-6 text-ink-40">
                다른 지역을 선택하거나 첫 나눔을 등록해보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-x-[5px] gap-y-[6px] pb-4">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
