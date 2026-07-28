import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "다시온 — 아이가 전하는 따뜻한 나눔",
  description:
    "음성으로 물건을 등록하면 AI가 기부 게시글과 감사 편지를 대신 써주는 아동 물품 기부 플랫폼",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#346739",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {/*
          폰 프레임 셸: 모바일에선 화면 폭에 꽉 차고,
          데스크톱에선 가운데 480px 세로 프레임 + 그림자로 앱처럼 보임.
        */}
        <div className="relative mx-auto flex min-h-screen w-full max-w-[var(--frame-max)] flex-col bg-page shadow-[0_0_40px_rgba(0,0,0,0.06)]">
          {children}
        </div>
      </body>
    </html>
  );
}
