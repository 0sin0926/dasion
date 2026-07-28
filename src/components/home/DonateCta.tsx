import Image from "next/image";
import Link from "next/link";

export default function DonateCta() {
  return (
    <section className="px-4 pt-6">
      {/* 피그마: 카드 radius 40, bg rgba(171,234,198,.43), 보더 1px rgba(0,80,66,.44), 그림자 0 4px 4px rgba(0,0,0,.25) */}
      <div className="relative flex items-center justify-between overflow-hidden rounded-[40px] border border-[rgba(0,80,66,0.44)] bg-[rgba(171,234,198,0.43)] px-[42px] py-[38px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]">
        <div className="flex flex-col gap-[30px]">
          {/* 텍스트 그룹 — gap 15 */}
          <div className="flex flex-col gap-[15px]">
            <h3 className="text-[24px] font-extrabold leading-[30px] text-ink">
              기부할 물품이
              <br />
              있으신가요?
            </h3>
            <p className="text-[12px] font-semibold text-muted">
              지금 바로 나눔을 시작해보세요!
            </p>
          </div>
          {/* 버튼 — 127×44 radius 20 #346739, Medium 15 흰글씨 + 화살표 */}
          <Link
            href="/register"
            className="inline-flex h-11 w-[127px] items-center justify-center gap-1 rounded-[20px] bg-forest text-[15px] font-medium text-white shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] transition-transform active:scale-95"
          >
            기부하러 가기
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </Link>
        </div>
        {/* 마스코트 — 피그마 166×166 우측 */}
        <Image
          src="/characters/3.png"
          alt="하트 상자를 든 다시온 마스코트"
          width={166}
          height={166}
          className="pointer-events-none absolute -right-3 bottom-0 h-[150px] w-[150px] shrink-0 object-contain"
        />
      </div>
    </section>
  );
}
