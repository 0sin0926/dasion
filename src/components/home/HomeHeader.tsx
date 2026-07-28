import Image from "next/image";

export default function HomeHeader() {
  return (
    <header className="sticky top-0 z-30 bg-page/95 px-5 pt-5 pb-3 backdrop-blur">
      {/* 로고 행 — 피그마: 로고 50×46, "다시온" Hana2.0 24px #346739, 간격 11 */}
      <div className="flex items-center gap-[11px]">
        <span className="relative h-[46px] w-[46px] shrink-0 overflow-hidden rounded-full">
          <Image
            src="/characters/logo-168893.png"
            alt="다시온 로고"
            fill
            sizes="46px"
            className="object-cover"
          />
        </span>
        <span className="text-[24px] font-extrabold tracking-tight text-forest">
          다시온
        </span>
      </div>

      {/* 검색창 — 피그마: 361×48, radius 10, #F5F5F5, inset 그림자, placeholder Medium 14 #838383 */}
      <div className="mt-3 flex h-12 items-center gap-2.5 rounded-[10px] bg-[#F5F5F5] px-[17px] shadow-[inset_0_2px_2px_0_rgba(0,0,0,0.25)]">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="shrink-0 text-muted"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3-3" />
        </svg>
        <input
          type="text"
          placeholder="어떤 물건을 찾으시나요?"
          className="w-full bg-transparent text-[14px] font-medium text-ink outline-none placeholder:text-muted"
        />
      </div>
    </header>
  );
}
