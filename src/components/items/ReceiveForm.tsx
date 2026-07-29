"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { claimItem } from "@/lib/matches/claimItem";
import VoiceMic from "@/components/VoiceMic";

interface ReceiveFormProps {
  itemId: string;
  itemName: string;
  emoji: string;
  tint: string;
  imageUrl?: string;
}

/** 기부 받기 + 감사 편지(선택) 폼. 등록 플로우의 편지 카드 스타일을 그대로 사용한다. */
export default function ReceiveForm({
  itemId,
  itemName,
  emoji,
  tint,
  imageUrl,
}: ReceiveFormProps) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await claimItem({ itemId, reply });
      router.push(`/items/${itemId}/receive/complete`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "기부 받기 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-[#F5F5F5] text-[#333333]">
      {/* 상단바 */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => router.back()}
          className="p-1"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">감사 편지 보내기</h1>
        <div className="w-8" aria-hidden />
      </header>

      {/* 본문 */}
      <main className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-4 py-6 pb-28">
        {/* 받는 물품 요약 */}
        <section className="flex items-center gap-4 rounded-[24px] bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
            style={{ backgroundColor: tint }}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage 원격 URL
              <img src={imageUrl} alt={itemName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl">{emoji}</span>
            )}
          </div>
          <div>
            <p className="text-[12px] font-medium text-[#999999]">받을 물품</p>
            <p className="text-base font-bold text-[#333333]">{itemName}</p>
          </div>
        </section>

        {/* 감사 편지 (선택) — 등록 편지 카드와 동일 스타일(주황) */}
        <section className="space-y-4 rounded-[24px] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <h2 className="text-lg font-bold">고마운 마음을 전해보세요!</h2>

          {/* 음성 입력 카드 (주황) — 녹음 → Gemini STT → 아래 편지란 자동 채움 */}
          <div className="flex flex-col items-center space-y-4 rounded-2xl border border-[#FDE3CE] bg-[#FFF1E5] p-6">
            <p className="text-sm font-bold text-[#B96A25]">말씀해보세요!</p>
            <VoiceMic
              mode="letter"
              onResult={setReply}
              accent={{ btn: "#F59E0B", text: "#B96A25" }}
              helper="물품을 준 친구에게 감사 편지를 전해봐요."
            />
          </div>

          {/* 편지 입력 */}
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="물품을 준 친구에게 전하고 싶은 말을 적어주세요. (선택)"
            className="min-h-[120px] w-full resize-none rounded-2xl border border-[#F2F4D5] bg-[#FEFFE5] p-4 text-[13px] leading-relaxed text-[#5B5E3B] placeholder-[#B0B285] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
          />
        </section>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600">
            {error}
          </p>
        )}
      </main>

      {/* 하단 고정 CTA */}
      <footer className="fixed bottom-0 left-1/2 z-50 w-full max-w-[var(--frame-max)] -translate-x-1/2 border-t border-gray-100 bg-white/80 p-4 pb-[max(16px,env(safe-area-inset-bottom))] backdrop-blur-sm">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-2xl bg-[#3D6B3D] py-4 text-base font-bold text-white shadow-[0_4px_20px_rgba(61,107,61,0.4)] transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? "처리 중…" : "기부 받고 편지 보내기"}
        </button>
      </footer>
    </div>
  );
}
