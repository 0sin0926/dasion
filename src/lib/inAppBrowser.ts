// 인앱 브라우저(카카오톡 등 앱 내장 WebView) 감지 + 외부 브라우저로 탈출.
//
// 왜 필요한가: 카톡 링크로 들어오면 정품 브라우저가 아니라 카톡 WebView가 뜨는데,
// 여기선 마이크(getUserMedia/MediaRecorder)가 막혀 음성인식이 동작하지 않는다.
// → 인앱이면 안내 배너를 띄우고, 버튼으로 기본 브라우저/크롬에서 다시 열게 한다.

/** 잘 알려진 인앱 브라우저 UA 패턴 (소문자 기준) */
const IN_APP_PATTERNS = [
  "kakaotalk",
  "instagram",
  "fban",
  "fbav", // Facebook
  "line/",
  "naver(inapp",
  "everytimeapp",
  "daumapps",
  "band", // 밴드
];

/** 현재 브라우저가 인앱 WebView인지 */
export function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return IN_APP_PATTERNS.some((p) => ua.includes(p));
}

/** 카카오톡 인앱 브라우저인지(전용 탈출 스킴이 있어 따로 처리) */
export function isKakaoInApp(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.userAgent.toLowerCase().includes("kakaotalk");
}

/**
 * 현재 페이지를 외부(정품) 브라우저에서 다시 연다.
 * - 카카오톡: 전용 스킴 `kakaotalk://web/openExternal` → 기기 기본 브라우저로 탈출(양 플랫폼 안정적).
 * - 안드로이드(그 외): `intent://` 로 크롬을 지정해 강제.
 * - iOS(그 외): `googlechromes://` 로 크롬 시도(설치 시). 미설치면 무반응이라 최후 수단.
 */
export function openInExternalBrowser(): void {
  const url = window.location.href;
  const ua = navigator.userAgent.toLowerCase();

  if (isKakaoInApp()) {
    window.location.href =
      "kakaotalk://web/openExternal?url=" + encodeURIComponent(url);
    return;
  }

  if (ua.includes("android")) {
    const noScheme = url.replace(/^https?:\/\//, "");
    window.location.href = `intent://${noScheme}#Intent;scheme=https;package=com.android.chrome;end`;
    return;
  }

  // iOS 기타 인앱: 크롬 스킴(설치돼 있으면 크롬으로 열림)
  window.location.href = url
    .replace(/^https:\/\//, "googlechromes://")
    .replace(/^http:\/\//, "googlechrome://");
}
