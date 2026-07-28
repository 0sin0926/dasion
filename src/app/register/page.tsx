"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CategoryKey } from "@/types/item";

// stitch 디자인(screen.png / code.html) 그대로. 라벨/이모지도 시안과 동일하게 표기.
const REG_CATEGORIES: { key: CategoryKey; emoji: string; label: string }[] = [
  { key: "clothing", emoji: "👕", label: "의류" },
  { key: "books", emoji: "📚", label: "도서, 문구류" },
  { key: "toys", emoji: "🧸", label: "장난감" },
  { key: "sports", emoji: "⚽", label: "스포츠" },
  { key: "baby", emoji: "🍼", label: "유아용" },
  { key: "etc", emoji: "📦", label: "기타" },
];

function MicIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<CategoryKey | null>(null);

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
        <h1 className="text-lg font-bold">기부 물품 등록하기</h1>
        <div className="w-8" aria-hidden />
      </header>

      {/* 본문 */}
      <main className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-4 py-6 pb-28">
        {/* 섹션 1 — 물품 정보 */}
        <section className="space-y-4 rounded-[24px] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <h2 className="text-lg font-bold">무엇을 나누고 싶나요?</h2>
          <input
            type="text"
            placeholder="물품 이름을 적어주세요."
            className="w-full rounded-xl border-none bg-[#F3F4F3] px-4 py-3 text-sm placeholder-[#9CA3AF] focus:ring-2 focus:ring-[#3D6B3D] focus:outline-none"
          />

          {/* 음성 입력 카드 (초록) */}
          <div className="flex flex-col items-center space-y-4 rounded-2xl border border-[#D9EAD9] bg-[#EFF7EF] p-6">
            <p className="text-sm font-bold text-[#2D5A2D]">말씀해보세요!</p>
            <button
              type="button"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#3D6B3D] shadow-lg transition-transform active:scale-95"
            >
              <MicIcon />
            </button>
            <div className="text-center">
              <p className="text-[13px] font-bold text-[#2D5A2D]">
                아이가 직접 자신의 물품에 대해서 설명해보세요.
              </p>
              <p className="mt-1 text-[11px] text-[#718E71]">
                버튼을 누르고 녹음을 시작하세요!
              </p>
            </div>
          </div>

          {/* 설명(변환 텍스트) 영역 */}
          <div className="min-h-[120px] rounded-2xl border border-[#F2F4D5] bg-[#FEFFE5] p-4">
            <p className="text-[13px] leading-relaxed text-[#7A7D5B]">
              물품에 대해 설명해주세요. 아이가 직접 녹음하면 AI가 텍스트로 변환해드려요.
            </p>
          </div>
        </section>

        {/* 섹션 2 — 사진 업로드 */}
        <section className="space-y-4 rounded-[24px] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <h2 className="text-lg font-bold">물품의 모습을 보여주세요!</h2>
          <div className="flex flex-col items-start">
            <button
              type="button"
              className="flex h-20 w-20 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#3D6B3D] bg-white"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3D6B3D" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
                <path d="M23 19C23 19.5523 22.5523 20 22 20H2C1.44772 20 1 19.5523 1 19V7C1 6.44772 1.44772 6 2 6H7L9 3H15L17 6H22C22.5523 6 23 6.44772 23 7V19Z" strokeLinejoin="round" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              <span className="mt-1 text-[10px] font-bold text-[#3D6B3D]">0/5</span>
            </button>
            <p className="mt-3 text-[11px] text-[#999999]">최대 5장까지 등록이 가능해요.</p>
          </div>
        </section>

        {/* 섹션 3 — 카테고리 */}
        <section className="space-y-4 rounded-[24px] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <h2 className="text-lg font-bold">어떤 물품인가요?</h2>
          <div className="grid grid-cols-3 gap-2">
            {REG_CATEGORIES.map((c) => {
              const active = c.key === selected;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setSelected(c.key)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 transition-colors ${
                    active
                      ? "border-[#3D6B3D] bg-[#EFF7EF]"
                      : "border-[#D1D5DB] bg-white hover:border-[#3D6B3D]"
                  }`}
                >
                  <span className="mb-1 text-2xl">{c.emoji}</span>
                  <span
                    className={`text-[11px] font-medium ${
                      active ? "text-[#3D6B3D]" : "text-gray-600"
                    }`}
                  >
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 섹션 4 — 편지 */}
        <section className="space-y-4 rounded-[24px] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <h2 className="text-lg font-bold">마음을 함께 전해보세요!</h2>

          {/* 음성 입력 카드 (주황) */}
          <div className="flex flex-col items-center space-y-4 rounded-2xl border border-[#FDE3CE] bg-[#FFF1E5] p-6">
            <p className="text-sm font-bold text-[#B96A25]">말씀해보세요!</p>
            <button
              type="button"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F59E0B] shadow-lg transition-transform active:scale-95"
            >
              <MicIcon />
            </button>
            <div className="text-center">
              <p className="text-[13px] font-bold text-[#B96A25]">
                물품을 받을 친구에게 편지도 함께 전달해봐요.
              </p>
              <p className="mt-1 text-[11px] text-[#D68D4A]">
                버튼을 누르고 녹음을 시작하세요!
              </p>
            </div>
          </div>

          {/* 편지 텍스트 영역 */}
          <div className="min-h-[120px] rounded-2xl border border-[#F2F4D5] bg-[#FEFFE5] p-4">
            <p className="text-[13px] leading-relaxed text-[#7A7D5B]">
              물품을 받을 친구에게 마음이 담긴 편지를 함께 전해보세요. 음성을 AI가 텍스트로 변환해드려요.
            </p>
          </div>
        </section>
      </main>

      {/* 하단 고정 CTA */}
      <footer className="fixed bottom-0 left-1/2 z-50 w-full max-w-[var(--frame-max)] -translate-x-1/2 border-t border-gray-100 bg-white/80 p-4 pb-[max(16px,env(safe-area-inset-bottom))] backdrop-blur-sm">
        <button
          type="button"
          onClick={() => router.push("/register/complete")}
          className="w-full rounded-2xl bg-[#3D6B3D] py-4 text-base font-bold text-white shadow-[0_4px_20px_rgba(61,107,61,0.4)] transition-transform active:scale-[0.98]"
        >
          물품 등록하기
        </button>
      </footer>
    </div>
  );
}
