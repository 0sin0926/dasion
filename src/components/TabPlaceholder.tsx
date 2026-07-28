import BottomNav from "@/components/BottomNav";

/** 하단 탭에 연결된 화면의 "준비 중" 플레이스홀더 (탭이므로 BottomNav 유지) */
export default function TabPlaceholder({
  title,
  emoji,
  desc,
}: {
  title: string;
  emoji: string;
  desc: string;
}) {
  return (
    <>
      <main className="flex-1 pb-28">
        <header className="sticky top-0 z-30 bg-page/95 px-5 pt-5 pb-3 backdrop-blur">
          <h1 className="text-[22px] font-extrabold text-ink">{title}</h1>
        </header>
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
          <span className="text-5xl">{emoji}</span>
          <p className="text-[15px] font-bold text-ink">
            {title} 화면은 준비 중이에요
          </p>
          <p className="text-[13px] leading-6 text-muted">{desc}</p>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
