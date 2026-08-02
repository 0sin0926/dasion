import Image from "next/image";
import Link from "next/link";
import type { Item } from "@/types/item";
import { CATEGORY_MAP } from "@/lib/categories";

export default function ItemCard({ item }: { item: Item }) {
  const cat = CATEGORY_MAP[item.category];
  // 이미 나눔된(matched/completed) 물품은 흑백 처리 + "나눔 완료" 표시
  const done = item.status !== "available";

  return (
    // 카드 전체를 상세(/items/[id])로 연결. 피그마: radius 15, 그림자 0 0.5px 0.5px, 내부 gap 5
    <Link
      href={`/items/${item.id}`}
      className="flex flex-col gap-[5px] rounded-[15px] bg-white p-[7px] shadow-[0_0.5px_0.5px_0_rgba(0,0,0,0.25)]"
    >
      {/* 이미지 (사진 없으면 카테고리 이모지 플레이스홀더) — radius 20 */}
      <div
        className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-[15px] ${
          done ? "grayscale" : ""
        }`}
        style={{ backgroundColor: cat.tint }}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 402px) 33vw, 130px"
            className="object-cover"
          />
        ) : (
          <span className="text-4xl">{cat.emoji}</span>
        )}
        {/* 카테고리 뱃지 — 피그마: #F9FFFB pill, Bold 11 rgba(0,0,0,.68) */}
        <span className="absolute left-1.5 top-1.5 rounded-full bg-[#F9FFFB]/90 px-2 py-0.5 text-[11px] font-bold text-ink-60">
          {cat.label}
        </span>
        {/* 나눔 완료 오버레이 */}
        {done && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-[13px] font-extrabold text-white">
            나눔 완료
          </span>
        )}
      </div>

      {/* 정보 — 제목 Bold 12 rgba(0,0,0,.68), 위치 Bold 10 rgba(0,0,0,.4) */}
      <div className="px-0.5">
        <p className="truncate text-[12px] font-bold text-ink-60">{item.name}</p>
        <p className="mt-0.5 flex items-center gap-0.5 text-[10px] font-bold text-ink-40">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          {item.region}
        </p>
      </div>

      {/* 기부 받기 — 피그마: #346739, radius 20, 그림자 0 4px 4px rgba(0,0,0,.25), ExtraBold 12 흰글씨
          (카드 전체가 Link 이므로 button 대신 span 으로 표기)
          나눔 완료된 물품은 회색으로 비활성 표기 */}
      <span
        className={`block w-full rounded-[12px] py-[7px] text-center text-[12px] font-extrabold ${
          done
            ? "bg-gray-200 text-gray-400"
            : "bg-forest text-white shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]"
        }`}
      >
        {done ? "나눔 완료" : "기부 받기"}
      </span>
    </Link>
  );
}
