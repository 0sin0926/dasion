import Image from "next/image";
import Link from "next/link";

export default function DonateCta() {
  return (
    <section className="px-5 pt-6">
      <div className="flex items-center justify-between gap-2 rounded-3xl bg-mint px-5 py-4">
        <div>
          <h3 className="text-[17px] font-bold text-ink">
            기부할 물품이 있으신가요?
          </h3>
          <p className="mt-1 text-[12px] text-ink-40">
            지금 바로 나눔을 시작해보세요!
          </p>
          <Link
            href="/register"
            className="mt-3 inline-flex items-center gap-1 rounded-full bg-forest px-4 py-2 text-[13px] font-semibold text-white transition-transform active:scale-95"
          >
            기부하러 가기
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </Link>
        </div>
        <Image
          src="/characters/mascot-donate.png"
          alt="하트 상자를 든 다시온 마스코트"
          width={96}
          height={96}
          className="h-24 w-24 shrink-0 object-contain"
        />
      </div>
    </section>
  );
}
