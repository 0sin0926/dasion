import HomeHeader from "@/components/home/HomeHeader";
import HeroSection from "@/components/home/HeroSection";
import ItemFeed from "@/components/home/ItemFeed";
import DonateCta from "@/components/home/DonateCta";
import BottomNav from "@/components/BottomNav";
import { getItems, getCommunityStats } from "@/server/items/queries";
import type { CommunityStats } from "@/server/items/queries";
import type { Item } from "@/types/item";

// 피드/통계가 빌드 시점 값으로 고정되지 않도록 매 요청마다 최신 DB 값으로 렌더
export const dynamic = "force-dynamic";

export default async function Home() {
  // Supabase 에서 나눔 대기 물품 + 커뮤니티 통계를 조회.
  // 조회 실패(환경변수 누락/네트워크)여도 화면이 통째로 깨지지 않도록 기본값으로 대체.
  let items: Item[] = [];
  let stats: CommunityStats = { donated: 0, families: 0, completed: 0 };
  try {
    [items, stats] = await Promise.all([getItems(), getCommunityStats()]);
  } catch (err) {
    console.error("[home] 데이터 조회 실패:", err);
  }

  return (
    <>
      {/* 하단 탭 네비게이션에 가리지 않도록 pb 확보 */}
      <main className="flex-1 pb-28">
        <HomeHeader />
        <HeroSection stats={stats} />
        <ItemFeed items={items} />
        <DonateCta />
      </main>
      <BottomNav />
    </>
  );
}
