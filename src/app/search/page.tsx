"use client";

import { useRouter } from "next/navigation";

export default function SearchPage() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col bg-page">
      {/* 검색 입력이 들어간 상단바 */}
      <header className="sticky top-0 z-50 flex items-center gap-2 border-b border-gray-100 bg-white px-3 py-3">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => router.back()}
          className="p-1"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex h-11 flex-1 items-center gap-2.5 rounded-[10px] bg-[#F5F5F5] px-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-muted">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3-3" />
          </svg>
          <input
            autoFocus
            type="text"
            placeholder="어떤 물건을 찾으시나요?"
            className="w-full bg-transparent text-[14px] font-medium text-ink outline-none placeholder:text-muted"
          />
        </div>
      </header>

      {/* 결과 영역 (준비 중) */}
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
        <span className="text-5xl">🔎</span>
        <p className="text-[15px] font-bold text-ink">검색 기능은 준비 중이에요</p>
        <p className="text-[13px] leading-6 text-muted">
          물품 이름·지역으로 원하는 나눔을 찾을 수 있게 준비하고 있어요.
        </p>
      </div>
    </div>
  );
}
