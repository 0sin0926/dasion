"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CategoryKey } from "@/types/item";
import { registerItem } from "@/lib/items/registerItem";
import VoiceMic from "@/components/VoiceMic";
import GuidedVoiceSheet from "@/components/register/GuidedVoiceSheet";
import { MicIcon } from "@/components/VoiceIcons";

// stitch 디자인(screen.png / code.html) 그대로. 라벨/이모지도 시안과 동일하게 표기.
const REG_CATEGORIES: { key: CategoryKey; emoji: string; label: string }[] = [
  { key: "clothing", emoji: "👕", label: "의류" },
  { key: "books", emoji: "📚", label: "도서, 문구류" },
  { key: "toys", emoji: "🧸", label: "장난감" },
  { key: "sports", emoji: "⚽", label: "스포츠" },
  { key: "baby", emoji: "🍼", label: "유아용" },
  { key: "etc", emoji: "📦", label: "기타" },
];

const MAX_PHOTOS = 5;

interface PhotoItem {
  file: File;
  url: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<CategoryKey | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [letter, setLetter] = useState("");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleAddPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // 같은 파일 다시 선택 가능하도록 초기화
    if (files.length === 0) return;
    setPhotos((prev) => {
      const room = MAX_PHOTOS - prev.length;
      const added = files
        .slice(0, room)
        .map((file) => ({ file, url: URL.createObjectURL(file) }));
      return [...prev, ...added];
    });
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => {
      const target = prev[idx];
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== idx);
    });
  }

  async function handleSubmit() {
    setError(null);
    if (!name.trim()) {
      setError("물품 이름을 적어주세요.");
      return;
    }
    if (!selected) {
      setError("카테고리를 선택해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      await registerItem({
        name,
        category: selected,
        description,
        letter,
        photos: photos.map((p) => p.file),
      });
      photos.forEach((p) => URL.revokeObjectURL(p.url));
      router.push("/register/complete");
    } catch (err) {
      console.error("[register] 등록 실패:", err);
      setError(
        err instanceof Error
          ? err.message
          : "등록 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.",
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
        <h1 className="text-lg font-bold">기부 물품 등록하기</h1>
        <div className="w-8" aria-hidden />
      </header>

      {/* 본문 */}
      <main className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-4 py-6 pb-28">
        {/* 섹션 1 — 카테고리 (가장 먼저 선택 → 질문 가이드가 카테고리별로 나옴) */}
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

        {/* 섹션 2 — 물품 정보 */}
        <section className="space-y-4 rounded-[24px] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <h2 className="text-lg font-bold">무엇을 나누고 싶나요?</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="물품 이름을 적어주세요."
            className="w-full rounded-xl border-none bg-[#F3F4F3] px-4 py-3 text-sm placeholder-[#9CA3AF] focus:ring-2 focus:ring-[#3D6B3D] focus:outline-none"
          />

          {/* 음성 입력 카드 (초록) — 마이크를 누르면 질문 가이드가 열려 질문→답변 진행 */}
          <div className="flex flex-col items-center space-y-3 rounded-2xl border border-[#D9EAD9] bg-[#EFF7EF] p-6">
            <p className="text-sm font-bold text-[#2D5A2D]">말씀해보세요!</p>
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              aria-label="질문 받으며 답하기"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#3D6B3D] shadow-lg transition-transform active:scale-95"
            >
              <MicIcon />
            </button>
            <div className="text-center">
              <p className="text-[13px] font-bold text-[#2D5A2D]">
                마이크를 누르면 질문에 하나씩 답할 수 있어요.
              </p>
              <p className="mt-1 text-[11px] text-[#718E71]">
                질문을 듣고 대답만 하면 설명이 완성돼요!
              </p>
            </div>
          </div>

          {/* 나 혼자 설명하기 (자유 녹음 + 직접 입력) */}
          <div className="flex items-center gap-2">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="text-[12px] font-medium text-[#999999]">
              또는 나 혼자 설명하기
            </span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <VoiceMic
              mode="describe"
              onResult={setDescription}
              accent={{ btn: "#5E9150", text: "#5B7E4E" }}
              helper="직접 말해서 설명할래요"
            />
          </div>

          {/* 설명 입력 */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="물품에 대해 설명해주세요. (예: 5살 때 입던 따뜻한 겨울 내의예요)"
            className="min-h-[120px] w-full resize-none rounded-2xl border border-[#F2F4D5] bg-[#FEFFE5] p-4 text-[13px] leading-relaxed text-[#5B5E3B] placeholder-[#B0B285] focus:outline-none focus:ring-2 focus:ring-[#3D6B3D]"
          />
        </section>

        {/* 섹션 2 — 사진 업로드 */}
        <section className="space-y-4 rounded-[24px] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <h2 className="text-lg font-bold">물품의 모습을 보여주세요!</h2>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleAddPhotos}
          />
          <div className="flex flex-wrap items-start gap-2">
            {photos.map((p, idx) => (
              <div key={p.url} className="relative h-20 w-20">
                {/* eslint-disable-next-line @next/next/no-img-element -- 로컬 미리보기(objectURL) */}
                <img
                  src={p.url}
                  alt={`사진 ${idx + 1}`}
                  className="h-20 w-20 rounded-xl object-cover"
                />
                <button
                  type="button"
                  aria-label="사진 삭제"
                  onClick={() => removePhoto(idx)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[11px] leading-none text-white"
                >
                  ×
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-20 w-20 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#3D6B3D] bg-white"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3D6B3D" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 19C23 19.5523 22.5523 20 22 20H2C1.44772 20 1 19.5523 1 19V7C1 6.44772 1.44772 6 2 6H7L9 3H15L17 6H22C22.5523 6 23 6.44772 23 7V19Z" strokeLinejoin="round" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
                <span className="mt-1 text-[10px] font-bold text-[#3D6B3D]">
                  {photos.length}/{MAX_PHOTOS}
                </span>
              </button>
            )}
          </div>
          <p className="text-[11px] text-[#999999]">최대 5장까지 등록이 가능해요.</p>
        </section>

        {/* 섹션 4 — 편지 */}
        <section className="space-y-4 rounded-[24px] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <h2 className="text-lg font-bold">마음을 함께 전해보세요!</h2>

          {/* 음성 입력 카드 (주황) — 녹음 → Gemini STT → 아래 편지란 자동 채움 */}
          <div className="flex flex-col items-center space-y-4 rounded-2xl border border-[#FDE3CE] bg-[#FFF1E5] p-6">
            <p className="text-sm font-bold text-[#B96A25]">말씀해보세요!</p>
            <VoiceMic
              mode="letter"
              onResult={setLetter}
              accent={{ btn: "#F59E0B", text: "#B96A25" }}
              helper="물품을 받을 친구에게 편지도 함께 전달해봐요."
            />
          </div>

          {/* 편지 입력 */}
          <textarea
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            placeholder="물품을 받을 친구에게 전하고 싶은 말을 적어주세요. (선택)"
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
          {submitting ? "등록 중…" : "물품 등록하기"}
        </button>
      </footer>

      {guideOpen && (
        <GuidedVoiceSheet
          category={selected}
          onComplete={(t) => {
            setDescription(t);
            setGuideOpen(false);
          }}
          onClose={() => setGuideOpen(false)}
        />
      )}
    </div>
  );
}
