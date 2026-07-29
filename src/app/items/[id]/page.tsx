import { notFound } from "next/navigation";
import BackHeader from "@/components/BackHeader";
import ReceiveButton from "@/components/items/ReceiveButton";
import { getItemById } from "@/server/items/queries";
import { CATEGORY_MAP } from "@/lib/categories";

// Next 16: params 는 Promise → await 로 읽는다
export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getItemById(id);
  if (!item) notFound();

  const cat = CATEGORY_MAP[item.category];
  const hasPhoto = item.photoUrls.length > 0;

  return (
    <div className="flex flex-1 flex-col bg-page">
      <BackHeader title="물품 상세" />

      <main className="flex-1 pb-28">
        {/* 이미지 (사진 없으면 카테고리 이모지 플레이스홀더) */}
        <div
          className="relative flex aspect-square w-full items-center justify-center overflow-hidden"
          style={{ backgroundColor: cat.tint }}
        >
          {hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage 원격 URL, next/image 도메인 설정 전까지 img 사용
            <img
              src={item.photoUrls[0]}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[96px]">{cat.emoji}</span>
          )}
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

          {/* 물품 설명 (음성 → STT 변환 텍스트) */}
          <div className="mt-6 rounded-2xl bg-chip/60 p-4">
            <p className="text-[13px] leading-6 text-ink-60">
              {item.description?.trim()
                ? item.description
                : "아직 등록된 설명이 없어요."}
            </p>
          </div>

          {/* 기부자 편지 — 받기 전엔 잠금(내용 숨김)해 기대감을 준다.
              (추후: 기부 받은 수령자에게는 열람 가능하도록 연결) */}
          {item.donorLetter?.trim() && (
            <div className="mt-3 rounded-2xl border border-[#FDE3CE] bg-[#FFF1E5] p-4">
              <p className="mb-1 text-[12px] font-bold text-[#B96A25]">
                💌 마음을 담은 편지
              </p>
              <p className="flex items-center gap-1.5 text-[13px] font-semibold leading-6 text-[#B96A25]">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                기부를 받고 편지를 확인해봐요!
              </p>
            </div>
          )}
        </div>
      </main>

      {/* 하단 고정 CTA */}
      <footer className="fixed bottom-0 left-1/2 z-50 w-full max-w-[var(--frame-max)] -translate-x-1/2 border-t border-line bg-white/90 p-4 pb-[max(16px,env(safe-area-inset-bottom))] backdrop-blur">
        <ReceiveButton
          itemId={item.id}
          ownerId={item.ownerId}
          status={item.status}
        />
      </footer>
    </div>
  );
}
