import Image from "next/image";

export default function HomeHeader() {
  return (
    <header className="sticky top-0 z-30 bg-page/95 px-5 pt-4 pb-3 backdrop-blur">
      {/* 로고 */}
      <div className="flex items-center gap-2">
        <span className="relative h-8 w-8 overflow-hidden rounded-full bg-mint">
          <Image
            src="/characters/mascot-wave.png"
            alt="다시온 마스코트"
            fill
            sizes="32px"
            className="scale-[1.7] object-cover object-top"
          />
        </span>
        <span className="text-xl font-bold tracking-tight text-forest">다시온</span>
      </div>

      {/* 검색창 */}
      <div className="mt-3 flex items-center gap-2 rounded-2xl bg-black/[0.04] px-4 py-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-ink-40">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3-3" />
        </svg>
        <input
          type="text"
          placeholder="어떤 물건을 찾으시나요?"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-40"
        />
      </div>
    </header>
  );
}
