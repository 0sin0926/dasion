import { notFound } from "next/navigation";
import BackHeader from "@/components/BackHeader";
import { MOCK_ITEMS } from "@/server/mock/items";
import { CATEGORY_MAP } from "@/lib/categories";

// Next 16: params 는 Promise → await 로 읽는다
export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = MOCK_ITEMS.find((i) => i.id === id);
  if (!item) notFound();

  const cat = CATEGORY_MAP[item.category];

  return (
    <div className="flex flex-1 flex-col bg-page">
      <BackHeader title="물품 상세" />

      <main className="flex-1 pb-28">
        {/* 이미지 (사진 없으면 카테고리 이모지 플레이스홀더) */}
        <div
          className="relative flex aspect-square w-full items-center justify-center"
          style={{ backgroundColor: cat.tint }}
        >
          <span className="text-[96px]">{cat.emoji}</span>
          <span className="absolute left-4 top-4 rounded-full bg-[#F9FFFB]/90 px-3 py-1 text-[12px] font-bold text-ink-60">
            {cat.label}
          </span>
        </div>

        {/* 정보 */}
        <div className="px-5 pt-5">
          <h2 className="text-[22px] font-extrabold text-ink">{item.name}</h2>
          <p className="mt-2 flex items-center gap-1 text-[14px] font-medium text-ink-40">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            {item.region}
          </p>

          <div className="mt-6 rounded-2xl bg-chip/60 p-4">
            <p className="text-[13px] leading-6 text-ink-60">
              물품 설명·기부자 메시지는 준비 중이에요. 등록 시 아이가 녹음한 설명이 여기에 표시될 예정입니다.
            </p>
          </div>
        </div>
      </main>

      {/* 하단 고정 CTA */}
      <footer className="fixed bottom-0 left-1/2 z-50 w-full max-w-[var(--frame-max)] -translate-x-1/2 border-t border-line bg-white/90 p-4 pb-[max(16px,env(safe-area-inset-bottom))] backdrop-blur">
        <button
          type="button"
          className="w-full rounded-2xl bg-forest py-4 text-base font-extrabold text-white shadow-[0_4px_20px_rgba(52,103,57,0.35)] transition-transform active:scale-[0.98]"
        >
          기부 받기
        </button>
      </footer>
    </div>
  );
}
