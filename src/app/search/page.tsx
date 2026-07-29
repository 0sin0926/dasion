"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ItemCard from "@/components/home/ItemCard";
import { browseItems } from "@/lib/items/browseItems";
import { CATEGORIES } from "@/lib/categories";
import type { CategoryKey, Item } from "@/types/item";

const RECENT_KEY = "dasion:recent-search";
const MAX_RECENT = 8;

export default function SearchPage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<CategoryKey | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  // 마지막으로 결과가 반영된 쿼리 키. 현재 쿼리와 다르면 = 아직 조회 중(로딩).
  const [doneKey, setDoneKey] = useState<string | null>(null);

  const trimmed = keyword.trim();
  // 검색어 또는 카테고리가 하나라도 지정되면 "검색 모드"
  const searching = trimmed.length > 0 || category !== null;
  const queryKey = `${trimmed}|${category ?? ""}`;
  const loading = searching && doneKey !== queryKey;

  // 최근 검색어 로드(마운트 1회). SSR 하이드레이션 불일치를 피하려 effect에서 읽는다.
  useEffect(() => {
    let stored: string[] = [];
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) stored = JSON.parse(raw);
    } catch {
      /* 손상/차단된 값 무시 */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 외부(localStorage) 값을 마운트 시 1회 동기화
    if (stored.length) setRecent(stored);
  }, []);

  // 입력/카테고리 변경 → 디바운스 후 조회
  // (로딩은 doneKey≠queryKey 로 파생하므로 여기선 결과 반영만 한다)
  useEffect(() => {
    if (!searching) return;
    let alive = true;
    const t = setTimeout(async () => {
      try {
        const result = await browseItems({
          keyword: trimmed || undefined,
          category: category ?? undefined,
        });
        if (!alive) return;
        setItems(result);
        setError(false);
      } catch (err) {
        console.error("[search] 조회 실패:", err);
        if (!alive) return;
        setError(true);
      } finally {
        if (alive) setDoneKey(queryKey);
      }
    }, 300);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [trimmed, category, searching, queryKey]);

  function pushRecent(term: string) {
    const value = term.trim();
    if (!value) return;
    setRecent((prev) => {
      const next = [value, ...prev.filter((v) => v !== value)].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* 무시 */
      }
      return next;
    });
  }

  function clearRecent() {
    setRecent([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {
      /* 무시 */
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-page">
      <SearchHeader
        keyword={keyword}
        onKeyword={setKeyword}
        onBack={() => router.back()}
        onSubmit={() => pushRecent(trimmed)}
      />

      {/* 카테고리 칩 */}
      <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-4 pb-1 pt-3">
        {CATEGORIES.map((c) => {
          const active = category === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(active ? null : c.key)}
              className={`shrink-0 rounded-[20px] border px-4 py-[6px] text-[13px] font-semibold transition-colors ${
                active
                  ? "border-forest bg-forest text-page"
                  : "border-forest/20 bg-chip text-teal"
              }`}
            >
              {c.emoji} {c.label}
            </button>
          );
        })}
      </div>

      {!searching ? (
        <RecentAndTips
          recent={recent}
          onPick={(term) => setKeyword(term)}
          onClear={clearRecent}
        />
      ) : loading ? (
        <p className="px-5 py-16 text-center text-[14px] text-ink-40">
          찾는 중이에요…
        </p>
      ) : error ? (
        <div className="flex flex-col items-center gap-2 px-8 py-16 text-center">
          <span className="text-4xl">😢</span>
          <p className="text-[14px] font-bold text-ink">검색에 실패했어요</p>
          <p className="text-[13px] text-ink-40">잠시 후 다시 시도해주세요.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-8 py-16 text-center">
          <span className="text-4xl">🔍</span>
          <p className="text-[15px] font-bold text-ink">검색 결과가 없어요</p>
          <p className="text-[13px] leading-6 text-ink-40">
            다른 이름이나 카테고리로 다시 찾아보세요.
          </p>
        </div>
      ) : (
        <div className="px-4 pt-4">
          <p className="mb-3 text-[13px] font-bold text-ink-40">
            나눔 대기 {items.length}건
          </p>
          <div className="grid grid-cols-3 gap-x-[5px] gap-y-[6px] pb-8">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchHeader({
  keyword,
  onKeyword,
  onBack,
  onSubmit,
}: {
  keyword: string;
  onKeyword: (v: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <header className="sticky top-0 z-50 flex items-center gap-2 border-b border-gray-100 bg-white px-3 py-3">
      <button type="button" aria-label="뒤로가기" onClick={onBack} className="p-1">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <form
        className="flex h-11 flex-1 items-center gap-2.5 rounded-[10px] bg-[#F5F5F5] px-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
          inputRef.current?.blur();
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-muted">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3-3" />
        </svg>
        <input
          ref={inputRef}
          autoFocus
          type="text"
          value={keyword}
          onChange={(e) => onKeyword(e.target.value)}
          placeholder="어떤 물건을 찾으시나요?"
          enterKeyHint="search"
          className="w-full bg-transparent text-[14px] font-medium text-ink outline-none placeholder:text-muted"
        />
        {keyword && (
          <button
            type="button"
            aria-label="지우기"
            onClick={() => onKeyword("")}
            className="shrink-0 text-muted"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <path d="m9 9 6 6M15 9l-6 6" />
            </svg>
          </button>
        )}
      </form>
    </header>
  );
}

function RecentAndTips({
  recent,
  onPick,
  onClear,
}: {
  recent: string[];
  onPick: (term: string) => void;
  onClear: () => void;
}) {
  const suggestions = useMemo(() => ["패딩", "동화책", "블록", "책상", "운동화"], []);

  return (
    <div className="flex flex-1 flex-col gap-6 px-5 py-6">
      {recent.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-ink">최근 검색어</h2>
            <button type="button" onClick={onClear} className="text-[12px] font-medium text-ink-40">
              전체 삭제
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recent.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => onPick(term)}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-[13px] font-medium text-ink-60"
              >
                {term}
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-[14px] font-bold text-ink">이런 물건은 어때요?</h2>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => onPick(term)}
              className="rounded-full bg-chip px-3 py-1.5 text-[13px] font-medium text-teal"
            >
              {term}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
