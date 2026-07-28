import Image from "next/image";
import { MOCK_STATS } from "@/server/mock/items";

const STATS = [
  { value: MOCK_STATS.donated, label: "기부된 물품" },
  { value: MOCK_STATS.families, label: "참여 가정" },
  { value: MOCK_STATS.completed, label: "나눔 완료" },
];

export default function HeroSection() {
  return (
    <section className="px-5 pt-2">
      <div className="rounded-3xl bg-gradient-to-b from-mint to-mint-100 px-5 pt-5 pb-4">
        {/* 문구 + 마스코트 */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-[22px] font-bold leading-8 text-ink">
              아이들에게 따뜻한
              <br />
              나눔을 전하세요
            </h1>
            <p className="mt-2 text-[13px] leading-5 text-ink-40">
              사용하지 않는 물품으로
              <br />
              다른 아이에게 행복을 선물하세요
            </p>
          </div>
          <Image
            src="/characters/mascot-donate.png"
            alt="선물 상자를 든 다시온 마스코트"
            width={110}
            height={110}
            className="-mt-1 h-[104px] w-[104px] shrink-0 object-contain"
            priority
          />
        </div>

        {/* 통계 위젯 */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-white py-3 text-center shadow-sm"
            >
              <div className="text-xl font-extrabold text-forest">
                {s.value.toLocaleString()}
              </div>
              <div className="mt-0.5 text-[11px] text-ink-40">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
