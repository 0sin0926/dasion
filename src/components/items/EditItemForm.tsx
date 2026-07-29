"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CategoryKey } from "@/types/item";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { updateItem } from "@/lib/items/updateItem";

// 등록 폼과 동일한 카테고리 표기
const REG_CATEGORIES: { key: CategoryKey; emoji: string; label: string }[] = [
  { key: "clothing", emoji: "👕", label: "의류" },
  { key: "books", emoji: "📚", label: "도서, 문구류" },
  { key: "toys", emoji: "🧸", label: "장난감" },
  { key: "sports", emoji: "⚽", label: "스포츠" },
  { key: "baby", emoji: "🍼", label: "유아용" },
  { key: "etc", emoji: "📦", label: "기타" },
];

const MAX_PHOTOS = 5;

/** 사진 슬롯: 기존 사진(url만) 또는 새로 고른 사진(file + objectURL) */
interface PhotoSlot {
  key: string;
  url: string; // 표시용(기존 URL 또는 objectURL)
  file?: File; // 새로 추가한 것만
}

interface EditItemFormProps {
  itemId: string;
  ownerId: string;
  initialName: string;
  initialCategory: CategoryKey;
  initialDescription: string;
  initialPhotoUrls: string[];
}

export default function EditItemForm({
  itemId,
  ownerId,
  initialName,
  initialCategory,
  initialDescription,
  initialPhotoUrls,
}: EditItemFormProps) {
  const router = useRouter();
  const [isOwner, setIsOwner] = useState<boolean | null>(null); // null=확인 중
  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState<CategoryKey>(initialCategory);
  const [description, setDescription] = useState(initialDescription);
  const [photos, setPhotos] = useState<PhotoSlot[]>(
    initialPhotoUrls.map((url) => ({ key: url, url })),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 소유자 확인(익명 세션은 브라우저에만 있으므로 클라이언트에서)
  useEffect(() => {
    let alive = true;
    getSupabaseBrowserClient()
      .auth.getUser()
      .then(({ data }) => {
        if (alive) setIsOwner(data.user?.id === ownerId);
      });
    return () => {
      alive = false;
    };
  }, [ownerId]);

  function handleAddPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setPhotos((prev) => {
      const room = MAX_PHOTOS - prev.length;
      const added = files.slice(0, room).map((file) => ({
        key: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        file,
      }));
      return [...prev, ...added];
    });
  }

  function removePhoto(key: string) {
    setPhotos((prev) => {
      const target = prev.find((p) => p.key === key);
      if (target?.file) URL.revokeObjectURL(target.url); // 새 파일 미리보기만 해제
      return prev.filter((p) => p.key !== key);
    });
  }

  async function handleSubmit() {
    setError(null);
    if (!name.trim()) {
      setError("물품 이름을 적어주세요.");
      return;
    }
    setSubmitting(true);
    try {
      await updateItem({
        itemId,
        name,
        category,
        description,
        photos: photos.map((p) => p.file ?? p.url),
      });
      photos.forEach((p) => p.file && URL.revokeObjectURL(p.url));
      router.push(`/items/${itemId}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "수정 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.",
      );
      setSubmitting(false);
    }
  }

  const header = (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
      <button type="button" aria-label="뒤로가기" onClick={() => router.back()} className="p-1">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <h1 className="text-lg font-bold">물품 수정하기</h1>
      <div className="w-8" aria-hidden />
    </header>
  );

  // 소유자 아님 → 수정 불가 안내
  if (isOwner === false) {
    return (
      <div className="flex flex-1 flex-col bg-[#F5F5F5] text-[#333333]">
        {header}
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <span className="text-5xl">🔒</span>
          <p className="text-[15px] font-bold text-ink">본인이 등록한 물품만 수정할 수 있어요.</p>
          <Link href={`/items/${itemId}`} className="mt-2 rounded-xl bg-forest px-6 py-3 text-[14px] font-bold text-white">
            물품 보기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-[#F5F5F5] text-[#333333]">
      {header}

      <main className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-4 py-6 pb-28">
        {/* 물품 정보 */}
        <section className="space-y-4 rounded-[24px] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <h2 className="text-lg font-bold">무엇을 나누고 싶나요?</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="물품 이름을 적어주세요."
            className="w-full rounded-xl border-none bg-[#F3F4F3] px-4 py-3 text-sm placeholder-[#9CA3AF] focus:ring-2 focus:ring-[#3D6B3D] focus:outline-none"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="물품에 대해 설명해주세요."
            className="min-h-[120px] w-full resize-none rounded-2xl border border-[#F2F4D5] bg-[#FEFFE5] p-4 text-[13px] leading-relaxed text-[#5B5E3B] placeholder-[#B0B285] focus:outline-none focus:ring-2 focus:ring-[#3D6B3D]"
          />
        </section>

        {/* 사진 */}
        <section className="space-y-4 rounded-[24px] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <h2 className="text-lg font-bold">물품의 모습을 보여주세요!</h2>
          <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleAddPhotos} />
          <div className="flex flex-wrap items-start gap-2">
            {photos.map((p, idx) => (
              <div key={p.key} className="relative h-20 w-20">
                {/* eslint-disable-next-line @next/next/no-img-element -- 기존 Storage URL 또는 로컬 미리보기 */}
                <img src={p.url} alt={`사진 ${idx + 1}`} className="h-20 w-20 rounded-xl object-cover" />
                <button
                  type="button"
                  aria-label="사진 삭제"
                  onClick={() => removePhoto(p.key)}
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
                <span className="mt-1 text-[10px] font-bold text-[#3D6B3D]">{photos.length}/{MAX_PHOTOS}</span>
              </button>
            )}
          </div>
          <p className="text-[11px] text-[#999999]">최대 5장까지 등록이 가능해요.</p>
        </section>

        {/* 카테고리 */}
        <section className="space-y-4 rounded-[24px] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <h2 className="text-lg font-bold">어떤 물품인가요?</h2>
          <div className="grid grid-cols-3 gap-2">
            {REG_CATEGORIES.map((c) => {
              const active = c.key === category;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(c.key)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 transition-colors ${
                    active ? "border-[#3D6B3D] bg-[#EFF7EF]" : "border-[#D1D5DB] bg-white hover:border-[#3D6B3D]"
                  }`}
                >
                  <span className="mb-1 text-2xl">{c.emoji}</span>
                  <span className={`text-[11px] font-medium ${active ? "text-[#3D6B3D]" : "text-gray-600"}`}>
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600">{error}</p>
        )}
      </main>

      <footer className="fixed bottom-0 left-1/2 z-50 w-full max-w-[var(--frame-max)] -translate-x-1/2 border-t border-gray-100 bg-white/80 p-4 pb-[max(16px,env(safe-area-inset-bottom))] backdrop-blur-sm">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || isOwner === null}
          className="w-full rounded-2xl bg-[#3D6B3D] py-4 text-base font-bold text-white shadow-[0_4px_20px_rgba(61,107,61,0.4)] transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? "저장 중…" : "수정 완료"}
        </button>
      </footer>
    </div>
  );
}
