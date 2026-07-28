import Image from "next/image";
import type { Item } from "@/types/item";
import { CATEGORY_MAP } from "@/lib/categories";

export default function ItemCard({ item }: { item: Item }) {
  const cat = CATEGORY_MAP[item.category];

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      {/* 이미지 (사진 없으면 카테고리 이모지 플레이스홀더) */}
      <div
        className="relative flex aspect-square items-center justify-center"
        style={{ backgroundColor: cat.tint }}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 480px) 33vw, 160px"
            className="object-cover"
          />
        ) : (
          <span className="text-4xl">{cat.emoji}</span>
        )}
        {/* 카테고리 뱃지 */}
        <span className="absolute left-2 top-2 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold text-forest">
          {cat.label}
        </span>
      </div>

      {/* 정보 */}
      <div className="px-2.5 pb-2.5 pt-2">
        <p className="truncate text-[13px] font-bold text-ink">{item.name}</p>
        <p className="mt-0.5 flex items-center gap-0.5 text-[11px] text-ink-40">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          {item.region}
        </p>
        <button
          type="button"
          className="mt-2 w-full rounded-lg bg-leaf py-1.5 text-[12px] font-semibold text-white transition-colors active:bg-forest"
        >
          기부 받기
        </button>
      </div>
    </div>
  );
}
