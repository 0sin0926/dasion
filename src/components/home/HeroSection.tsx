import Image from "next/image";
import Link from "next/link";
import type { CommunityStats } from "@/server/items/queries";

export default function HeroSection({ stats }: { stats: CommunityStats }) {
  // href 가 있으면 해당 페이지로 이동하는 버튼, 없으면(참여 가정) 단순 표시
  const STATS: { value: number; label: string; href?: string }[] = [
    { value: stats.donated, label: "기부된 물품", href: "/items" },
    { value: stats.families, label: "참여 가정" },
    { value: stats.completed, label: "나눔 완료", href: "/items?status=completed" },
  ];

  return (
    // 히어로 초록 섹션 — 피그마 그라디언트: 180deg rgba(201,248,221,0.43) → rgba(204,236,199,1)
    <section className="bg-[linear-gradient(180deg,rgba(201,248,221,0.43)_0%,rgba(204,236,199,1)_100%)] px-6 pt-6 pb-6">
      {/* 문구 + 마스코트 — 헤딩 Bold 24/30 #333, 서브 SemiBold 13 #838383 */}
      <div className="flex items-start justify-between gap-1">
        <div className="pt-1">
          <h1 className="text-[24px] font-bold leading-[30px] text-ink">
            아이들에게 따뜻한
            <br />
            나눔을 전하세요
          </h1>
          <p className="mt-2 text-[13px] font-semibold leading-[22px] text-muted">
            사용하지 않는 물품으로
            <br />
            다른 아이에게 행복을 선물하세요
          </p>
        </div>
        <Image
          src="/characters/3.png"
          alt="하트 상자를 든 다시온 마스코트"
          width={160}
          height={160}
          priority
          className="-mr-2 mt-1 h-[150px] w-[150px] shrink-0 object-contain"
        />
      </div>

      {/* 통계 위젯 — 카드 radius 25, 그림자 0 2px 2px rgba(0,0,0,.25), 숫자 ExtraBold 24 #346739, 라벨 Bold 14 #838383
          링크가 있는 박스(기부된 물품/나눔 완료)는 눌러서 목록으로 이동 */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        {STATS.map((s) => {
          const inner = (
            <>
              <div className="text-[24px] font-extrabold leading-none text-forest">
                {s.value.toLocaleString()}
              </div>
              <div className="text-[14px] font-bold leading-none text-muted">
                {s.label}
              </div>
            </>
          );
          const boxClass =
            "flex flex-col items-center gap-[3px] rounded-[25px] bg-white py-[13px] shadow-[0_2px_2px_0_rgba(0,0,0,0.25)]";
          return s.href ? (
            <Link
              key={s.label}
              href={s.href}
              className={`${boxClass} transition-transform active:scale-[0.97]`}
            >
              {inner}
            </Link>
          ) : (
            <div key={s.label} className={boxClass}>
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}
