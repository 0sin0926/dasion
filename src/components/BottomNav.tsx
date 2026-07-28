"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

function IconHome() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
    </svg>
  );
}
function IconRegion() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function IconRecord() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" />
    </svg>
  );
}

const TABS: Tab[] = [
  { href: "/", label: "홈", icon: <IconHome /> },
  { href: "/region", label: "지역", icon: <IconRegion /> },
  { href: "/record", label: "기록", icon: <IconRecord /> },
  { href: "/my", label: "내 정보", icon: <IconUser /> },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[var(--frame-max)] -translate-x-1/2 border-t border-line bg-white/95 backdrop-blur">
      <div className="relative grid grid-cols-5 items-end px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))]">
        {/* 좌측 2개 탭 */}
        {TABS.slice(0, 2).map((tab) => (
          <TabButton key={tab.href} tab={tab} active={pathname === tab.href} />
        ))}

        {/* 중앙 기부하기 FAB */}
        <div className="flex justify-center">
          <Link
            href="/register"
            className="-mt-8 flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-full bg-forest text-white shadow-lg shadow-forest/30 ring-4 ring-white transition-transform active:scale-95"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 8H4v12h16V8Z" />
              <path d="M2 8h20v3H2zM12 8V5M12 5a2 2 0 1 1 2-2c0 1.5-2 2-2 2ZM12 5a2 2 0 1 0-2-2c0 1.5 2 2 2 2ZM12 8v12" />
            </svg>
            <span className="text-[10px] font-semibold leading-none">기부하기</span>
          </Link>
        </div>

        {/* 우측 2개 탭 */}
        {TABS.slice(2).map((tab) => (
          <TabButton key={tab.href} tab={tab} active={pathname === tab.href} />
        ))}
      </div>
    </nav>
  );
}

function TabButton({ tab, active }: { tab: Tab; active: boolean }) {
  return (
    <Link
      href={tab.href}
      className={`flex flex-col items-center gap-1 py-1 text-[11px] font-medium transition-colors ${
        active ? "text-forest" : "text-ink-40"
      }`}
    >
      {tab.icon}
      <span>{tab.label}</span>
    </Link>
  );
}
