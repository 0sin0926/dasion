import Link from "next/link";

export default function RegisterCompletePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-page px-8 text-center">
      <span className="text-6xl">🎉</span>
      <h1 className="text-[22px] font-extrabold text-ink">등록이 완료됐어요!</h1>
      <p className="text-[14px] leading-6 text-muted">
        소중한 나눔이 피드에 올라갔어요.
        <br />
        받을 친구가 나타나면 알려드릴게요.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex items-center justify-center rounded-2xl bg-forest px-8 py-3.5 text-[15px] font-bold text-white shadow-[0_4px_20px_rgba(52,103,57,0.35)] transition-transform active:scale-[0.98]"
      >
        홈으로 가기
      </Link>
    </div>
  );
}
