"use client";

import { useState } from "react";
import type { Item, CategoryKey } from "@/types/item";
import { FILTER_OPTIONS } from "@/lib/categories";
import ItemCard from "./ItemCard";

export default function ItemFeed({ items }: { items: Item[] }) {
  const [selected, setSelected] = useState<CategoryKey | "all">("all");

  const filtered =
    selected === "all" ? items : items.filter((i) => i.category === selected);

  return (
    <section className="pt-4">
      {/* 카테고리 필터 (가로 스크롤) */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-1">
        {FILTER_OPTIONS.map((opt) => {
          const active = opt.key === selected;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSelected(opt.key)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors ${
                active
                  ? "border-forest bg-forest text-white"
                  : "border-line bg-white text-ink-60"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* 물품 그리드 */}
      <div className="px-5 pt-4">
        <h2 className="mb-3 text-lg font-bold text-ink">기부 물품</h2>
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-40">
            해당 카테고리에 등록된 물품이 아직 없어요.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
