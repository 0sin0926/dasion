"use client";

import { useState } from "react";
import type { Item, CategoryKey } from "@/types/item";
import { FILTER_OPTIONS } from "@/lib/categories";
import ItemCard from "@/components/home/ItemCard";

/**
 * 전체 기부 물품 그리드 + 카테고리 필터.
 * 홈 피드(ItemFeed)와 달리 상태 무관 전체 물품을 보여주며,
 * 나눔 완료된 물품은 ItemCard 안에서 흑백 처리된다.
 */
export default function AllItemsFeed({
  items,
  emptyText = "등록된 물품이 아직 없어요.",
}: {
  items: Item[];
  emptyText?: string;
}) {
  const [selected, setSelected] = useState<CategoryKey | "all">("all");

  const filtered =
    selected === "all" ? items : items.filter((i) => i.category === selected);

  return (
    <section className="pt-4">
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

      <div className="px-4 pt-5">
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink-40">{emptyText}</p>
        ) : (
          <div className="grid grid-cols-3 gap-x-[5px] gap-y-[6px] pb-8">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
