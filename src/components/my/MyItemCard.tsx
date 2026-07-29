import Link from "next/link";
import type { Item } from "@/types/item";
import { CATEGORY_MAP } from "@/lib/categories";

/** 상태 뱃지 색/문구 (item.status 또는 match.status) */
function StatusBadge({ label, tone }: { label: string; tone: "green" | "amber" | "gray" }) {
  const cls = {
    green: "bg-[#EAF6EE] text-forest",
    amber: "bg-[#FFF1E5] text-[#B96A25]",
    gray: "bg-gray-100 text-gray-500",
  }[tone];
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${cls}`}>
      {label}
    </span>
  );
}

/** 마이페이지 목록용 물품 행(row). 홈 카드와 달리 CTA 대신 상태 뱃지를 보여준다. */
export default function MyItemCard({
  item,
  badge,
}: {
  item: Item;
  badge: { label: string; tone: "green" | "amber" | "gray" };
}) {
  const cat = CATEGORY_MAP[item.category];

  return (
    <Link
      href={`/items/${item.id}`}
      className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_0.5px_0.5px_0_rgba(0,0,0,0.15)]"
    >
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl"
        style={{ backgroundColor: cat.tint }}
      >
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage 원격 URL
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-3xl">{cat.emoji}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-bold text-ink-60">{item.name}</p>
        <p className="mt-0.5 flex items-center gap-0.5 text-[12px] font-medium text-ink-40">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          {item.region || "지역 미설정"}
        </p>
      </div>

      <StatusBadge label={badge.label} tone={badge.tone} />
    </Link>
  );
}
