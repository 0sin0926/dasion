"use client";

import { useRouter } from "next/navigation";

/** 밀려 올라오는(push) 화면 상단바 — 뒤로가기 + 중앙 타이틀 */
export default function BackHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
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
      <h1 className="text-lg font-bold">{title}</h1>
      <div className="w-8" aria-hidden />
    </header>
  );
}
