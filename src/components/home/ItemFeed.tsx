"use client";

import { useState } from "react";
import Link from "next/link";
import type { Item, CategoryKey } from "@/types/item";
import { FILTER_OPTIONS } from "@/lib/categories";
import ItemCard from "./ItemCard";

export default function ItemFeed({ items }: { items: Item[] }) {
  const [selected, setSelected] = useState<CategoryKey | "all">("all");

  const filtered =
    selected === "all" ? items : items.filter((i) => i.category === selected);

  return (
    <section className="pt-5">
      {/* 카테고리 필터 — 피그마: padding 5/20, gap 10, radius 20, SemiBold 14
          활성 #346739/흰글씨, 비활성 #DFF4E5 + 딥그린 #005042 + 얇은 그린 보더 */}
      <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-4 pb-1">
        {FILTER_OPTIONS.map((opt) => {
          const active = opt.key === selected;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSelected(opt.key)}
              className={`shrink-0 rounded-[20px] border px-5 py-[5px] text-[14px] font-semibold transition-colors ${
                active
                  ? "border-forest bg-forest text-page"
                  : "border-forest/20 bg-chip text-teal"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* 물품 그리드 — "전체보기 >"는 판매(나눔)중 물품만 모아 보는 페이지로 이동 */}
      <div className="px-4 pt-5">
        <div className="mb-3 flex justify-start">
          <Link
            href="/items?status=available"
            className="inline-flex items-center gap-0.5 text-[14px] font-medium text-ink-40 transition-colors hover:text-forest"
          >
            전체보기
            <span aria-hidden="true">›</span>
          </Link>
        </div>
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-40">
            해당 카테고리에 등록된 물품이 아직 없어요.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-x-[5px] gap-y-[6px]">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
