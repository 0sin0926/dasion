"use client";

import { useState, useSyncExternalStore } from "react";
import { isInAppBrowser, isKakaoInApp, openInExternalBrowser } from "@/lib/inAppBrowser";

// 인앱 여부는 클라이언트에서만 알 수 있다. useSyncExternalStore로 읽어
// 서버 스냅샷(false)→클라 스냅샷으로 안전하게 전환(hydration 불일치·effect setState 없음).
const subscribe = () => () => {};

/**
 * 카톡 등 인앱 브라우저로 들어온 경우에만 뜨는 상단 안내 배너.
 * 인앱에선 마이크(음성인식)가 막히므로, 버튼으로 정품 브라우저에서 다시 열게 유도한다.
 */
export default function InAppBrowserBanner() {
  const inApp = useSyncExternalStore(subscribe, isInAppBrowser, () => false);
  const [dismissed, setDismissed] = useState(false);

  if (!inApp || dismissed) return null;

  const kakao = isKakaoInApp();

  return (
    <div className="flex items-center gap-3 bg-forest px-4 py-3 text-white">
      <span className="text-lg" aria-hidden>
        🎤
      </span>
      <p className="flex-1 text-[12px] font-medium leading-snug">
        음성 녹음이 막혀 있어요.{" "}
        {kakao ? "크롬·사파리에서 열면" : "기본 브라우저에서 열면"} 음성으로 등록할 수 있어요.
      </p>
      <button
        type="button"
        onClick={openInExternalBrowser}
        className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-[12px] font-bold text-forest"
      >
        브라우저에서 열기
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="닫기"
        className="shrink-0 text-white/80"
      >
        ✕
      </button>
    </div>
  );
}
