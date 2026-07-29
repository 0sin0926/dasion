import Link from "next/link";

export default function ReceiveCompletePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-page px-8 text-center">
      <span className="text-6xl">🎁</span>
      <h1 className="text-[22px] font-extrabold text-ink">물품을 받았어요!</h1>
      <p className="text-[14px] leading-6 text-muted">
        따뜻한 마음이 잘 전달됐어요.
        <br />
        수거 안내는 마이페이지에서 확인할 수 있어요.
      </p>
      <div className="mt-4 flex gap-3">
        <Link
          href="/my"
          className="inline-flex items-center justify-center rounded-2xl border border-forest px-6 py-3.5 text-[15px] font-bold text-forest transition-transform active:scale-[0.98]"
        >
          받은 물품 보기
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-2xl bg-forest px-6 py-3.5 text-[15px] font-bold text-white shadow-[0_4px_20px_rgba(52,103,57,0.35)] transition-transform active:scale-[0.98]"
        >
          홈으로 가기
        </Link>
      </div>
    </div>
  );
}
